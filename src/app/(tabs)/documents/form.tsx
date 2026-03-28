import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, ScrollView, Pressable, Alert, Share } from "react-native";
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
  getTemplateById,
  type DocumentTemplate,
  type DocumentField,
} from "@/data/documentTemplates";
import {
  createDocument,
  updateDocument,
  getDocumentById,
  type SavedDocument,
} from "@/features/documents/documentRepository";
import { getAllVessels } from "@/features/vessel/vesselRepository";
import { getAllCargoes } from "@/features/cargo/cargoRepository";
import type { Vessel } from "@/features/vessel/vesselSchemas";
import type { Cargo } from "@/features/cargo/cargoSchemas";

export default function DocumentFormScreen() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams<{
    templateId?: string;
    documentId?: string;
  }>();

  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [checklistValues, setChecklistValues] = useState<
    Record<string, boolean>
  >({});
  const [existingDoc, setExistingDoc] = useState<SavedDocument | null>(null);

  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [cargoes, setCargoes] = useState<Cargo[]>([]);
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [selectedCargoId, setSelectedCargoId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  // Load template + vessels + cargoes
  useEffect(() => {
    const templateId = params.templateId ?? params.documentId;
    if (!templateId) return;

    // If editing existing document
    if (params.documentId) {
      getDocumentById(params.documentId).then((result) => {
        if (result.success) {
          const doc = result.data;
          setExistingDoc(doc);
          setFieldValues(doc.fieldData);
          setChecklistValues(doc.checklistData);
          setSelectedVesselId(doc.vesselId);
          setSelectedCargoId(doc.cargoId);
          const tmpl = getTemplateById(doc.templateId);
          if (tmpl) setTemplate(tmpl);
        }
      });
    } else {
      const tmpl = getTemplateById(templateId);
      if (tmpl) setTemplate(tmpl);
    }

    getAllVessels().then((r) => {
      if (r.success) setVessels(r.data);
    });
    getAllCargoes().then((r) => {
      if (r.success) setCargoes(r.data);
    });
  }, [params.templateId, params.documentId]);

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

  const selectedVessel = vessels.find((v) => v.id === selectedVesselId);
  const selectedCargo = cargoes.find((c) => c.id === selectedCargoId);

  // Auto-fill from vessel/cargo
  const handleSelectVessel = useCallback(
    (vesselId: string) => {
      setSelectedVesselId(vesselId);
      const vessel = vessels.find((v) => v.id === vesselId);
      if (!vessel || !template?.fields) return;

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
      if (!cargo || !template?.fields) return;

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

  const toggleChecklist = (key: string) => {
    setChecklistValues((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getFieldLabel = (field: DocumentField) =>
    locale === "tr" ? field.labelTr : field.labelEn;

  const handleSave = useCallback(async () => {
    if (!template) return;

    // Build title from vessel name or template abbreviation + date
    const vesselName = fieldValues["vesselName"] || "";
    const dateStr = new Date().toLocaleDateString(
      locale === "tr" ? "tr-TR" : "en-US"
    );
    const title = vesselName
      ? `${template.abbreviation} — ${vesselName} — ${dateStr}`
      : `${template.abbreviation} — ${dateStr}`;

    setSaving(true);
    try {
      const docData = {
        templateId: template.id,
        title,
        vesselId: selectedVesselId,
        cargoId: selectedCargoId,
        fieldData: fieldValues,
        checklistData: checklistValues,
      };

      let result;
      if (existingDoc) {
        result = await updateDocument(existingDoc.id, docData);
      } else {
        result = await createDocument(docData);
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
  }, [
    template,
    fieldValues,
    checklistValues,
    selectedVesselId,
    selectedCargoId,
    existingDoc,
    locale,
    router,
    t,
  ]);

  const handleShare = useCallback(async () => {
    if (!template) return;

    const lines: string[] = [];
    const name = locale === "tr" ? template.nameTr : template.nameEn;
    lines.push(`═══ ${name} ═══`);
    lines.push("");

    if (template.fields) {
      for (const field of template.fields) {
        const value = fieldValues[field.key];
        if (value) {
          lines.push(`${getFieldLabel(field)}: ${value}`);
        }
      }
    }

    if (template.checklist) {
      lines.push("");
      for (const item of template.checklist) {
        const checked = checklistValues[item.key] ? "✅" : "⬜";
        const label = locale === "tr" ? item.labelTr : item.labelEn;
        lines.push(`${checked} ${label}`);
      }
    }

    lines.push("");
    lines.push(
      `--- ${t("documents.generatedBy")} ---`
    );

    await Share.share({
      message: lines.join("\n"),
      title: name,
    });
  }, [template, fieldValues, checklistValues, locale, t]);

  if (!template) {
    return (
      <ScreenContainer>
        <Header title={t("common.loading")} showBack />
      </ScreenContainer>
    );
  }

  const templateName = locale === "tr" ? template.nameTr : template.nameEn;
  const isChecklist = template.category === "checklist";
  const hasAutoFillFields = template.fields?.some((f) => f.autoFillSource);

  return (
    <ErrorBoundary>
      <ScreenContainer padded={false}>
        <View className="px-4">
          <Header
            title={existingDoc ? t("documents.editDoc") : templateName}
            showBack
          />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Auto-fill selectors */}
          {hasAutoFillFields && (
            <Card className="mb-4">
              <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                {t("documents.autoFill")}
              </Text>

              {template.fields?.some(
                (f) => f.autoFillSource === "vessel"
              ) && (
                <Select
                  label={t("documents.selectVessel")}
                  options={vesselOptions}
                  value={selectedVesselId}
                  onValueChange={handleSelectVessel}
                  placeholder={t("feasibility.selectVesselPlaceholder")}
                />
              )}

              {template.fields?.some(
                (f) => f.autoFillSource === "cargo"
              ) && (
                <Select
                  label={t("documents.selectCargo")}
                  options={cargoOptions}
                  value={selectedCargoId}
                  onValueChange={handleSelectCargo}
                  placeholder={t("feasibility.selectCargoPlaceholder")}
                />
              )}
            </Card>
          )}

          {/* Document fields */}
          {template.fields && (
            <Card className="mb-4">
              <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                {templateName}
              </Text>

              {template.fields.map((field) => (
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
                    (field.type === "datetime" ? "YYYY-MM-DD HH:MM" : "")
                  }
                />
              ))}
            </Card>
          )}

          {/* Checklist */}
          {template.checklist && (
            <Card className="mb-4">
              <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                {templateName}
              </Text>

              {template.checklist.map((item) => {
                const checked = checklistValues[item.key] ?? false;
                const label =
                  locale === "tr" ? item.labelTr : item.labelEn;

                return (
                  <Pressable
                    key={item.key}
                    onPress={() => toggleChecklist(item.key)}
                    className="flex-row items-center py-3 border-b border-maritime-border min-h-[48px]"
                  >
                    <View
                      className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                        checked
                          ? "bg-maritime-teal border-maritime-teal"
                          : "border-maritime-muted"
                      }`}
                    >
                      {checked && (
                        <Text className="text-white text-xs font-bold">
                          ✓
                        </Text>
                      )}
                    </View>
                    <Text
                      className={`flex-1 text-sm ${
                        checked
                          ? "text-maritime-white"
                          : "text-maritime-muted"
                      }`}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}

              {/* Checklist progress */}
              {template.checklist.length > 0 && (
                <View className="mt-3 pt-2">
                  <Text className="text-maritime-muted text-xs text-center">
                    {
                      Object.values(checklistValues).filter(Boolean).length
                    }{" "}
                    / {template.checklist.length}{" "}
                    {t("documents.completed")}
                  </Text>
                </View>
              )}
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
              label={t("documents.share")}
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
