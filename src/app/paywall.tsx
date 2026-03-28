import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n";
import { useSubscriptionStore } from "@/features/subscription/useSubscriptionStore";
import {
  getAvailablePackages,
  purchasePackage,
  restorePurchases,
  type PackageInfo,
} from "@/services/subscriptionService";

const FREE_FEATURES = [
  { key: "vessels3", included: true },
  { key: "cargoes5", included: true },
  { key: "feasibility3", included: true },
  { key: "basicRoute", included: true },
  { key: "pdfExport", included: false },
  { key: "documents", included: false },
  { key: "charterParty", included: false },
  { key: "preVoyage", included: false },
  { key: "freightCalc", included: false },
  { key: "stowageCalc", included: false },
  { key: "imdgFull", included: false },
];

const PREMIUM_FEATURES = [
  "unlimitedVessels",
  "unlimitedCargoes",
  "unlimitedFeasibility",
  "pdfExport",
  "allDocuments",
  "charterParty",
  "preVoyage",
  "freightCalc",
  "stowageCalc",
  "imdgFull",
  "prioritySupport",
];

export default function PaywallScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const setSubscription = useSubscriptionStore((s) => s.setSubscription);

  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "yearly">("yearly");
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);

  useEffect(() => {
    getAvailablePackages().then((pkgs) => {
      setPackages(pkgs);
      setLoadingPackages(false);
    });
  }, []);

  const selectedPackage = packages.find((p) => p.period === selectedPeriod);

  const handlePurchase = useCallback(async () => {
    if (!selectedPackage) return;

    setPurchasing(true);
    try {
      const info = await purchasePackage(selectedPackage.identifier);
      setSubscription(info);
      if (info.isPremium) {
        router.back();
      }
    } catch (err: unknown) {
      const error = err as { userCancelled?: boolean };
      if (!error.userCancelled) {
        Alert.alert(t("common.error"), t("subscription.purchaseFailed"));
      }
    } finally {
      setPurchasing(false);
    }
  }, [selectedPackage, setSubscription, router, t]);

  const handleRestore = useCallback(async () => {
    setRestoring(true);
    try {
      const info = await restorePurchases();
      setSubscription(info);
      if (info.isPremium) {
        Alert.alert(t("subscription.restored"), t("subscription.restoredDesc"));
        router.back();
      } else {
        Alert.alert(t("subscription.noSubscription"), t("subscription.noSubscriptionDesc"));
      }
    } catch {
      Alert.alert(t("common.error"), t("subscription.restoreFailed"));
    } finally {
      setRestoring(false);
    }
  }, [setSubscription, router, t]);

  const monthlyPkg = packages.find((p) => p.period === "monthly");
  const yearlyPkg = packages.find((p) => p.period === "yearly");

  return (
    <ScreenContainer padded={false}>
      <View className="px-4">
        <Header title={t("subscription.paywallTitle")} showBack />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      >
        {/* Hero */}
        <View className="items-center py-4">
          <Text className="text-maritime-white text-2xl font-bold">
            Yük Portföyü
          </Text>
          <Text className="text-amber-400 text-lg font-semibold mt-1">
            Premium
          </Text>
          <Text className="text-maritime-muted text-sm text-center mt-2 px-4">
            {t("subscription.paywallDesc")}
          </Text>
        </View>

        {/* Period toggle */}
        <View className="flex-row rounded-xl overflow-hidden border border-maritime-border mb-4">
          <Pressable
            onPress={() => setSelectedPeriod("monthly")}
            className={`flex-1 py-3 items-center ${
              selectedPeriod === "monthly"
                ? "bg-maritime-teal"
                : "bg-maritime-surface"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                selectedPeriod === "monthly"
                  ? "text-maritime-base"
                  : "text-maritime-muted"
              }`}
            >
              {t("subscription.monthly")}
            </Text>
            <Text
              className={`text-xs mt-0.5 ${
                selectedPeriod === "monthly"
                  ? "text-maritime-base"
                  : "text-maritime-muted"
              }`}
            >
              {monthlyPkg?.priceString ?? "$9.99/ay"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSelectedPeriod("yearly")}
            className={`flex-1 py-3 items-center ${
              selectedPeriod === "yearly"
                ? "bg-maritime-teal"
                : "bg-maritime-surface"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                selectedPeriod === "yearly"
                  ? "text-maritime-base"
                  : "text-maritime-muted"
              }`}
            >
              {t("subscription.yearly")}
            </Text>
            <Text
              className={`text-xs mt-0.5 ${
                selectedPeriod === "yearly"
                  ? "text-maritime-base"
                  : "text-maritime-muted"
              }`}
            >
              {yearlyPkg?.priceString ?? "$89.99/yıl"}
            </Text>
            {selectedPeriod === "yearly" && (
              <View className="bg-amber-400 rounded-full px-2 py-0.5 mt-1">
                <Text className="text-maritime-base text-[10px] font-bold">
                  {t("subscription.savePercent")}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Premium features */}
        <Card className="mb-4">
          <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
            {t("subscription.premiumIncludes")}
          </Text>

          {PREMIUM_FEATURES.map((key) => (
            <View
              key={key}
              className="flex-row items-center py-2 border-b border-maritime-border/50 min-h-[40px]"
            >
              <Text className="text-maritime-teal text-sm mr-3">✓</Text>
              <Text className="text-maritime-white text-sm flex-1">
                {t(`subscription.feature_${key}` as never)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Free vs Premium comparison */}
        <Card className="mb-4">
          <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
            {t("subscription.freePlan")}
          </Text>

          {FREE_FEATURES.map(({ key, included }) => (
            <View
              key={key}
              className="flex-row items-center py-2 border-b border-maritime-border/50 min-h-[40px]"
            >
              <Text
                className={`text-sm mr-3 ${
                  included ? "text-maritime-teal" : "text-red-400"
                }`}
              >
                {included ? "✓" : "✗"}
              </Text>
              <Text
                className={`text-sm flex-1 ${
                  included ? "text-maritime-white" : "text-maritime-muted"
                }`}
              >
                {t(`subscription.free_${key}` as never)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Purchase button */}
        <View className="mb-3">
          <Button
            label={t("subscription.startTrial")}
            onPress={handlePurchase}
            variant="primary"
            loading={purchasing}
            fullWidth
          />
        </View>

        {/* Restore */}
        <View className="mb-4">
          <Button
            label={t("subscription.restore")}
            onPress={handleRestore}
            variant="ghost"
            loading={restoring}
            fullWidth
          />
        </View>

        {/* Legal */}
        <View className="items-center py-2 mb-8">
          <Text className="text-maritime-muted text-[10px] text-center px-4">
            {t("subscription.legal")}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
