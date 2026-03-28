import { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { useI18n } from "@/lib/i18n";
import { searchPorts, type Port } from "@/services/portService";

interface PortPickerProps {
  label: string;
  selectedPort: Port | null;
  onSelect: (port: Port) => void;
}

export function PortPicker({ label, selectedPort, onSelect }: PortPickerProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const results = useMemo(() => {
    return searchPorts(search).slice(0, 100);
  }, [search]);

  return (
    <>
      <View className="mb-4">
        <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-2">
          {label}
        </Text>
        <Pressable
          onPress={() => {
            setSearch("");
            setOpen(true);
          }}
          className="min-h-[44px] rounded-lg border border-maritime-border bg-maritime-surface px-3 justify-center"
        >
          {selectedPort ? (
            <Text className="text-maritime-white text-sm">
              {selectedPort.name}, {selectedPort.country}
              <Text className="text-maritime-muted">
                {" "}({selectedPort.code})
              </Text>
            </Text>
          ) : (
            <Text className="text-maritime-muted text-sm">
              {t("route.selectPort")}
            </Text>
          )}
        </Pressable>
      </View>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <View className="flex-1 bg-maritime-bg">
          <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
            <Text className="text-maritime-white text-lg font-semibold">
              {label}
            </Text>
            <Pressable onPress={() => setOpen(false)}>
              <Text className="text-maritime-teal text-sm font-medium">
                {t("common.done")}
              </Text>
            </Pressable>
          </View>

          <View className="px-4 pb-2">
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t("route.searchPort")}
              placeholderTextColor="#6B7280"
              className="h-10 rounded-lg border border-maritime-border bg-maritime-surface px-3 text-maritime-white text-sm"
              autoFocus
            />
          </View>

          <FlatList
            data={results}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                }}
                className={`px-4 py-3 border-b border-maritime-border ${
                  selectedPort?.code === item.code ? "bg-maritime-teal-bg" : ""
                }`}
              >
                <Text className="text-maritime-white text-sm">
                  {item.name}
                </Text>
                <Text className="text-maritime-muted text-xs mt-0.5">
                  {item.country} · {item.code}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <View className="items-center py-8">
                <Text className="text-maritime-muted text-sm">
                  {t("common.noResults")}
                </Text>
              </View>
            }
            getItemLayout={(_, index) => ({
              length: 56,
              offset: 56 * index,
              index,
            })}
          />
        </View>
      </Modal>
    </>
  );
}
