import { View, TextInput, Pressable, Text } from "react-native";
import { colors } from "@/constants/colors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Ara...",
}: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-maritime-surface border border-maritime-border rounded-lg px-3 min-h-[44px] mb-4">
      <Text className="text-maritime-muted mr-2">⌕</Text>
      <TextInput
        className="flex-1 text-maritime-white text-base"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.maritime.muted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText("")}
          className="min-h-[44px] min-w-[44px] items-center justify-center"
          hitSlop={4}
        >
          <Text className="text-maritime-muted text-lg">✕</Text>
        </Pressable>
      )}
    </View>
  );
}
