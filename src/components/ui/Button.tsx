import { Pressable, Text, ActivityIndicator } from "react-native";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string }> =
  {
    primary: {
      container: "bg-maritime-teal",
      text: "text-maritime-base",
    },
    secondary: {
      container: "bg-maritime-card border border-maritime-border",
      text: "text-maritime-white",
    },
    danger: {
      container: "bg-maritime-danger-bg border border-maritime-danger",
      text: "text-maritime-danger",
    },
    ghost: {
      container: "bg-transparent",
      text: "text-maritime-teal",
    },
  };

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  fullWidth = false,
}: ButtonProps) {
  const styles = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`min-h-[44px] rounded-lg px-6 items-center justify-center ${styles.container} ${fullWidth ? "w-full" : ""} ${isDisabled ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#0a1628" : "#2dd4a8"}
        />
      ) : (
        <Text className={`text-sm font-semibold ${styles.text}`}>{label}</Text>
      )}
    </Pressable>
  );
}
