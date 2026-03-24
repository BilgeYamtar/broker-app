import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useI18n } from "@/lib/i18n";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
}

export function Header({
  title,
  subtitle,
  showBack = false,
  rightAction,
}: HeaderProps) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <View className="flex-row items-center justify-between pb-4 pt-2">
      <View className="flex-1">
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            className="mb-2 min-h-[44px] min-w-[44px] items-start justify-center"
            hitSlop={8}
          >
            <Text className="text-maritime-teal text-base">
              ← {t("common.back")}
            </Text>
          </Pressable>
        )}
        <Text className="text-maritime-white text-2xl font-semibold">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-maritime-muted text-xs uppercase tracking-widest mt-1">
            {subtitle}
          </Text>
        )}
      </View>
      {rightAction && (
        <Pressable
          onPress={rightAction.onPress}
          className="min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-maritime-border px-4"
          hitSlop={4}
        >
          <Text className="text-maritime-white text-sm font-medium">
            + {rightAction.label}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
