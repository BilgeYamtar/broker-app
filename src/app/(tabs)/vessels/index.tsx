import { useEffect, useCallback, useMemo } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter, type RelativePathString } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Spinner } from "@/components/ui/Spinner";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { useI18n } from "@/lib/i18n";
import { useVesselStore } from "@/features/vessel/useVesselStore";
import { useVesselFilters } from "@/features/vessel/useVesselFilters";
import { useSubscriptionStore } from "@/features/subscription/useSubscriptionStore";
import { VesselCard } from "@/features/vessel/components/VesselCard";
import { vesselTypes } from "@/data/vesselTypes";
import type { Vessel } from "@/features/vessel/vesselSchemas";

const vesselTypeOptions = vesselTypes.map((v) => ({ label: v, value: v }));

export default function VesselsScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const vessels = useVesselStore((s) => s.vessels);
  const isLoading = useVesselStore((s) => s.isLoading);
  const loadVessels = useVesselStore((s) => s.loadVessels);
  const canAddVessel = useSubscriptionStore((s) => s.canAddVessel);

  const {
    filters,
    filtered,
    hasActiveFilters,
    setSearch,
    setVesselType,
  } = useVesselFilters(vessels);

  useEffect(() => {
    loadVessels();
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Vessel }) => (
      <VesselCard
        vessel={item}
        onPress={() => router.push(`/vessels/${item.id}`)}
      />
    ),
    [router]
  );

  const keyExtractor = useCallback((item: Vessel) => item.id, []);

  const showEmptySource = !isLoading && vessels.length === 0;
  const showNoResults =
    !isLoading && vessels.length > 0 && filtered.length === 0 && hasActiveFilters;

  const listHeader = useMemo(
    () => (
      <View className="mb-3">
        <SearchBar
          value={filters.search}
          onChangeText={setSearch}
          placeholder={t("vessels.searchPlaceholder")}
        />
        <View className="flex-row gap-2">
          <FilterSelect
            label={t("vessels.vesselType")}
            options={vesselTypeOptions}
            value={filters.vesselType}
            onValueChange={setVesselType}
          />
        </View>
      </View>
    ),
    [filters.search, filters.vesselType, t]
  );

  return (
    <ErrorBoundary>
      <ScreenContainer>
        <Header
          title={t("vessels.title")}
          subtitle={t("vessels.subtitle")}
          rightAction={{
            label: t("vessels.newVessel"),
            onPress: () => {
              if (!canAddVessel(vessels.filter((v) => !v.isDemo).length)) {
                router.push("/paywall" as RelativePathString);
                return;
              }
              router.push("/vessels/new");
            },
          }}
        />
        {isLoading ? (
          <Spinner label={t("common.loading")} />
        ) : showEmptySource ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-maritime-muted text-sm">
              {t("vessels.noVessels")}
            </Text>
          </View>
        ) : (
          <FlashList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListHeaderComponent={listHeader}
            ListEmptyComponent={
              showNoResults ? (
                <View className="items-center justify-center py-12">
                  <Text className="text-maritime-muted text-sm">
                    {t("common.noResults")}
                  </Text>
                </View>
              ) : null
            }
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
          />
        )}
      </ScreenContainer>
    </ErrorBoundary>
  );
}
