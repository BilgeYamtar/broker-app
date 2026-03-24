import { View, Text } from "react-native";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "demo";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { container: string; text: string }> =
  {
    default: {
      container: "bg-maritime-surface border border-maritime-border",
      text: "text-maritime-muted",
    },
    success: {
      container: "bg-maritime-success-bg border border-maritime-success",
      text: "text-maritime-success",
    },
    warning: {
      container: "bg-maritime-warning-bg border border-maritime-warning",
      text: "text-maritime-warning",
    },
    danger: {
      container: "bg-maritime-danger-bg border border-maritime-danger",
      text: "text-maritime-danger",
    },
    demo: {
      container: "bg-maritime-teal-bg border border-maritime-teal-dim",
      text: "text-maritime-teal-dim",
    },
  };

export function Badge({ label, variant = "default" }: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <View className={`rounded-md px-2 py-0.5 self-start ${styles.container}`}>
      <Text className={`text-2xs font-semibold uppercase ${styles.text}`}>
        {label}
      </Text>
    </View>
  );
}
