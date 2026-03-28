import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useI18n, type Locale } from "@/lib/i18n";
import {
  getPhotoStorageInfo,
  formatBytes,
  type StorageInfo,
} from "@/utils/photoUtils";
import { getDatabase } from "@/lib/database";
import { generateUUID } from "@/utils/uuid";

const languageOptions: { locale: Locale; label: string; flag: string }[] = [
  { locale: "tr", label: "Türkçe", flag: "TR" },
  { locale: "en", label: "English", flag: "EN" },
];

interface DiagResult {
  step: string;
  ok: boolean;
  detail: string;
}

export default function SettingsScreen() {
  const { t, locale, setLocale } = useI18n();
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [diagResults, setDiagResults] = useState<DiagResult[] | null>(null);
  const [diagRunning, setDiagRunning] = useState(false);

  const loadStorageInfo = useCallback(() => {
    setStorageInfo(getPhotoStorageInfo());
  }, []);

  useEffect(() => {
    loadStorageInfo();
  }, [loadStorageInfo]);

  const runDiagnostic = async () => {
    setDiagRunning(true);
    const results: DiagResult[] = [];

    // 1. UUID generation
    try {
      const uuid = generateUUID();
      results.push({ step: "UUID", ok: true, detail: uuid });
    } catch (e) {
      results.push({ step: "UUID", ok: false, detail: String(e) });
    }

    // 2. getDatabase()
    let db: ReturnType<typeof getDatabase> | null = null;
    try {
      db = getDatabase();
      results.push({ step: "getDatabase()", ok: true, detail: `path: ${db.databasePath}` });
    } catch (e) {
      results.push({ step: "getDatabase()", ok: false, detail: String(e) });
    }

    if (!db) {
      setDiagResults(results);
      setDiagRunning(false);
      return;
    }

    // 3. SELECT 1
    try {
      const row = db.getFirstSync<{ v: number }>("SELECT 1 as v");
      results.push({ step: "SELECT 1", ok: true, detail: `v=${row?.v}` });
    } catch (e) {
      results.push({ step: "SELECT 1", ok: false, detail: String(e) });
    }

    // 4. Count tables
    try {
      const tables = db.getAllSync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      );
      results.push({ step: "Tables", ok: true, detail: tables.map((t) => t.name).join(", ") });
    } catch (e) {
      results.push({ step: "Tables", ok: false, detail: String(e) });
    }

    // 5. Test INSERT into cargoes
    const testId = generateUUID();
    const now = new Date().toISOString();
    try {
      await db.runAsync(
        `INSERT INTO cargoes (id, cargo_name, cargo_type, weight_mt, volume_cbm, hazard_class, temperature_control, ventilation, is_demo, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [testId, "__diag_test__", "Liquid Bulk", 100, 120, "Non-Hazardous", 0, 0, 0, now, now]
      );
      results.push({ step: "INSERT cargo", ok: true, detail: `id=${testId}` });
    } catch (e) {
      results.push({ step: "INSERT cargo", ok: false, detail: String(e) });
    }

    // 6. Read it back
    try {
      const row = await db.getFirstAsync<{ id: string; cargo_name: string }>(
        "SELECT id, cargo_name FROM cargoes WHERE id = ?",
        [testId]
      );
      if (row) {
        results.push({ step: "SELECT cargo", ok: true, detail: `name=${row.cargo_name}` });
      } else {
        results.push({ step: "SELECT cargo", ok: false, detail: "Row not found after insert" });
      }
    } catch (e) {
      results.push({ step: "SELECT cargo", ok: false, detail: String(e) });
    }

    // 7. Delete test row
    try {
      await db.runAsync("DELETE FROM cargoes WHERE id = ?", [testId]);
      results.push({ step: "DELETE cargo", ok: true, detail: "cleaned up" });
    } catch (e) {
      results.push({ step: "DELETE cargo", ok: false, detail: String(e) });
    }

    setDiagResults(results);
    setDiagRunning(false);
  };

  return (
    <ErrorBoundary>
      <ScreenContainer padded={false}>
        <Header title={t("settings.title")} />

        <ScrollView className="flex-1 px-4">
          <Card className="mb-4">
            <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
              {t("settings.language")}
            </Text>
            <Text className="text-maritime-muted text-xs mb-4">
              {t("settings.languageDesc")}
            </Text>
            <View className="flex-row gap-3">
              {languageOptions.map((option) => (
                <Pressable
                  key={option.locale}
                  onPress={() => setLocale(option.locale)}
                  className={`flex-1 min-h-[44px] rounded-lg border items-center justify-center ${
                    locale === option.locale
                      ? "border-maritime-teal bg-maritime-teal-bg"
                      : "border-maritime-border bg-maritime-surface"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold mb-1 ${
                      locale === option.locale
                        ? "text-maritime-teal"
                        : "text-maritime-muted"
                    }`}
                  >
                    {option.flag}
                  </Text>
                  <Text
                    className={`text-sm font-medium ${
                      locale === option.locale
                        ? "text-maritime-teal"
                        : "text-maritime-white"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>

          {storageInfo && (
            <Card className="mb-4">
              <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                {t("settings.storage")}
              </Text>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-maritime-white text-sm">
                  {t("settings.photoCount")}
                </Text>
                <Text className="text-maritime-muted text-sm">
                  {storageInfo.photoCount}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-maritime-white text-sm">
                  {t("settings.photoStorage")}
                </Text>
                <Text className="text-maritime-muted text-sm">
                  {formatBytes(storageInfo.totalBytes)}
                </Text>
              </View>
            </Card>
          )}

          <Card className="mb-4">
            <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
              {t("settings.about")}
            </Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-maritime-white text-sm">
                {t("settings.version")}
              </Text>
              <Text className="text-maritime-muted text-sm">1.0.0</Text>
            </View>
          </Card>

          {/* Database Diagnostic */}
          <Card className="mb-8">
            <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
              DB Diagnostic
            </Text>
            <Button
              label={diagRunning ? "Running..." : "Run Diagnostic"}
              onPress={runDiagnostic}
              variant="secondary"
              disabled={diagRunning}
              fullWidth
            />
            {diagResults && (
              <View className="mt-3">
                {diagResults.map((r, i) => (
                  <View key={i} className="flex-row items-start py-1.5 border-b border-maritime-border">
                    <Text className={`text-xs font-bold w-5 ${r.ok ? "text-green-400" : "text-red-400"}`}>
                      {r.ok ? "✓" : "✗"}
                    </Text>
                    <Text className="text-maritime-white text-xs font-semibold w-24">
                      {r.step}
                    </Text>
                    <Text className="text-maritime-muted text-xs flex-1 flex-shrink" numberOfLines={3}>
                      {r.detail}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </ScrollView>
      </ScreenContainer>
    </ErrorBoundary>
  );
}
