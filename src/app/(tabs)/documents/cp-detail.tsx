import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Alert, Share } from "react-native";
import { useRouter, useLocalSearchParams, type RelativePathString } from "expo-router";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import {
  getCpTemplateById,
  calculateDemurrageDespatch,
  type CpTemplate,
  type CpField,
} from "@/data/charterPartyTemplates";
import {
  getCpById,
  deleteCharterParty,
  type SavedCharterParty,
} from "@/features/charter-party/cpRepository";

type SectionKey = CpField["section"];

const SECTION_ORDER: SectionKey[] = [
  "parties",
  "vessel",
  "cargo",
  "commercial",
  "laytime",
  "terms",
];

function fmt(value: number): string {
  return "$" + Math.round(value).toLocaleString("en-US");
}

export default function CpDetailScreen() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { cpId } = useLocalSearchParams<{ cpId: string }>();

  const [cp, setCp] = useState<SavedCharterParty | null>(null);
  const [template, setTemplate] = useState<CpTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cpId) return;
    getCpById(cpId).then((result) => {
      if (result.success) {
        setCp(result.data);
        const tmpl = getCpTemplateById(result.data.templateId);
        if (tmpl) setTemplate(tmpl);
      }
      setLoading(false);
    });
  }, [cpId]);

  const getSectionLabel = (section: SectionKey) => {
    switch (section) {
      case "parties": return t("charterParty.sectionParties");
      case "vessel": return t("charterParty.sectionVessel");
      case "cargo": return t("charterParty.sectionCargo");
      case "commercial": return t("charterParty.sectionCommercial");
      case "laytime": return t("charterParty.sectionLaytime");
      case "terms": return t("charterParty.sectionTerms");
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft": return t("charterParty.statusDraft");
      case "active": return t("charterParty.statusActive");
      case "completed": return t("charterParty.statusCompleted");
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "text-amber-400";
      case "active": return "text-maritime-teal";
      case "completed": return "text-maritime-muted";
      default: return "text-maritime-white";
    }
  };

  const handleEdit = () => {
    if (!cp) return;
    router.push({
      pathname: "/documents/cp-form" as RelativePathString,
      params: { cpId: cp.id },
    });
  };

  const handleDelete = () => {
    if (!cp) return;
    Alert.alert(
      t("common.deleteConfirmTitle"),
      t("common.deleteConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            await deleteCharterParty(cp.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleShare = useCallback(async () => {
    if (!cp || !template) return;

    const name = locale === "tr" ? template.nameTr : template.nameEn;
    const lines: string[] = [];
    lines.push(`═══ ${name} ═══`);
    lines.push(`${t("charterParty.status")}: ${getStatusLabel(cp.status)}`);
    lines.push("");

    // Group fields by section
    const grouped: Record<string, CpField[]> = {};
    for (const field of template.fields) {
      if (!grouped[field.section]) grouped[field.section] = [];
      grouped[field.section].push(field);
    }

    for (const section of SECTION_ORDER) {
      const fields = grouped[section];
      if (!fields) continue;
      const filled = fields.filter((f) => cp.fieldData[f.key]);
      if (filled.length === 0) continue;

      lines.push(`── ${getSectionLabel(section)} ──`);
      for (const field of filled) {
        const label = locale === "tr" ? field.labelTr : field.labelEn;
        lines.push(`${label}: ${cp.fieldData[field.key]}`);
      }
      lines.push("");
    }

    // Demurrage
    const laytime = parseFloat(cp.fieldData["laytimeHours"]);
    const actual = parseFloat(cp.fieldData["actualTimeUsed"]);
    const demRate = parseFloat(cp.fieldData["demurrageRate"]);
    if (laytime && actual && demRate) {
      const despRate = parseFloat(cp.fieldData["despatchRate"]) || demRate / 2;
      const result = calculateDemurrageDespatch(laytime, actual, demRate, despRate);
      lines.push(`── ${t("charterParty.demurrageCalc")} ──`);
      if (result.isDemurrage) {
        lines.push(`${t("charterParty.demurrageAmount")}: ${fmt(result.amount)}`);
      } else {
        lines.push(`${t("charterParty.despatchAmount")}: ${fmt(result.amount)}`);
      }
      lines.push("");
    }

    lines.push("--- Yük Portföyü ---");

    await Share.share({ message: lines.join("\n"), title: cp.title });
  }, [cp, template, locale, t]);

  if (loading) {
    return (
      <ScreenContainer>
        <Header title={t("common.loading")} showBack />
      </ScreenContainer>
    );
  }

  if (!cp || !template) {
    return (
      <ScreenContainer>
        <Header title={t("common.error")} showBack />
        <View className="items-center py-8">
          <Text className="text-maritime-muted">{t("common.noData")}</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Group fields
  const grouped: Record<string, CpField[]> = {};
  for (const field of template.fields) {
    if (!grouped[field.section]) grouped[field.section] = [];
    grouped[field.section].push(field);
  }

  // Demurrage calculation
  const laytime = parseFloat(cp.fieldData["laytimeHours"]);
  const actual = parseFloat(cp.fieldData["actualTimeUsed"]);
  const demRate = parseFloat(cp.fieldData["demurrageRate"]);
  const demurrageResult =
    laytime && actual && demRate
      ? calculateDemurrageDespatch(
          laytime,
          actual,
          demRate,
          parseFloat(cp.fieldData["despatchRate"]) || demRate / 2
        )
      : null;

  return (
    <ErrorBoundary>
      <ScreenContainer padded={false}>
        <View className="px-4">
          <Header title={template.code} showBack />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        >
          {/* Title & status */}
          <Card className="mb-4">
            <Text className="text-maritime-white text-lg font-semibold">
              {cp.title}
            </Text>
            <Text className="text-maritime-muted text-xs mt-1">
              {locale === "tr" ? template.nameTr : template.nameEn}
            </Text>
            <View className="flex-row items-center mt-2">
              <Text className="text-maritime-muted text-xs mr-2">
                {t("charterParty.status")}:
              </Text>
              <Text className={`text-xs font-semibold ${getStatusColor(cp.status)}`}>
                {getStatusLabel(cp.status)}
              </Text>
            </View>
            <Text className="text-maritime-muted text-xs mt-1">
              {t("documents.lastUpdated")}:{" "}
              {new Date(cp.updatedAt).toLocaleString(
                locale === "tr" ? "tr-TR" : "en-US"
              )}
            </Text>
          </Card>

          {/* Field sections */}
          {SECTION_ORDER.map((section) => {
            const fields = grouped[section];
            if (!fields) return null;
            const filled = fields.filter((f) => cp.fieldData[f.key]);
            if (filled.length === 0) return null;

            return (
              <Card key={section} className="mb-4">
                <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                  {getSectionLabel(section)}
                </Text>

                {filled.map((field) => {
                  const label = locale === "tr" ? field.labelTr : field.labelEn;
                  return (
                    <View
                      key={field.key}
                      className="flex-row justify-between py-2 border-b border-maritime-border"
                    >
                      <Text className="text-maritime-muted text-sm flex-1">
                        {label}
                      </Text>
                      <Text className="text-maritime-white text-sm font-medium flex-1 text-right">
                        {cp.fieldData[field.key]}
                      </Text>
                    </View>
                  );
                })}
              </Card>
            );
          })}

          {/* Demurrage/Despatch Result */}
          {demurrageResult && (
            <Card className="mb-4">
              <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                {t("charterParty.demurrageCalc")}
              </Text>

              <View className="flex-row items-center justify-between py-2">
                <Text className="text-maritime-muted text-sm">
                  {t("charterParty.allowedLaytime")}
                </Text>
                <Text className="text-maritime-white text-sm font-medium">
                  {demurrageResult.laytimeHours}h
                </Text>
              </View>
              <View className="border-b border-maritime-border" />
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-maritime-muted text-sm">
                  {t("charterParty.actualTime")}
                </Text>
                <Text className="text-maritime-white text-sm font-medium">
                  {demurrageResult.actualHours}h
                </Text>
              </View>

              <View
                className={`border-t-2 mt-2 pt-3 ${
                  demurrageResult.isDemurrage ? "border-red-500" : "border-maritime-teal"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-maritime-white text-base font-bold">
                    {demurrageResult.isDemurrage
                      ? t("charterParty.demurrageAmount")
                      : t("charterParty.despatchAmount")}
                  </Text>
                  <Text
                    className={`text-xl font-bold ${
                      demurrageResult.isDemurrage ? "text-red-400" : "text-maritime-teal"
                    }`}
                  >
                    {fmt(demurrageResult.amount)}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Actions */}
          <View className="gap-3 mb-4">
            <Button
              label={t("common.edit")}
              onPress={handleEdit}
              variant="primary"
              fullWidth
            />
            <Button
              label={t("charterParty.share")}
              onPress={handleShare}
              variant="secondary"
              fullWidth
            />
            <Button
              label={t("common.delete")}
              onPress={handleDelete}
              variant="danger"
              fullWidth
            />
          </View>
        </ScrollView>
      </ScreenContainer>
    </ErrorBoundary>
  );
}
