import { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Share, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";
import { getAllVessels } from "@/features/vessel/vesselRepository";
import { getAllCargoes } from "@/features/cargo/cargoRepository";
import type { Vessel } from "@/features/vessel/vesselSchemas";
import type { Cargo } from "@/features/cargo/cargoSchemas";

type FreightType = "voyage" | "time" | "bareboat";

function fmt(value: number): string {
  return "$" + Math.round(value).toLocaleString("en-US");
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export default function FreightScreen() {
  const { t, locale } = useI18n();
  const params = useLocalSearchParams<{
    voyageDays?: string;
    dwtCapacity?: string;
  }>();

  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [cargoes, setCargoes] = useState<Cargo[]>([]);
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>(null);
  const [selectedCargoId, setSelectedCargoId] = useState<string | null>(null);

  const [freightType, setFreightType] = useState<FreightType>("voyage");

  // Voyage charter
  const [cargoQuantity, setCargoQuantity] = useState("");
  const [freightRate, setFreightRate] = useState("15");
  const [addressCommission, setAddressCommission] = useState("3.75");
  const [brokerageCommission, setBrokerageCommission] = useState("1.25");
  const [dwtCapacity, setDwtCapacity] = useState(params.dwtCapacity ?? "");
  const [deadfreightPct, setDeadfreightPct] = useState("100");

  // Time charter
  const [dailyHireRate, setDailyHireRate] = useState("15000");
  const [voyageDays, setVoyageDays] = useState(params.voyageDays ?? "");
  const [tcCommission, setTcCommission] = useState("2.5");

  // Bareboat
  const [bbDailyRate, setBbDailyRate] = useState("8000");
  const [charterPeriod, setCharterPeriod] = useState("365");

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

  const freightTypeOptions = [
    { label: t("freight.voyageCharter"), value: "voyage" },
    { label: t("freight.timeCharter"), value: "time" },
    { label: t("freight.bareboatCharter"), value: "bareboat" },
  ];

  const handleSelectVessel = (vesselId: string) => {
    setSelectedVesselId(vesselId);
    const vessel = vessels.find((v) => v.id === vesselId);
    if (vessel) {
      setDwtCapacity(String(vessel.dwtCapacity));
    }
  };

  const handleSelectCargo = (cargoId: string) => {
    setSelectedCargoId(cargoId);
    const cargo = cargoes.find((c) => c.id === cargoId);
    if (cargo) {
      setCargoQuantity(String(cargo.weightMt));
    }
  };

  // Voyage charter calculation
  const voyageResult = useMemo(() => {
    const qty = parseFloat(cargoQuantity) || 0;
    const rate = parseFloat(freightRate) || 0;
    const addrPct = parseFloat(addressCommission) || 0;
    const brkPct = parseFloat(brokerageCommission) || 0;
    const dwt = parseFloat(dwtCapacity) || 0;
    const dfPct = parseFloat(deadfreightPct) || 0;

    if (qty <= 0 || rate <= 0) return null;

    const grossFreight = qty * rate;
    const addressComm = grossFreight * (addrPct / 100);
    const brokerageComm = grossFreight * (brkPct / 100);
    const totalCommission = addressComm + brokerageComm;
    const netFreight = grossFreight - totalCommission;

    let deadfreight = 0;
    if (dwt > 0 && qty < dwt) {
      deadfreight = (dwt - qty) * rate * (dfPct / 100);
    }

    const days = parseFloat(voyageDays) || 0;
    const perDay = days > 0 ? netFreight / days : 0;

    return {
      grossFreight: Math.round(grossFreight),
      addressComm: Math.round(addressComm),
      brokerageComm: Math.round(brokerageComm),
      totalCommission: Math.round(totalCommission),
      netFreight: Math.round(netFreight),
      deadfreight: Math.round(deadfreight),
      perDay: Math.round(perDay),
    };
  }, [cargoQuantity, freightRate, addressCommission, brokerageCommission, dwtCapacity, deadfreightPct, voyageDays]);

  // Time charter calculation
  const timeResult = useMemo(() => {
    const rate = parseFloat(dailyHireRate) || 0;
    const days = parseFloat(voyageDays) || 0;
    const commPct = parseFloat(tcCommission) || 0;

    if (rate <= 0 || days <= 0) return null;

    const grossHire = days * rate;
    const commission = grossHire * (commPct / 100);
    const netToOwner = grossHire - commission;
    const perDay = netToOwner / days;

    return {
      grossHire: Math.round(grossHire),
      commission: Math.round(commission),
      netToOwner: Math.round(netToOwner),
      perDay: Math.round(perDay),
    };
  }, [dailyHireRate, voyageDays, tcCommission]);

  // Bareboat calculation
  const bbResult = useMemo(() => {
    const rate = parseFloat(bbDailyRate) || 0;
    const days = parseFloat(charterPeriod) || 0;

    if (rate <= 0 || days <= 0) return null;

    const totalHire = days * rate;
    const monthly = totalHire / (days / 30);
    const yearly = totalHire / (days / 365);

    return {
      totalHire: Math.round(totalHire),
      perDay: Math.round(rate),
      perMonth: Math.round(monthly),
      perYear: days >= 365 ? Math.round(yearly) : null,
    };
  }, [bbDailyRate, charterPeriod]);

  const handleShare = useCallback(async () => {
    const lines: string[] = [];
    lines.push(`═══ ${t("freight.title")} ═══`);
    lines.push("");

    if (freightType === "voyage" && voyageResult) {
      lines.push(`${t("freight.type")}: ${t("freight.voyageCharter")}`);
      lines.push(`${t("freight.cargoQuantity")}: ${cargoQuantity} t`);
      lines.push(`${t("freight.freightRate")}: $${freightRate}/t`);
      lines.push("");
      lines.push(`${t("freight.grossFreight")}: ${fmt(voyageResult.grossFreight)}`);
      lines.push(`${t("freight.addressComm")} (${addressCommission}%): -${fmt(voyageResult.addressComm)}`);
      lines.push(`${t("freight.brokerageComm")} (${brokerageCommission}%): -${fmt(voyageResult.brokerageComm)}`);
      lines.push(`${t("freight.netFreight")}: ${fmt(voyageResult.netFreight)}`);
      if (voyageResult.deadfreight > 0) {
        lines.push(`${t("freight.deadfreight")}: ${fmt(voyageResult.deadfreight)}`);
      }
      if (voyageResult.perDay > 0) {
        lines.push(`${t("freight.perDayEarnings")}: ${fmt(voyageResult.perDay)}`);
      }
    } else if (freightType === "time" && timeResult) {
      lines.push(`${t("freight.type")}: ${t("freight.timeCharter")}`);
      lines.push(`${t("freight.dailyHireRate")}: ${fmt(parseFloat(dailyHireRate))}`);
      lines.push(`${t("freight.voyageDays")}: ${voyageDays} ${t("freight.days")}`);
      lines.push("");
      lines.push(`${t("freight.grossHire")}: ${fmt(timeResult.grossHire)}`);
      lines.push(`${t("freight.commission")} (${tcCommission}%): -${fmt(timeResult.commission)}`);
      lines.push(`${t("freight.netToOwner")}: ${fmt(timeResult.netToOwner)}`);
      lines.push(`${t("freight.perDayEarnings")}: ${fmt(timeResult.perDay)}`);
    } else if (freightType === "bareboat" && bbResult) {
      lines.push(`${t("freight.type")}: ${t("freight.bareboatCharter")}`);
      lines.push(`${t("freight.bbDailyRate")}: ${fmt(parseFloat(bbDailyRate))}`);
      lines.push(`${t("freight.charterPeriod")}: ${charterPeriod} ${t("freight.days")}`);
      lines.push("");
      lines.push(`${t("freight.totalHire")}: ${fmt(bbResult.totalHire)}`);
      lines.push(`${t("freight.perDayEarnings")}: ${fmt(bbResult.perDay)}`);
      lines.push(`${t("freight.perMonth")}: ${fmt(bbResult.perMonth)}`);
    }

    lines.push("");
    lines.push("--- Yük Portföyü ---");

    await Share.share({ message: lines.join("\n"), title: t("freight.title") });
  }, [freightType, voyageResult, timeResult, bbResult, cargoQuantity, freightRate, addressCommission, brokerageCommission, dailyHireRate, voyageDays, tcCommission, bbDailyRate, charterPeriod, t]);

  const ResultRow = ({ label, value, bold, color }: { label: string; value: string; bold?: boolean; color?: string }) => (
    <View className="flex-row items-center justify-between py-2">
      <Text className={`text-sm ${bold ? "text-maritime-white font-bold" : "text-maritime-muted"}`}>
        {label}
      </Text>
      <Text className={`text-sm font-medium ${color ?? (bold ? "text-maritime-teal" : "text-maritime-white")}`} style={bold ? { fontSize: 18 } : undefined}>
        {value}
      </Text>
    </View>
  );

  const Divider = () => <View className="border-b border-maritime-border" />;

  return (
    <ErrorBoundary>
      <ScreenContainer padded={false}>
        <View className="px-4">
          <Header
            title={t("freight.title")}
            subtitle={t("freight.subtitle")}
            showBack
          />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Auto-fill */}
          <Card className="mb-4">
            <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
              {t("freight.autoFill")}
            </Text>
            <Select
              label={t("freight.selectVessel")}
              options={vesselOptions}
              value={selectedVesselId}
              onValueChange={handleSelectVessel}
              placeholder={t("feasibility.selectVesselPlaceholder")}
            />
            <Select
              label={t("freight.selectCargo")}
              options={cargoOptions}
              value={selectedCargoId}
              onValueChange={handleSelectCargo}
              placeholder={t("feasibility.selectCargoPlaceholder")}
            />
          </Card>

          {/* Freight Type */}
          <Card className="mb-4">
            <Select
              label={t("freight.type")}
              options={freightTypeOptions}
              value={freightType}
              onValueChange={(v) => setFreightType(v as FreightType)}
            />
          </Card>

          {/* ── VOYAGE CHARTER ── */}
          {freightType === "voyage" && (
            <>
              <Card className="mb-4">
                <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                  {t("freight.voyageCharter")}
                </Text>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Input
                      label={t("freight.cargoQuantity")}
                      value={cargoQuantity}
                      onChangeText={setCargoQuantity}
                      keyboardType="numeric"
                      placeholder="10000"
                    />
                  </View>
                  <View className="flex-1">
                    <Input
                      label={t("freight.freightRate")}
                      value={freightRate}
                      onChangeText={setFreightRate}
                      keyboardType="numeric"
                      placeholder="15"
                    />
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Input
                      label={t("freight.addressComm")}
                      value={addressCommission}
                      onChangeText={setAddressCommission}
                      keyboardType="numeric"
                      placeholder="3.75"
                    />
                  </View>
                  <View className="flex-1">
                    <Input
                      label={t("freight.brokerageComm")}
                      value={brokerageCommission}
                      onChangeText={setBrokerageCommission}
                      keyboardType="numeric"
                      placeholder="1.25"
                    />
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Input
                      label={t("freight.dwtCapacity")}
                      value={dwtCapacity}
                      onChangeText={setDwtCapacity}
                      keyboardType="numeric"
                      placeholder="50000"
                    />
                  </View>
                  <View className="flex-1">
                    <Input
                      label={t("freight.deadfreightPct")}
                      value={deadfreightPct}
                      onChangeText={setDeadfreightPct}
                      keyboardType="numeric"
                      placeholder="100"
                    />
                  </View>
                </View>

                <Input
                  label={t("freight.voyageDays")}
                  value={voyageDays}
                  onChangeText={setVoyageDays}
                  keyboardType="numeric"
                  placeholder="15"
                />
              </Card>

              {/* Voyage Result */}
              {voyageResult && (
                <Card className="mb-4">
                  <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                    {t("freight.summary")}
                  </Text>
                  <ResultRow label={t("freight.grossFreight")} value={fmt(voyageResult.grossFreight)} />
                  <Divider />
                  <ResultRow label={`${t("freight.addressComm")} (${addressCommission}%)`} value={`-${fmt(voyageResult.addressComm)}`} />
                  <Divider />
                  <ResultRow label={`${t("freight.brokerageComm")} (${brokerageCommission}%)`} value={`-${fmt(voyageResult.brokerageComm)}`} />
                  <Divider />
                  <ResultRow label={t("freight.totalCommission")} value={`-${fmt(voyageResult.totalCommission)}`} />

                  <View className="border-t-2 border-maritime-teal mt-2 pt-3">
                    <ResultRow label={t("freight.netFreight")} value={fmt(voyageResult.netFreight)} bold />
                  </View>

                  {voyageResult.deadfreight > 0 && (
                    <>
                      <Divider />
                      <ResultRow label={t("freight.deadfreight")} value={fmt(voyageResult.deadfreight)} color="text-amber-400" />
                    </>
                  )}

                  {voyageResult.perDay > 0 && (
                    <>
                      <Divider />
                      <ResultRow label={t("freight.perDayEarnings")} value={`${fmt(voyageResult.perDay)}/gün`} />
                    </>
                  )}
                </Card>
              )}
            </>
          )}

          {/* ── TIME CHARTER ── */}
          {freightType === "time" && (
            <>
              <Card className="mb-4">
                <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                  {t("freight.timeCharter")}
                </Text>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Input
                      label={t("freight.dailyHireRate")}
                      value={dailyHireRate}
                      onChangeText={setDailyHireRate}
                      keyboardType="numeric"
                      placeholder="15000"
                    />
                  </View>
                  <View className="flex-1">
                    <Input
                      label={t("freight.voyageDays")}
                      value={voyageDays}
                      onChangeText={setVoyageDays}
                      keyboardType="numeric"
                      placeholder="30"
                    />
                  </View>
                </View>

                <Input
                  label={t("freight.commission")}
                  value={tcCommission}
                  onChangeText={setTcCommission}
                  keyboardType="numeric"
                  placeholder="2.5"
                />
              </Card>

              {/* Time Charter Result */}
              {timeResult && (
                <Card className="mb-4">
                  <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                    {t("freight.summary")}
                  </Text>
                  <ResultRow label={t("freight.grossHire")} value={fmt(timeResult.grossHire)} />
                  <Divider />
                  <ResultRow label={`${t("freight.commission")} (${tcCommission}%)`} value={`-${fmt(timeResult.commission)}`} />

                  <View className="border-t-2 border-maritime-teal mt-2 pt-3">
                    <ResultRow label={t("freight.netToOwner")} value={fmt(timeResult.netToOwner)} bold />
                  </View>

                  <Divider />
                  <ResultRow label={t("freight.perDayEarnings")} value={`${fmt(timeResult.perDay)}/${t("freight.day")}`} />
                </Card>
              )}
            </>
          )}

          {/* ── BAREBOAT CHARTER ── */}
          {freightType === "bareboat" && (
            <>
              <Card className="mb-4">
                <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                  {t("freight.bareboatCharter")}
                </Text>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Input
                      label={t("freight.bbDailyRate")}
                      value={bbDailyRate}
                      onChangeText={setBbDailyRate}
                      keyboardType="numeric"
                      placeholder="8000"
                    />
                  </View>
                  <View className="flex-1">
                    <Input
                      label={t("freight.charterPeriod")}
                      value={charterPeriod}
                      onChangeText={setCharterPeriod}
                      keyboardType="numeric"
                      placeholder="365"
                    />
                  </View>
                </View>
              </Card>

              {/* Bareboat Result */}
              {bbResult && (
                <Card className="mb-4">
                  <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
                    {t("freight.summary")}
                  </Text>
                  <ResultRow label={t("freight.totalHire")} value={fmt(bbResult.totalHire)} />

                  <View className="border-t-2 border-maritime-teal mt-2 pt-3">
                    <ResultRow label={t("freight.perDayEarnings")} value={`${fmt(bbResult.perDay)}/${t("freight.day")}`} bold />
                  </View>

                  <Divider />
                  <ResultRow label={t("freight.perMonth")} value={fmt(bbResult.perMonth)} />
                  {bbResult.perYear !== null && (
                    <>
                      <Divider />
                      <ResultRow label={t("freight.perYear")} value={fmt(bbResult.perYear)} />
                    </>
                  )}
                </Card>
              )}
            </>
          )}

          {/* Share button */}
          <View className="mb-4">
            <Button
              label={t("freight.share")}
              onPress={handleShare}
              variant="secondary"
              fullWidth
              disabled={
                (freightType === "voyage" && !voyageResult) ||
                (freightType === "time" && !timeResult) ||
                (freightType === "bareboat" && !bbResult)
              }
            />
          </View>

          <View className="items-center py-4 mb-8">
            <Text className="text-maritime-muted text-xs text-center">
              {t("freight.disclaimer")}
            </Text>
          </View>
        </ScrollView>
      </ScreenContainer>
    </ErrorBoundary>
  );
}
