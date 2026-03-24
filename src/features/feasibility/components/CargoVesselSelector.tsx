import { useState, useMemo } from "react";
import { View, Text, Pressable, Modal, FlatList } from "react-native";
import { SearchBar } from "@/components/ui/SearchBar";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n";
import { colors } from "@/constants/colors";
import type { Cargo } from "@/features/cargo/cargoSchemas";
import type { Vessel } from "@/features/vessel/vesselSchemas";

interface CargoVesselSelectorProps {
  cargoes: Cargo[];
  vessels: Vessel[];
  selectedCargoId: string | null;
  selectedVesselId: string | null;
  onCargoSelect: (id: string) => void;
  onVesselSelect: (id: string) => void;
}

// ── Generic searchable picker modal ─────────────────────────────────────────

interface PickerItem {
  id: string;
  title: string;
  subtitle: string;
}

function SearchablePicker({
  visible,
  title,
  items,
  selectedId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  items: PickerItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    );
  }, [items, search]);

  const handleSelect = (id: string) => {
    onSelect(id);
    setSearch("");
    onClose();
  };

  const handleClose = () => {
    setSearch("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable onPress={handleClose} className="flex-1 bg-black/50 justify-end">
        <Pressable onPress={() => {}} className="bg-maritime-surface rounded-t-2xl max-h-[70%]">
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-maritime-border">
            <Text className="text-maritime-white text-base font-semibold">
              {title}
            </Text>
            <Pressable
              onPress={handleClose}
              className="min-h-[44px] min-w-[44px] items-center justify-center"
            >
              <Text className="text-maritime-teal text-base">✕</Text>
            </Pressable>
          </View>
          <View className="px-4 pt-3">
            <SearchBar value={search} onChangeText={setSearch} />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelect(item.id)}
                className={`px-4 py-3 border-b border-maritime-border min-h-[44px] ${
                  item.id === selectedId ? "bg-maritime-teal-bg" : ""
                }`}
              >
                <Text
                  className={`text-base ${
                    item.id === selectedId
                      ? "text-maritime-teal font-semibold"
                      : "text-maritime-white"
                  }`}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text className="text-maritime-muted text-xs mt-0.5" numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <View className="items-center py-8">
                <Text className="text-maritime-muted text-sm">
                  No results
                </Text>
              </View>
            }
            keyboardShouldPersistTaps="handled"
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Selector trigger button ─────────────────────────────────────────────────

function SelectorButton({
  label,
  selectedTitle,
  selectedSubtitle,
  placeholder,
  onPress,
}: {
  label: string;
  selectedTitle?: string;
  selectedSubtitle?: string;
  placeholder: string;
  onPress: () => void;
}) {
  return (
    <View className="mb-4">
      <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-2">
        {label}
      </Text>
      <Pressable
        onPress={onPress}
        className="min-h-[56px] rounded-lg border border-maritime-border bg-maritime-surface px-4 justify-center"
      >
        {selectedTitle ? (
          <View>
            <Text className="text-maritime-white text-base" numberOfLines={1}>
              {selectedTitle}
            </Text>
            {selectedSubtitle && (
              <Text className="text-maritime-muted text-xs mt-0.5" numberOfLines={1}>
                {selectedSubtitle}
              </Text>
            )}
          </View>
        ) : (
          <Text className="text-maritime-muted text-base">{placeholder}</Text>
        )}
      </Pressable>
    </View>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export function CargoVesselSelector({
  cargoes,
  vessels,
  selectedCargoId,
  selectedVesselId,
  onCargoSelect,
  onVesselSelect,
}: CargoVesselSelectorProps) {
  const { t } = useI18n();
  const [cargoPickerOpen, setCargoPickerOpen] = useState(false);
  const [vesselPickerOpen, setVesselPickerOpen] = useState(false);

  const cargoItems: PickerItem[] = useMemo(
    () =>
      cargoes.map((c) => ({
        id: c.id,
        title: c.cargoName,
        subtitle: `${c.cargoType} · ${c.hazardClass} · ${c.weightMt.toLocaleString()} MT`,
      })),
    [cargoes]
  );

  const vesselItems: PickerItem[] = useMemo(
    () =>
      vessels.map((v) => ({
        id: v.id,
        title: v.vesselName,
        subtitle: `${v.vesselType} · ${v.coatingType} · IMO ${v.imoNumber}`,
      })),
    [vessels]
  );

  const selectedCargo = cargoes.find((c) => c.id === selectedCargoId);
  const selectedVessel = vessels.find((v) => v.id === selectedVesselId);

  return (
    <Card className="mb-4">
      <SelectorButton
        label={t("feasibility.selectCargo")}
        selectedTitle={selectedCargo?.cargoName}
        selectedSubtitle={
          selectedCargo
            ? `${selectedCargo.cargoType} · ${selectedCargo.hazardClass}`
            : undefined
        }
        placeholder={t("feasibility.selectCargoPlaceholder")}
        onPress={() => setCargoPickerOpen(true)}
      />

      <SelectorButton
        label={t("feasibility.selectVessel")}
        selectedTitle={selectedVessel?.vesselName}
        selectedSubtitle={
          selectedVessel
            ? `${selectedVessel.vesselType} · ${selectedVessel.coatingType}`
            : undefined
        }
        placeholder={t("feasibility.selectVesselPlaceholder")}
        onPress={() => setVesselPickerOpen(true)}
      />

      <SearchablePicker
        visible={cargoPickerOpen}
        title={t("feasibility.selectCargo")}
        items={cargoItems}
        selectedId={selectedCargoId}
        onSelect={onCargoSelect}
        onClose={() => setCargoPickerOpen(false)}
      />

      <SearchablePicker
        visible={vesselPickerOpen}
        title={t("feasibility.selectVessel")}
        items={vesselItems}
        selectedId={selectedVesselId}
        onSelect={onVesselSelect}
        onClose={() => setVesselPickerOpen(false)}
      />
    </Card>
  );
}
