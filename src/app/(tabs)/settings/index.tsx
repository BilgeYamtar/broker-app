import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Card } from "@/components/ui/Card";
import { useI18n, type Locale } from "@/lib/i18n";
import {
  getPhotoStorageInfo,
  formatBytes,
  type StorageInfo,
} from "@/utils/photoUtils";

const languageOptions: { locale: Locale; label: string; flag: string }[] = [
  { locale: "tr", label: "Türkçe", flag: "TR" },
  { locale: "en", label: "English", flag: "EN" },
];

export default function SettingsScreen() {
  const { t, locale, setLocale } = useI18n();
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

  const loadStorageInfo = useCallback(() => {
    setStorageInfo(getPhotoStorageInfo());
  }, []);

  useEffect(() => {
    loadStorageInfo();
  }, [loadStorageInfo]);

  return (
    <ErrorBoundary>
      <ScreenContainer>
        <Header title={t("settings.title")} />

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

        <Card>
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
      </ScreenContainer>
    </ErrorBoundary>
  );
}
