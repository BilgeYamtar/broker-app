import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Alert, Share } from "react-native";
import { useRouter, useLocalSearchParams, type RelativePathString } from "expo-router";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { getTemplateById, type DocumentTemplate } from "@/data/documentTemplates";
import {
  getDocumentById,
  deleteDocument,
  type SavedDocument,
} from "@/features/documents/documentRepository";

export default function DocumentDetailScreen() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [doc, setDoc] = useState<SavedDocument | null>(null);
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getDocumentById(id).then((result) => {
      if (result.success) {
        setDoc(result.data);
        const tmpl = getTemplateById(result.data.templateId);
        if (tmpl) setTemplate(tmpl);
      }
      setLoading(false);
    });
  }, [id]);

  const handleEdit = () => {
    if (!doc) return;
    router.push({
      pathname: "/documents/form" as RelativePathString,
      params: { documentId: doc.id, templateId: doc.templateId },
    });
  };

  const handleDelete = () => {
    if (!doc) return;
    Alert.alert(
      t("common.deleteConfirmTitle"),
      t("common.deleteConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            await deleteDocument(doc.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleShare = useCallback(async () => {
    if (!doc || !template) return;

    const lines: string[] = [];
    const name = locale === "tr" ? template.nameTr : template.nameEn;
    lines.push(`═══ ${name} ═══`);
    lines.push("");

    if (template.fields) {
      for (const field of template.fields) {
        const value = doc.fieldData[field.key];
        if (value) {
          const label = locale === "tr" ? field.labelTr : field.labelEn;
          lines.push(`${label}: ${value}`);
        }
      }
    }

    if (template.checklist) {
      lines.push("");
      for (const item of template.checklist) {
        const checked = doc.checklistData[item.key] ? "✅" : "⬜";
        const label = locale === "tr" ? item.labelTr : item.labelEn;
        lines.push(`${checked} ${label}`);
      }
    }

    lines.push("");
    lines.push(`--- ${t("documents.generatedBy")} ---`);

    await Share.share({
      message: lines.join("\n"),
      title: doc.title,
    });
  }, [doc, template, locale, t]);

  if (loading) {
    return (
      <ScreenContainer>
        <Header title={t("common.loading")} showBack />
      </ScreenContainer>
    );
  }

  if (!doc || !template) {
    return (
      <ScreenContainer>
        <Header title={t("common.error")} showBack />
        <View className="items-center py-8">
          <Text className="text-maritime-muted">{t("common.noData")}</Text>
        </View>
      </ScreenContainer>
    );
  }

  const templateName = locale === "tr" ? template.nameTr : template.nameEn;

  return (
    <ErrorBoundary>
      <ScreenContainer padded={false}>
        <View className="px-4">
          <Header title={template.abbreviation} showBack />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        >
          {/* Title & meta */}
          <Card className="mb-4">
            <Text className="text-maritime-white text-lg font-semibold">
              {doc.title}
            </Text>
            <Text className="text-maritime-muted text-xs mt-1">
              {templateName}
            </Text>
            <Text className="text-maritime-muted text-xs mt-1">
              {t("documents.lastUpdated")}:{" "}
              {new Date(doc.updatedAt).toLocaleString(
                locale === "tr" ? "tr-TR" : "en-US"
              )}
            </Text>
          </Card>

          {/* Field values */}
          {template.fields && (
            <Card className="mb-4">
              <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                {t("documents.details")}
              </Text>

              {template.fields.map((field) => {
                const value = doc.fieldData[field.key];
                if (!value) return null;
                const label =
                  locale === "tr" ? field.labelTr : field.labelEn;

                return (
                  <View
                    key={field.key}
                    className="flex-row justify-between py-2 border-b border-maritime-border"
                  >
                    <Text className="text-maritime-muted text-sm flex-1">
                      {label}
                    </Text>
                    <Text className="text-maritime-white text-sm font-medium flex-1 text-right">
                      {value}
                    </Text>
                  </View>
                );
              })}
            </Card>
          )}

          {/* Checklist values */}
          {template.checklist && (
            <Card className="mb-4">
              <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                {templateName}
              </Text>

              {template.checklist.map((item) => {
                const checked = doc.checklistData[item.key] ?? false;
                const label =
                  locale === "tr" ? item.labelTr : item.labelEn;

                return (
                  <View
                    key={item.key}
                    className="flex-row items-center py-2 border-b border-maritime-border min-h-[40px]"
                  >
                    <Text className="mr-2">{checked ? "✅" : "⬜"}</Text>
                    <Text
                      className={`flex-1 text-sm ${
                        checked
                          ? "text-maritime-white"
                          : "text-maritime-muted"
                      }`}
                    >
                      {label}
                    </Text>
                  </View>
                );
              })}

              <View className="mt-3 pt-2">
                <Text className="text-maritime-muted text-xs text-center">
                  {
                    template.checklist.filter(
                      (item) => doc.checklistData[item.key]
                    ).length
                  }{" "}
                  / {template.checklist.length} {t("documents.completed")}
                </Text>
              </View>
            </Card>
          )}

          {/* Action buttons */}
          <View className="gap-3 mb-4">
            <Button
              label={t("common.edit")}
              onPress={handleEdit}
              variant="primary"
              fullWidth
            />
            <Button
              label={t("documents.share")}
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
