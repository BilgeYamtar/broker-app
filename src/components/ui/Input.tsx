import { View, Text, TextInput, type TextInputProps } from "react-native";
import { colors } from "@/constants/colors";

interface InputProps extends Omit<TextInputProps, "style"> {
  label: string;
  error?: string;
}

export function Input({ label, error, ...inputProps }: InputProps) {
  return (
    <View className="mb-4">
      <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-2">
        {label}
      </Text>
      <TextInput
        className={`min-h-[44px] rounded-lg border px-3 text-maritime-white text-base ${
          error
            ? "border-maritime-danger bg-maritime-danger-bg"
            : "border-maritime-border bg-maritime-surface"
        }`}
        placeholderTextColor={colors.maritime.muted}
        {...inputProps}
      />
      {error && (
        <Text className="text-maritime-danger text-xs mt-1">{error}</Text>
      )}
    </View>
  );
}
