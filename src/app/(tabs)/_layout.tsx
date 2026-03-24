import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { colors } from "@/constants/colors";
import { TabIcon } from "@/components/ui/TabIcon";
import { useI18n } from "@/lib/i18n";

export default function TabLayout() {
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.maritime.surface,
          borderTopColor: colors.maritime.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.maritime.teal,
        tabBarInactiveTintColor: colors.maritime.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="cargo"
        options={{
          title: t("tabs.cargo"),
          tabBarLabel: t("tabs.cargo"),
          tabBarIcon: ({ color }) => (
            <TabIcon name="cube-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vessels"
        options={{
          title: t("tabs.vessels"),
          tabBarLabel: t("tabs.vessels"),
          tabBarIcon: ({ color }) => (
            <TabIcon name="boat-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="feasibility"
        options={{
          title: t("tabs.feasibility"),
          tabBarLabel: t("tabs.feasibility"),
          tabBarIcon: ({ color }) => (
            <TabIcon name="analytics-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings.title"),
          tabBarLabel: t("settings.title"),
          tabBarIcon: ({ color }) => (
            <TabIcon name="settings-outline" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
