import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
} from "react-native";
import { colors } from "@/constants/colors";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string | null;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function Select({
  label,
  options,
  value,
  onValueChange,
  placeholder = "Seçin...",
  error,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <View className="mb-4">
      <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-2">
        {label}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        className={`min-h-[44px] rounded-lg border flex-row items-center justify-between px-3 ${
          error
            ? "border-maritime-danger bg-maritime-danger-bg"
            : "border-maritime-border bg-maritime-surface"
        }`}
      >
        <Text
          className={
            selectedOption ? "text-maritime-white text-base" : "text-maritime-muted text-base"
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text className="text-maritime-muted text-sm">▼</Text>
      </Pressable>
      {error && (
        <Text className="text-maritime-danger text-xs mt-1">{error}</Text>
      )}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          className="flex-1 bg-black/50 justify-end"
        >
          <Pressable
            onPress={() => {}}
            className="bg-maritime-surface rounded-t-2xl max-h-[60%]"
          >
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-maritime-border">
              <Text className="text-maritime-white text-base font-semibold">
                {label}
              </Text>
              <Pressable
                onPress={() => setOpen(false)}
                className="min-h-[44px] min-w-[44px] items-center justify-center"
              >
                <Text className="text-maritime-teal text-base">Tamam</Text>
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onValueChange(item.value);
                    setOpen(false);
                  }}
                  className={`px-4 py-3 border-b border-maritime-border flex-row items-center justify-between min-h-[44px] ${
                    item.value === value ? "bg-maritime-teal-bg" : ""
                  }`}
                >
                  <Text
                    className={`text-base ${
                      item.value === value
                        ? "text-maritime-teal font-semibold"
                        : "text-maritime-white"
                    }`}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Text className="text-maritime-teal">✓</Text>
                  )}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
