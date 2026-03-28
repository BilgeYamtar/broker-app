import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, ScrollView, Alert, Share } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useI18n } from "@/lib/i18n";
import {
  getCpTemplateById,
  calculateDemurrageDespatch,
  type CpTemplate,
  type CpField,
  type CpStatus,
} from "@/data/charterPartyTemplates";
import {
  createCharterParty,
  updateCharterParty,
  getCpById,
  type SavedCharterParty,
} from "@/features/charter-party/cpRepository";
import { getAllVessels } from "@/features/vessel/vesselRepository";
import { getAllCargoes } from "@/features/cargo/cargoRepository";
import type { Vessel } from "@/features/vessel/vesselSchemas";
import type { Cargo } from "@/features/cargo/cargoSchemas";

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

export default function CpFormScreen() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams<{
    templateId?: string;
    cpId?: string;
  }>();

  const [template, setTemplate] = useState<CpTemplate | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [existingCp, setExistingCp] = useState<SavedCharterParty | null>(null);
  const [status, setStatus] = useState<CpStatus>("draft");

  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [cargoes, setCargoes] = useState<Cargo[]>([]);
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [selectedCargoId, setSelectedCargoId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load template, vessels, cargoes
  useEffect(() => {
    if (params.cpId) {
      getCpById(params.cpId).then((result) => {
        if (result.success) {
          const cp = result.data;
          setExistingCp(cp);
          setFieldValues(cp.fieldData);
          setStatus(cp.status);
          setSelectedVesselId(cp.vesselId);
          setSelectedCargoId(cp.cargoId);
          const tmpl = getCpTemplateById(cp.templateId);
          if (tmpl) setTemplate(tmpl);
        }
      });
    } else if (params.templateId) {
      const tmpl = getCpTemplateById(params.templateId);
      if (tmpl) {
        setTemplate(tmpl);
        // Set defaults
        const defaults: Record<string, string> = {};
        for (const field of tmpl.fields) {
          if (field.defaultValue) {
            defaults[field.key] = field.defaultValue;
          }
        }
        setFieldValues(defaults);
      }
    }

    getAllVessels().then((r) => {
      if (r.success) setVessels(r.data);
    });
    getAllCargoes().then((r) => {
      if (r.success) setCargoes(r.data);
    });
  }, [params.templateId, params.cpId]);

  const vesselOptions = useMemo(
    () =>
      vessels.map((v) => ({
        label: `${v.vesselName} (IMO: ${v.imoNumber})`,
        value: v.id,
      })),
    [vessels]
  );

  const cargoOptions = useMemo(
    () =>
      cargoes.map((c) => ({
        label: `${c.cargoName} — ${c.weightMt} MT`,
        value: c.id,
      })),
    [cargoes]
  );

  const statusOptions = [
    { label: t("charterParty.statusDraft"), value: "draft" },
    { label: t("charterParty.statusActive"), value: "active" },
    { label: t("charterParty.statusCompleted"), value: "completed" },
  ];

  const handleSelectVessel = useCallback(
    (vesselId: string) => {
      setSelectedVesselId(vesselId);
      const vessel = vessels.find((v) => v.id === vesselId);
      if (!vessel || !template) return;

      const updates: Record<string, string> = {};
      for (const field of template.fields) {
        if (field.autoFillSource === "vessel" && field.autoFillKey) {
          const value = (vessel as Record<string, unknown>)[field.autoFillKey];
          if (value !== undefined && value !== null) {
            updates[field.key] = String(value);
          }
        }
      }
      setFieldValues((prev) => ({ ...prev, ...updates }));
    },
    [vessels, template]
  );

  const handleSelectCargo = useCallback(
    (cargoId: string) => {
      setSelectedCargoId(cargoId);
      const cargo = cargoes.find((c) => c.id === cargoId);
      if (!cargo || !template) return;

      const updates: Record<string, string> = {};
      for (const field of template.fields) {
        if (field.autoFillSource === "cargo" && field.autoFillKey) {
          const value = (cargo as Record<string, unknown>)[field.autoFillKey];
          if (value !== undefined && value !== null) {
            updates[field.key] = String(value);
          }
        }
      }
      setFieldValues((prev) => ({ ...prev, ...updates }));
    },
    [cargoes, template]
  );

  const setField = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  const getFieldLabel = (field: CpField) =>
    locale === "tr" ? field.labelTr : field.labelEn;

  // Group fields by section
  const fieldsBySection = useMemo(() => {
    if (!template) return {};
    const grouped: Record<string, CpField[]> = {};
    for (const field of template.fields) {
      if (!grouped[field.section]) grouped[field.section] = [];
      grouped[field.section].push(field);
    }
    return grouped;
  }, [template]);

  const getSectionLabel = (section: SectionKey) => {
    switch (section) {
      case "parties":
        return t("charterParty.sectionParties");
      case "vessel":
        return t("charterParty.sectionVessel");
      case "cargo":
        return t("charterParty.sectionCargo");
      case "commercial":
        return t("charterParty.sectionCommercial");
      case "laytime":
        return t("charterParty.sectionLaytime");
      case "terms":
        return t("charterParty.sectionTerms");
    }
  };

  // Demurrage/Despatch calculation
  const demurrageResult = useMemo(() => {
    const laytime = parseFloat(fieldValues["laytimeHours"]);
    const actual = parseFloat(fieldValues["actualTimeUsed"]);
    const demRate = parseFloat(fieldValues["demurrageRate"]);
    const despRate = parseFloat(fieldValues["despatchRate"]);

    if (!laytime || !actual || !demRate) return null;

    return calculateDemurrageDespatch(
      laytime,
      actual,
      demRate,
      despRate || demRate / 2
    );
  }, [fieldValues]);

  const handleSave = useCallback(async () => {
    if (!template) return;

    const vesselName = fieldValues["vesselName"] || "";
    const charterer = fieldValues["chartererName"] || "";
    const title = vesselName && charterer
      ? `${template.code} — ${vesselName} / ${charterer}`
      : `${template.code} — ${new Date().toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US")}`;

    setSaving(true);
    try {
      const cpData = {
        templateId: template.id,
        title,
        status,
        vesselId: selectedVesselId,
        cargoId: selectedCargoId,
        fieldData: fieldValues,
      };

      let result;
      if (existingCp) {
        result = await updateCharterParty(existingCp.id, cpData);
      } else {
        result = await createCharterParty(cpData);
      }

      if (result.success) {
        router.back();
      } else {
        Alert.alert(t("common.error"), t("errors.saveFailed"));
      }
    } catch {
      Alert.alert(t("common.error"), t("errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  }, [template, fieldValues, status, selectedVesselId, selectedCargoId, existingCp, locale, router, t]);

  const handleShare = useCallback(async () => {
    if (!template) return;

    const name = locale === "tr" ? template.nameTr : template.nameEn;
    const lines: string[] = [];
    lines.push(`═══ ${name} ═══`);
    lines.push("");

    for (const section of SECTION_ORDER) {
      const fields = fieldsBySection[section];
      if (!fields) continue;

      const filledFields = fields.filter((f) => fieldValues[f.key]);
      if (filledFields.length === 0) continue;

      lines.push(`── ${getSectionLabel(section)} ──`);
      for (const field of filledFields) {
        lines.push(`${getFieldLabel(field)}: ${fieldValues[field.key]}`);
      }
      lines.push("");
    }

    // Demurrage result
    if (demurrageResult) {
      lines.push(`── ${t("charterParty.demurrageCalc")} ──`);
      if (demurrageResult.isDemurrage) {
        lines.push(`${t("charterParty.demurrageAmount")}: ${fmt(demurrageResult.amount)}`);
        lines.push(`${t("charterParty.overtimeHours")}: ${demurrageResult.differenceHours} ${t("charterParty.hours")}`);
      } else {
        lines.push(`${t("charterParty.despatchAmount")}: ${fmt(demurrageResult.amount)}`);
        lines.push(`${t("charterParty.savedHours")}: ${demurrageResult.differenceHours} ${t("charterParty.hours")}`);
      }
      lines.push("");
    }

    lines.push(`${t("charterParty.status")}: ${statusOptions.find((o) => o.value === status)?.label}`);
    lines.push("");
    lines.push("--- Yük Portföyü ---");

    await Share.share({ message: lines.join("\n"), title: name });
  }, [template, fieldValues, fieldsBySection, demurrageResult, status, locale, t]);

  if (!template) {
    return (
      <ScreenContainer>
        <Header title={t("common.loading")} showBack />
      </ScreenContainer>
    );
  }

  const templateName = locale === "tr" ? template.nameTr : template.nameEn;

  return (
    <ErrorBoundary>
      <ScreenContainer padded={false}>
        <View className="px-4">
          <Header
            title={existingCp ? t("charterParty.editCp") : template.code}
            showBack
          />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Template info */}
          <Card className="mb-4">
            <Text className="text-maritime-white text-base font-semibold">
              {templateName}
            </Text>
            <Text className="text-maritime-muted text-xs mt-1">
              {locale === "tr" ? template.usageTr : template.usageEn}
            </Text>
          </Card>

          {/* Status + Auto-fill */}
          <Card className="mb-4">
            <Select
              label={t("charterParty.status")}
              options={statusOptions}
              value={status}
              onValueChange={(v) => setStatus(v as CpStatus)}
            />

            <Select
              label={t("charterParty.selectVessel")}
              options={vesselOptions}
              value={selectedVesselId}
              onValueChange={handleSelectVessel}
              placeholder={t("feasibility.selectVesselPlaceholder")}
            />

            <Select
              label={t("charterParty.selectCargo")}
              options={cargoOptions}
              value={selectedCargoId}
              onValueChange={handleSelectCargo}
              placeholder={t("feasibility.selectCargoPlaceholder")}
            />
          </Card>

          {/* Field sections */}
          {SECTION_ORDER.map((section) => {
            const fields = fieldsBySection[section];
            if (!fields || fields.length === 0) return null;

            return (
              <Card key={section} className="mb-4">
                <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                  {getSectionLabel(section)}
                </Text>

                {fields.map((field) => (
                  <Input
                    key={field.key}
                    label={getFieldLabel(field)}
                    value={fieldValues[field.key] ?? ""}
                    onChangeText={(v) => setField(field.key, v)}
                    keyboardType={field.type === "number" ? "numeric" : "default"}
                    multiline={field.type === "multiline"}
                    numberOfLines={field.type === "multiline" ? 3 : 1}
                    placeholder={
                      field.placeholder ??
                      (field.type === "datetime" ? "YYYY-MM-DD" : field.defaultValue ?? "")
                    }
                  />
                ))}
              </Card>
            );
          })}

          {/* Demurrage/Despatch Calculator */}
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
                  {demurrageResult.laytimeHours} {t("charterParty.hours")}
                </Text>
              </View>

              <View className="border-b border-maritime-border" />

              <View className="flex-row items-center justify-between py-2">
                <Text className="text-maritime-muted text-sm">
                  {t("charterParty.actualTime")}
                </Text>
                <Text className="text-maritime-white text-sm font-medium">
                  {demurrageResult.actualHours} {t("charterParty.hours")}
                </Text>
              </View>

              <View className="border-b border-maritime-border" />

              <View className="flex-row items-center justify-between py-2">
                <Text className="text-maritime-muted text-sm">
                  {demurrageResult.isDemurrage
                    ? t("charterParty.overtimeHours")
                    : t("charterParty.savedHours")}
                </Text>
                <Text className="text-maritime-white text-sm font-medium">
                  {demurrageResult.differenceHours} {t("charterParty.hours")}
                </Text>
              </View>

              <View
                className={`border-t-2 mt-2 pt-3 ${
                  demurrageResult.isDemurrage
                    ? "border-red-500"
                    : "border-maritime-teal"
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
                      demurrageResult.isDemurrage
                        ? "text-red-400"
                        : "text-maritime-teal"
                    }`}
                  >
                    {fmt(demurrageResult.amount)}
                  </Text>
                </View>
                <Text className="text-maritime-muted text-xs mt-1">
                  {demurrageResult.isDemurrage
                    ? t("charterParty.demurrageDesc")
                    : t("charterParty.despatchDesc")}
                </Text>
              </View>
            </Card>
          )}

          {/* Action buttons */}
          <View className="gap-3 mb-4">
            <Button
              label={t("common.save")}
              onPress={handleSave}
              variant="primary"
              loading={saving}
              fullWidth
            />
            <Button
              label={t("charterParty.share")}
              onPress={handleShare}
              variant="secondary"
              fullWidth
            />
          </View>
        </ScrollView>
      </ScreenContainer>
    </ErrorBoundary>
  );
}
