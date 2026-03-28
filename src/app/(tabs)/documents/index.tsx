import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter, type RelativePathString } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n";
import {
  getTemplatesByCategory,
  type DocumentCategory,
} from "@/data/documentTemplates";
import {
  getAllDocuments,
  deleteDocument,
  type SavedDocument,
} from "@/features/documents/documentRepository";
import { charterPartyTemplates } from "@/data/charterPartyTemplates";
import {
  getAllCharterParties,
  deleteCharterParty,
  type SavedCharterParty,
} from "@/features/charter-party/cpRepository";

const CATEGORIES: { key: DocumentCategory; iconLabel: string }[] = [
  { key: "pre-arrival", iconLabel: "⚓" },
  { key: "post-voyage", iconLabel: "📋" },
  { key: "checklist", iconLabel: "✅" },
];

export default function DocumentsScreen() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [savedDocs, setSavedDocs] = useState<SavedDocument[]>([]);
  const [savedCps, setSavedCps] = useState<SavedCharterParty[]>([]);

  const loadData = useCallback(async () => {
    const [docResult, cpResult] = await Promise.all([
      getAllDocuments(),
      getAllCharterParties(),
    ]);
    if (docResult.success) setSavedDocs(docResult.data);
    if (cpResult.success) setSavedCps(cpResult.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const savedCountByTemplate = (templateId: string) =>
    savedDocs.filter((d) => d.templateId === templateId).length;

  const handleDeleteDoc = (doc: SavedDocument) => {
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
            loadData();
          },
        },
      ]
    );
  };

  const handleDeleteCp = (cp: SavedCharterParty) => {
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
            loadData();
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "text-amber-400";
      case "active": return "text-maritime-teal";
      case "completed": return "text-maritime-muted";
      default: return "text-maritime-white";
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

  const getCategoryLabel = (cat: DocumentCategory) => {
    switch (cat) {
      case "pre-arrival":
        return t("documents.preArrival");
      case "post-voyage":
        return t("documents.postVoyage");
      case "checklist":
        return t("documents.checklists");
    }
  };

  return (
    <ErrorBoundary>
      <ScreenContainer padded={false}>
        <View className="px-4">
          <Header
            title={t("documents.title")}
            subtitle={t("documents.subtitle")}
          />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        >
          {/* Charter Party Section */}
          <View className="mb-6">
            <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
              📄 {t("charterParty.title")}
            </Text>

            {charterPartyTemplates.map((cpTemplate) => {
              const cpsForTemplate = savedCps.filter(
                (cp) => cp.templateId === cpTemplate.id
              );

              return (
                <View key={cpTemplate.id} className="mb-3">
                  <Card>
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/documents/cp-form" as RelativePathString,
                          params: { templateId: cpTemplate.id },
                        })
                      }
                      className="min-h-[44px]"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 mr-3">
                          <Text className="text-maritime-white text-base font-semibold">
                            {cpTemplate.code}
                          </Text>
                          <Text className="text-maritime-muted text-sm mt-0.5">
                            {locale === "tr"
                              ? cpTemplate.nameTr
                              : cpTemplate.nameEn}
                          </Text>
                        </View>
                        <View className="bg-maritime-teal/20 rounded-full px-3 py-1">
                          <Text className="text-maritime-teal text-xs font-semibold">
                            {t("documents.newDoc")}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-maritime-muted text-xs mt-2">
                        {locale === "tr"
                          ? cpTemplate.descriptionTr
                          : cpTemplate.descriptionEn}
                      </Text>
                    </Pressable>

                    {cpsForTemplate.length > 0 && (
                      <View className="mt-3 pt-3 border-t border-maritime-border">
                        <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-2">
                          {t("documents.saved")} ({cpsForTemplate.length})
                        </Text>
                        {cpsForTemplate.map((cp) => (
                          <Pressable
                            key={cp.id}
                            onPress={() =>
                              router.push({
                                pathname:
                                  "/documents/cp-detail" as RelativePathString,
                                params: { cpId: cp.id },
                              })
                            }
                            onLongPress={() => handleDeleteCp(cp)}
                            className="flex-row items-center justify-between py-2 min-h-[40px]"
                          >
                            <View className="flex-1 flex-row items-center">
                              <Text
                                className="text-maritime-white text-sm flex-1"
                                numberOfLines={1}
                              >
                                {cp.title}
                              </Text>
                              <Text
                                className={`text-xs font-semibold mx-2 ${getStatusColor(cp.status)}`}
                              >
                                {getStatusLabel(cp.status)}
                              </Text>
                            </View>
                            <Text className="text-maritime-muted text-xs">
                              {new Date(cp.updatedAt).toLocaleDateString(
                                locale === "tr" ? "tr-TR" : "en-US"
                              )}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </Card>
                </View>
              );
            })}
          </View>

          {/* Document Templates */}
          {CATEGORIES.map(({ key: category, iconLabel }) => {
            const templates = getTemplatesByCategory(category);
            return (
              <View key={category} className="mb-6">
                <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                  {iconLabel} {getCategoryLabel(category)}
                </Text>

                {templates.map((template) => {
                  const count = savedCountByTemplate(template.id);
                  const docsForTemplate = savedDocs.filter(
                    (d) => d.templateId === template.id
                  );

                  return (
                    <View key={template.id} className="mb-3">
                      <Card>
                        <Pressable
                          onPress={() =>
                            router.push({
                              pathname: "/documents/form" as RelativePathString,
                              params: { templateId: template.id },
                            })
                          }
                          className="min-h-[44px]"
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-1 mr-3">
                              <Text className="text-maritime-white text-base font-semibold">
                                {template.abbreviation}
                              </Text>
                              <Text className="text-maritime-muted text-sm mt-0.5">
                                {locale === "tr"
                                  ? template.nameTr
                                  : template.nameEn}
                              </Text>
                            </View>
                            <View className="items-center">
                              <View className="bg-maritime-teal/20 rounded-full px-3 py-1">
                                <Text className="text-maritime-teal text-xs font-semibold">
                                  {t("documents.newDoc")}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <Text className="text-maritime-muted text-xs mt-2">
                            {locale === "tr"
                              ? template.descriptionTr
                              : template.descriptionEn}
                          </Text>
                        </Pressable>

                        {/* Saved documents for this template */}
                        {docsForTemplate.length > 0 && (
                          <View className="mt-3 pt-3 border-t border-maritime-border">
                            <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-2">
                              {t("documents.saved")} ({count})
                            </Text>
                            {docsForTemplate.map((doc) => (
                              <Pressable
                                key={doc.id}
                                onPress={() =>
                                  router.push({
                                    pathname:
                                      "/documents/[id]" as RelativePathString,
                                    params: { id: doc.id },
                                  })
                                }
                                onLongPress={() => handleDeleteDoc(doc)}
                                className="flex-row items-center justify-between py-2 min-h-[40px]"
                              >
                                <Text
                                  className="text-maritime-white text-sm flex-1"
                                  numberOfLines={1}
                                >
                                  {doc.title}
                                </Text>
                                <Text className="text-maritime-muted text-xs ml-2">
                                  {new Date(doc.updatedAt).toLocaleDateString(
                                    locale === "tr" ? "tr-TR" : "en-US"
                                  )}
                                </Text>
                              </Pressable>
                            ))}
                          </View>
                        )}
                      </Card>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      </ScreenContainer>
    </ErrorBoundary>
  );
}
