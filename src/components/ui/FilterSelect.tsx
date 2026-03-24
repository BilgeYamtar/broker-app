import { useState } from "react";
import { View, Text, Pressable, Modal, FlatList } from "react-native";
import { colors } from "@/constants/colors";
import { useI18n } from "@/lib/i18n";

interface FilterSelectOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  label: string;
  options: FilterSelectOption[];
  value: string | null;
  onValueChange: (value: string | null) => void;
}

export function FilterSelect({
  label,
  options,
  value,
  onValueChange,
}: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const selectedOption = options.find((o) => o.value === value);
  const isActive = value !== null;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className={`flex-row items-center rounded-lg px-3 min-h-[36px] border ${
          isActive
            ? "bg-maritime-teal-bg border-maritime-teal-dim"
            : "bg-maritime-surface border-maritime-border"
        }`}
      >
        <Text
          className={`text-sm ${
            isActive ? "text-maritime-teal" : "text-maritime-muted"
          }`}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : label}
        </Text>
        <Text
          className={`text-xs ml-1 ${
            isActive ? "text-maritime-teal" : "text-maritime-muted"
          }`}
        >
          ▼
        </Text>
      </Pressable>

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
                <Text className="text-maritime-teal text-base">
                  {t("common.done")}
                </Text>
              </Pressable>
            </View>

            {/* Clear filter option */}
            <Pressable
              onPress={() => {
                onValueChange(null);
                setOpen(false);
              }}
              className={`px-4 py-3 border-b border-maritime-border flex-row items-center justify-between min-h-[44px] ${
                value === null ? "bg-maritime-teal-bg" : ""
              }`}
            >
              <Text
                className={`text-base ${
                  value === null
                    ? "text-maritime-teal font-semibold"
                    : "text-maritime-muted"
                }`}
              >
                {t("common.clearFilter")}
              </Text>
              {value === null && (
                <Text className="text-maritime-teal">✓</Text>
              )}
            </Pressable>

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
    </>
  );
}
