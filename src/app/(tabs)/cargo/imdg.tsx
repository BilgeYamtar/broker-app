import { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n";
import { imdgClasses, type ImdgClass } from "@/data/imdgGuide";

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="text-maritime-teal text-xs uppercase tracking-widest font-semibold mt-4 mb-2">
      {title}
    </Text>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} className="flex-row mb-1.5">
          <Text className="text-maritime-muted text-xs mr-2">•</Text>
          <Text className="text-maritime-white text-xs flex-1 leading-5">
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ClassDetail({
  cls,
  labels,
}: {
  cls: ImdgClass;
  labels: Record<string, string>;
}) {
  return (
    <View className="mt-2">
      {/* Definition */}
      <Text className="text-maritime-white text-xs leading-5 mb-2">
        {cls.definition}
      </Text>

      {/* Subclasses */}
      <SectionTitle title={labels.subclasses} />
      {cls.subclasses.map((sub) => (
        <View
          key={sub.code}
          className="mb-2 bg-maritime-surface rounded-lg p-3"
        >
          <Text className="text-maritime-teal text-xs font-bold">
            {sub.code} — {sub.name}
          </Text>
          <Text className="text-maritime-muted text-xs mt-1 leading-4">
            {sub.description}
          </Text>
        </View>
      ))}

      {/* Stowage */}
      <SectionTitle title={labels.stowage} />
      <BulletList items={cls.stowage} />

      {/* Fire Response */}
      <SectionTitle title={labels.fireResponse} />
      <BulletList items={cls.fireResponse} />

      {/* Spill Response */}
      <SectionTitle title={labels.spillResponse} />
      <BulletList items={cls.spillResponse} />

      {/* PPE */}
      <SectionTitle title={labels.ppe} />
      <BulletList items={cls.ppe} />

      {/* Incompatible */}
      <SectionTitle title={labels.incompatible} />
      <BulletList items={cls.incompatible} />

      {/* Placard */}
      <SectionTitle title={labels.placardInfo} />
      <Text className="text-maritime-white text-xs leading-5">
        {cls.placardInfo}
      </Text>

      {/* Hold Preparation */}
      <SectionTitle title={labels.holdPreparation} />
      <BulletList items={cls.holdPreparation} />
    </View>
  );
}

export default function ImdgGuideScreen() {
  const { t } = useI18n();
  const { highlight } = useLocalSearchParams<{ highlight?: string }>();
  const [expandedClass, setExpandedClass] = useState<string | null>(
    highlight ?? null
  );
  const [search, setSearch] = useState("");

  const labels = useMemo(
    () => ({
      subclasses: t("imdg.subclasses"),
      stowage: t("imdg.stowage"),
      fireResponse: t("imdg.fireResponse"),
      spillResponse: t("imdg.spillResponse"),
      ppe: t("imdg.ppe"),
      incompatible: t("imdg.incompatible"),
      placardInfo: t("imdg.placardInfo"),
      holdPreparation: t("imdg.holdPreparation"),
    }),
    [t]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return imdgClasses;
    const q = search.toLowerCase();
    return imdgClasses.filter(
      (cls) =>
        cls.name.toLowerCase().includes(q) ||
        cls.classNumber.includes(q) ||
        cls.definition.toLowerCase().includes(q) ||
        cls.subclasses.some(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q)
        )
    );
  }, [search]);

  const toggleClass = useCallback(
    (classNumber: string) => {
      setExpandedClass((prev) =>
        prev === classNumber ? null : classNumber
      );
    },
    []
  );

  const severityBorder = (cls: ImdgClass) => {
    if (cls.severity === "critical") return "border-l-4 border-l-red-500";
    if (cls.severity === "high") return "border-l-4 border-l-amber-500";
    return "border-l-4 border-l-gray-500";
  };

  return (
    <ErrorBoundary>
      <ScreenContainer padded={false}>
        <View className="px-4">
          <Header
            title={t("imdg.title")}
            subtitle={t("imdg.subtitle")}
            showBack
          />
        </View>

        <View className="px-4 pb-2">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t("imdg.searchPlaceholder")}
            placeholderTextColor="#6B7280"
            className="h-10 rounded-lg border border-maritime-border bg-maritime-surface px-3 text-maritime-white text-sm"
          />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {filtered.map((cls) => {
            const isExpanded = expandedClass === cls.classNumber;
            return (
              <Card
                key={cls.classNumber}
                className={`mb-3 ${severityBorder(cls)}`}
              >
                <Pressable onPress={() => toggleClass(cls.classNumber)}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Text className="text-2xl mr-3">{cls.symbol}</Text>
                      <View className="flex-1">
                        <Text className="text-maritime-white text-sm font-bold">
                          Class {cls.classNumber}
                        </Text>
                        <Text className="text-maritime-muted text-xs mt-0.5">
                          {cls.name}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-maritime-muted text-lg">
                      {isExpanded ? "\u25B2" : "\u25BC"}
                    </Text>
                  </View>
                </Pressable>

                {isExpanded && (
                  <ClassDetail cls={cls} labels={labels} />
                )}
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <View className="items-center py-8">
              <Text className="text-maritime-muted text-sm">
                {t("common.noResults")}
              </Text>
            </View>
          )}
        </ScrollView>
      </ScreenContainer>
    </ErrorBoundary>
  );
}
