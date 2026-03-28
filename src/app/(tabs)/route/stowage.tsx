import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useI18n } from "@/lib/i18n";
import { getAllVessels } from "@/features/vessel/vesselRepository";
import { getAllCargoes } from "@/features/cargo/cargoRepository";
import type { Vessel } from "@/features/vessel/vesselSchemas";
import type { Cargo } from "@/features/cargo/cargoSchemas";

interface SfReference {
  nameEn: string;
  nameTr: string;
  min: number;
  max: number;
}

const SF_REFERENCE: SfReference[] = [
  { nameEn: "Iron ore", nameTr: "Demir cevheri", min: 0.33, max: 0.4 },
  { nameEn: "Coal", nameTr: "Kömür", min: 0.73, max: 0.8 },
  { nameEn: "Grain (wheat)", nameTr: "Tahıl (buğday)", min: 0.78, max: 0.82 },
  { nameEn: "Rice", nameTr: "Pirinç", min: 0.85, max: 0.95 },
  { nameEn: "Sugar", nameTr: "Şeker", min: 0.65, max: 0.75 },
  { nameEn: "Cement", nameTr: "Çimento", min: 0.65, max: 0.75 },
  { nameEn: "Timber / Lumber", nameTr: "Kereste", min: 1.5, max: 2.5 },
  { nameEn: "Cotton bales", nameTr: "Pamuk balyası", min: 1.8, max: 2.2 },
  { nameEn: "Crude oil", nameTr: "Ham petrol", min: 0.85, max: 0.95 },
  { nameEn: "Methanol", nameTr: "Metanol", min: 0.79, max: 0.79 },
  { nameEn: "Benzene", nameTr: "Benzen", min: 0.88, max: 0.88 },
];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export default function StowageScreen() {
  const { t, locale } = useI18n();

  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [cargoes, setCargoes] = useState<Cargo[]>([]);
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [selectedCargoId, setSelectedCargoId] = useState<string | null>(null);

  // SF calculator inputs
  const [cargoWeight, setCargoWeight] = useState("");
  const [cargoVolume, setCargoVolume] = useState("");

  // Volume calculator inputs
  const [holdLength, setHoldLength] = useState("");
  const [holdWidth, setHoldWidth] = useState("");
  const [holdHeight, setHoldHeight] = useState("");
  const [numberOfHolds, setNumberOfHolds] = useState("1");
  const [dwtCapacity, setDwtCapacity] = useState("");

  const [showRefTable, setShowRefTable] = useState(false);

  useEffect(() => {
    getAllVessels().then((r) => {
      if (r.success) setVessels(r.data);
    });
    getAllCargoes().then((r) => {
      if (r.success) setCargoes(r.data);
    });
  }, []);

  const vesselOptions = useMemo(
    () =>
      vessels.map((v) => ({
        label: `${v.vesselName} (${v.dwtCapacity} DWT)`,
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

  // Auto-fill from vessel
  const handleSelectVessel = (vesselId: string) => {
    setSelectedVesselId(vesselId);
    const vessel = vessels.find((v) => v.id === vesselId);
    if (vessel) {
      setDwtCapacity(String(vessel.dwtCapacity));
    }
  };

  // Auto-fill from cargo
  const handleSelectCargo = (cargoId: string) => {
    setSelectedCargoId(cargoId);
    const cargo = cargoes.find((c) => c.id === cargoId);
    if (cargo) {
      setCargoWeight(String(cargo.weightMt));
      setCargoVolume(String(cargo.volumeCbm));
    }
  };

  // SF calculation
  const sfResult = useMemo(() => {
    const w = parseFloat(cargoWeight);
    const v = parseFloat(cargoVolume);
    if (!w || !v || w <= 0 || v <= 0) return null;
    const sf = v / w;
    return {
      sf: round2(sf),
      isHeavy: sf < 1.0,
    };
  }, [cargoWeight, cargoVolume]);

  // Volume/capacity calculation
  const volumeResult = useMemo(() => {
    const l = parseFloat(holdLength);
    const w = parseFloat(holdWidth);
    const h = parseFloat(holdHeight);
    const holds = parseInt(numberOfHolds) || 1;
    const dwt = parseFloat(dwtCapacity);
    const sf = sfResult?.sf;

    if (!l || !w || !h || l <= 0 || w <= 0 || h <= 0) return null;

    const totalVolume = round2(l * w * h * holds);

    let maxByVolume: number | null = null;
    if (sf && sf > 0) {
      maxByVolume = Math.round(totalVolume / sf);
    }

    let maxByWeight: number | null = null;
    if (dwt && dwt > 0) {
      maxByWeight = Math.round(dwt);
    }

    let limitingFactor: "weight" | "volume" | null = null;
    if (maxByVolume !== null && maxByWeight !== null) {
      limitingFactor = maxByVolume < maxByWeight ? "volume" : "weight";
    }

    return {
      totalVolume,
      maxByVolume,
      maxByWeight,
      limitingFactor,
    };
  }, [holdLength, holdWidth, holdHeight, numberOfHolds, dwtCapacity, sfResult]);

  return (
    <ErrorBoundary>
      <ScreenContainer padded={false}>
        <View className="px-4">
          <Header
            title={t("stowage.title")}
            subtitle={t("stowage.subtitle")}
            showBack
          />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Auto-fill selectors */}
          <Card className="mb-4">
            <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
              {t("stowage.autoFill")}
            </Text>

            <Select
              label={t("stowage.selectVessel")}
              options={vesselOptions}
              value={selectedVesselId}
              onValueChange={handleSelectVessel}
              placeholder={t("feasibility.selectVesselPlaceholder")}
            />
            <Select
              label={t("stowage.selectCargo")}
              options={cargoOptions}
              value={selectedCargoId}
              onValueChange={handleSelectCargo}
              placeholder={t("feasibility.selectCargoPlaceholder")}
            />
          </Card>

          {/* Stowage Factor Calculator */}
          <Card className="mb-4">
            <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
              {t("stowage.sfCalculator")}
            </Text>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  label={t("stowage.cargoWeight")}
                  value={cargoWeight}
                  onChangeText={setCargoWeight}
                  keyboardType="numeric"
                  placeholder="10000"
                />
              </View>
              <View className="flex-1">
                <Input
                  label={t("stowage.cargoVolume")}
                  value={cargoVolume}
                  onChangeText={setCargoVolume}
                  keyboardType="numeric"
                  placeholder="8000"
                />
              </View>
            </View>

            {/* SF Result */}
            {sfResult && (
              <View className="mt-2 pt-3 border-t border-maritime-border">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-maritime-muted text-sm">
                    Stowage Factor (SF)
                  </Text>
                  <Text className="text-maritime-teal text-xl font-bold">
                    {sfResult.sf} m³/t
                  </Text>
                </View>

                <View
                  className={`rounded-lg px-3 py-2 ${
                    sfResult.isHeavy
                      ? "bg-amber-900/30"
                      : "bg-blue-900/30"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      sfResult.isHeavy
                        ? "text-amber-400"
                        : "text-blue-400"
                    }`}
                  >
                    {sfResult.isHeavy
                      ? t("stowage.heavyCargo")
                      : t("stowage.measurementCargo")}
                  </Text>
                  <Text className="text-maritime-muted text-xs mt-1">
                    {sfResult.isHeavy
                      ? t("stowage.heavyCargoDesc")
                      : t("stowage.measurementCargoDesc")}
                  </Text>
                </View>
              </View>
            )}
          </Card>

          {/* SF Reference Table */}
          <Pressable onPress={() => setShowRefTable(!showRefTable)}>
            <Card className="mb-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-maritime-muted text-xs uppercase tracking-widest">
                  {t("stowage.referenceTable")}
                </Text>
                <Text className="text-maritime-muted text-sm">
                  {showRefTable ? "▲" : "▼"}
                </Text>
              </View>

              {showRefTable && (
                <View className="mt-3">
                  {/* Table header */}
                  <View className="flex-row py-2 border-b border-maritime-border">
                    <Text className="flex-1 text-maritime-muted text-xs font-semibold uppercase">
                      {t("stowage.cargoType")}
                    </Text>
                    <Text className="w-24 text-maritime-muted text-xs font-semibold uppercase text-right">
                      SF (m³/t)
                    </Text>
                  </View>

                  {SF_REFERENCE.map((item) => (
                    <Pressable
                      key={item.nameEn}
                      onPress={() => {
                        const avgSf = (item.min + item.max) / 2;
                        if (cargoWeight) {
                          const w = parseFloat(cargoWeight);
                          if (w > 0) {
                            setCargoVolume(String(round2(w * avgSf)));
                          }
                        }
                      }}
                      className="flex-row py-2.5 border-b border-maritime-border/50 min-h-[40px] items-center"
                    >
                      <Text className="flex-1 text-maritime-white text-sm">
                        {locale === "tr" ? item.nameTr : item.nameEn}
                      </Text>
                      <Text className="w-24 text-maritime-muted text-sm text-right">
                        {item.min === item.max
                          ? item.min.toFixed(2)
                          : `${item.min.toFixed(2)} – ${item.max.toFixed(2)}`}
                      </Text>
                    </Pressable>
                  ))}

                  <Text className="text-maritime-muted text-xs mt-2 text-center">
                    {t("stowage.tapToApply")}
                  </Text>
                </View>
              )}
            </Card>
          </Pressable>

          {/* Volume / Capacity Calculator */}
          <Card className="mb-4">
            <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
              {t("stowage.volumeCalculator")}
            </Text>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  label={t("stowage.holdLength")}
                  value={holdLength}
                  onChangeText={setHoldLength}
                  keyboardType="numeric"
                  placeholder="25"
                />
              </View>
              <View className="flex-1">
                <Input
                  label={t("stowage.holdWidth")}
                  value={holdWidth}
                  onChangeText={setHoldWidth}
                  keyboardType="numeric"
                  placeholder="15"
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  label={t("stowage.holdHeight")}
                  value={holdHeight}
                  onChangeText={setHoldHeight}
                  keyboardType="numeric"
                  placeholder="12"
                />
              </View>
              <View className="flex-1">
                <Input
                  label={t("stowage.numHolds")}
                  value={numberOfHolds}
                  onChangeText={setNumberOfHolds}
                  keyboardType="numeric"
                  placeholder="1"
                />
              </View>
            </View>

            <Input
              label={t("stowage.dwtCapacity")}
              value={dwtCapacity}
              onChangeText={setDwtCapacity}
              keyboardType="numeric"
              placeholder="50000"
            />

            {/* Volume Result */}
            {volumeResult && (
              <View className="mt-2 pt-3 border-t border-maritime-border">
                <View className="flex-row items-center justify-between py-1.5">
                  <Text className="text-maritime-muted text-sm">
                    {t("stowage.totalHoldVolume")}
                  </Text>
                  <Text className="text-maritime-white text-base font-bold">
                    {volumeResult.totalVolume.toLocaleString()} m³
                  </Text>
                </View>

                {volumeResult.maxByVolume !== null && (
                  <>
                    <View className="border-b border-maritime-border" />
                    <View className="flex-row items-center justify-between py-1.5">
                      <Text className="text-maritime-muted text-sm">
                        {t("stowage.maxByVolume")}
                      </Text>
                      <Text className="text-maritime-white text-base font-medium">
                        {volumeResult.maxByVolume.toLocaleString()} t
                      </Text>
                    </View>
                  </>
                )}

                {volumeResult.maxByWeight !== null && (
                  <>
                    <View className="border-b border-maritime-border" />
                    <View className="flex-row items-center justify-between py-1.5">
                      <Text className="text-maritime-muted text-sm">
                        {t("stowage.maxByWeight")}
                      </Text>
                      <Text className="text-maritime-white text-base font-medium">
                        {volumeResult.maxByWeight.toLocaleString()} t
                      </Text>
                    </View>
                  </>
                )}

                {volumeResult.limitingFactor && (
                  <>
                    <View className="border-t-2 border-maritime-teal mt-2 pt-3">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-maritime-white text-sm font-bold">
                          {t("stowage.limitingFactor")}
                        </Text>
                        <Text
                          className={`text-base font-bold ${
                            volumeResult.limitingFactor === "weight"
                              ? "text-amber-400"
                              : "text-blue-400"
                          }`}
                        >
                          {volumeResult.limitingFactor === "weight"
                            ? t("stowage.limitWeight")
                            : t("stowage.limitVolume")}
                        </Text>
                      </View>
                      <Text className="text-maritime-muted text-xs mt-1">
                        {volumeResult.limitingFactor === "weight"
                          ? t("stowage.limitWeightDesc")
                          : t("stowage.limitVolumeDesc")}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}
          </Card>

          <View className="items-center py-4 mb-8">
            <Text className="text-maritime-muted text-xs text-center">
              {t("stowage.disclaimer")}
            </Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    </ErrorBoundary>
  );
}
