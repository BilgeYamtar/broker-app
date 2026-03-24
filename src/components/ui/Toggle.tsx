import { View, Text, Pressable } from "react-native";
import { colors } from "@/constants/colors";

interface ToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function Toggle({ label, value, onValueChange }: ToggleProps) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      className="flex-row items-center justify-between min-h-[44px] mb-4"
    >
      <Text className="text-maritime-white text-base">{label}</Text>
      <View
        className={`w-12 h-7 rounded-full justify-center px-0.5 ${
          value ? "bg-maritime-teal" : "bg-maritime-border"
        }`}
      >
        <View
          className={`w-6 h-6 rounded-full bg-white ${
            value ? "self-end" : "self-start"
          }`}
        />
      </View>
    </Pressable>
  );
}
