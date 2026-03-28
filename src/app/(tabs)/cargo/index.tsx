import { useEffect, useCallback, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Spinner } from "@/components/ui/Spinner";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { useI18n } from "@/lib/i18n";
import { useCargoStore } from "@/features/cargo/useCargoStore";
import { useCargoFilters } from "@/features/cargo/useCargoFilters";
import { CargoCard } from "@/features/cargo/components/CargoCard";
import { cargoTypes } from "@/data/cargoTypes";
import { hazardClasses } from "@/data/hazardClasses";
import type { Cargo } from "@/features/cargo/cargoSchemas";

const cargoTypeOptions = cargoTypes.map((t) => ({ label: t, value: t }));
const hazardClassOptions = hazardClasses.map((h) => ({ label: h, value: h }));

export default function CargoScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const cargoes = useCargoStore((s) => s.cargoes);
  const isLoading = useCargoStore((s) => s.isLoading);
  const loadCargoes = useCargoStore((s) => s.loadCargoes);

  const {
    filters,
    filtered,
    hasActiveFilters,
    setSearch,
    setCargoType,
    setHazardClass,
  } = useCargoFilters(cargoes);

  useEffect(() => {
    loadCargoes();
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Cargo }) => (
      <CargoCard
        cargo={item}
        onPress={() => router.push(`/cargo/${item.id}`)}
      />
    ),
    [router]
  );

  const keyExtractor = useCallback((item: Cargo) => item.id, []);

  const showEmptySource = !isLoading && cargoes.length === 0;
  const showNoResults =
    !isLoading && cargoes.length > 0 && filtered.length === 0 && hasActiveFilters;

  const listHeader = useMemo(
    () => (
      <View className="mb-3">
        <SearchBar
          value={filters.search}
          onChangeText={setSearch}
          placeholder={t("cargo.searchPlaceholder")}
        />
        <View className="flex-row gap-2">
          <FilterSelect
            label={t("cargo.cargoType")}
            options={cargoTypeOptions}
            value={filters.cargoType}
            onValueChange={setCargoType}
          />
          <FilterSelect
            label={t("cargo.hazardClass")}
            options={hazardClassOptions}
            value={filters.hazardClass}
            onValueChange={setHazardClass}
          />
        </View>
        <Pressable
          onPress={() => router.push("/cargo/imdg")}
          className="mt-2 flex-row items-center justify-center rounded-lg border border-maritime-border bg-maritime-surface py-2.5 px-3"
        >
          <Text className="text-maritime-teal text-xs font-medium">
            {"\u2622\uFE0F"} {t("imdg.guideButton")}
          </Text>
        </Pressable>
      </View>
    ),
    [filters.search, filters.cargoType, filters.hazardClass, t, router]
  );

  return (
    <ErrorBoundary>
      <ScreenContainer>
        <Header
          title={t("cargo.title")}
          subtitle={t("cargo.subtitle")}
          rightAction={{
            label: t("cargo.newCargo"),
            onPress: () => router.push("/cargo/new"),
          }}
        />
        {isLoading ? (
          <Spinner label={t("common.loading")} />
        ) : showEmptySource ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-maritime-muted text-sm">
              {t("cargo.noCargoes")}
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
