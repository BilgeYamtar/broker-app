import { useEffect, useCallback, useState, useMemo } from "react";
import {
  View,
  ScrollView,
  Alert,
  Text,
  Pressable,
  TextInput,
  Modal,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n";
import { classificationSocieties } from "@/data/classificationSocieties";
import { piClubs } from "@/data/piClubs";
import { vesselTypes } from "@/data/vesselTypes";
import { coatingTypes } from "@/data/coatingTypes";
import { coastalNations } from "@/data/coastalNations";
import { vesselFormSchema, type VesselFormData } from "../vesselSchemas";
import { useVesselStore } from "../useVesselStore";

interface VesselFormProps {
  initialData?: VesselFormData;
  vesselId?: string;
}

const classificationOptions = classificationSocieties.map((c) => ({
  label: c,
  value: c,
}));
const piClubOptions = piClubs.map((p) => ({ label: p, value: p }));
const vesselTypeOptions = vesselTypes.map((v) => ({ label: v, value: v }));
const coatingTypeOptions = coatingTypes.map((c) => ({ label: c, value: c }));

export function VesselForm({ initialData, vesselId }: VesselFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const draftVessel = useVesselStore((s) => s.draftVessel);
  const updateDraft = useVesselStore((s) => s.updateDraft);
  const clearDraft = useVesselStore((s) => s.clearDraft);
  const saveVessel = useVesselStore((s) => s.saveVessel);
  const updateVesselAction = useVesselStore((s) => s.updateVessel);

  const [flagPickerOpen, setFlagPickerOpen] = useState(false);
  const [flagSearch, setFlagSearch] = useState("");

  const isEditing = !!vesselId;

  useEffect(() => {
    if (initialData) {
      updateDraft(initialData);
    } else if (!draftVessel) {
      updateDraft({});
    }
  }, []);

  const draft = draftVessel ?? {};

  const setField = useCallback(
    <K extends keyof VesselFormData>(key: K, value: VesselFormData[K]) => {
      updateDraft({ [key]: value });
    },
    [updateDraft]
  );

  const parseNum = (text: string): number => {
    const num = parseFloat(text);
    return isNaN(num) ? 0 : num;
  };

  const parseIntNum = (text: string): number => {
    const num = parseInt(text, 10);
    return isNaN(num) ? 0 : num;
  };

  const handleSave = async () => {
    const formData: VesselFormData = {
      vesselName: draft.vesselName ?? "",
      imoNumber: draft.imoNumber ?? "",
      builtYear: draft.builtYear ?? 0,
      dwtCapacity: draft.dwtCapacity ?? 0,
      lengthM: draft.lengthM ?? 0,
      beamM: draft.beamM ?? 0,
      depthM: draft.depthM ?? 0,
      grossTonnage: draft.grossTonnage ?? 0,
      netTonnage: draft.netTonnage ?? 0,
      classificationSociety: (draft.classificationSociety ??
        "DNV GL") as VesselFormData["classificationSociety"],
      piClub: (draft.piClub ?? "Gard") as VesselFormData["piClub"],
      vesselType: (draft.vesselType ??
        "Chemical Tanker") as VesselFormData["vesselType"],
      coatingType: (draft.coatingType ??
        "Epoxy") as VesselFormData["coatingType"],
      flag: draft.flag ?? null,
    };

    const parsed = vesselFormSchema.safeParse(formData);
    if (!parsed.success) {
      const messages = parsed.error.issues.map((issue) => issue.message);
      const unique = [...new Set(messages)];
      Alert.alert(t("common.error"), unique.join("\n"));
      return;
    }

    const result = isEditing
      ? await updateVesselAction(vesselId, parsed.data)
      : await saveVessel(parsed.data);

    if (result.success) {
      clearDraft();
      router.back();
    } else {
      Alert.alert(t("common.error"), result.error);
    }
  };

  const handleCancel = () => {
    if (!isEditing) {
      clearDraft();
    }
    router.back();
  };

  // Flag picker helpers
  const selectedNation = coastalNations.find((n) => n.code === draft.flag);

  const filteredNations = useMemo(() => {
    if (!flagSearch.trim()) return [...coastalNations];
    const q = flagSearch.toLowerCase();
    return coastalNations.filter(
      (n) =>
        n.name.toLowerCase().includes(q) || n.code.toLowerCase().includes(q)
    );
  }, [flagSearch]);

  return (
    <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
      {/* Basic Info */}
      <Card className="mb-4">
        <Input
          label={t("vessels.vesselName")}
          value={draft.vesselName ?? ""}
          onChangeText={(text) => setField("vesselName", text)}
          placeholder={t("vessels.vesselName")}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label={t("vessels.imoNumber")}
              value={draft.imoNumber ?? ""}
              onChangeText={(text) => setField("imoNumber", text)}
              placeholder="1234567"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Input
              label={t("vessels.builtYear")}
              value={draft.builtYear ? String(draft.builtYear) : ""}
              onChangeText={(text) => setField("builtYear", parseIntNum(text))}
              placeholder="2020"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Select
              label={t("vessels.vesselType")}
              options={vesselTypeOptions}
              value={draft.vesselType ?? null}
              onValueChange={(v) =>
                setField("vesselType", v as VesselFormData["vesselType"])
              }
              placeholder={t("common.select")}
            />
          </View>
          <View className="flex-1">
            <Select
              label={t("vessels.coatingType")}
              options={coatingTypeOptions}
              value={draft.coatingType ?? null}
              onValueChange={(v) =>
                setField("coatingType", v as VesselFormData["coatingType"])
              }
              placeholder={t("common.select")}
            />
          </View>
        </View>

        {/* Flag / Country Picker */}
        <View className="mt-2">
          <Text className="text-maritime-muted text-xs mb-1.5">
            {t("vessels.flag")}
          </Text>
          <Pressable
            onPress={() => {
              setFlagSearch("");
              setFlagPickerOpen(true);
            }}
            className="min-h-[44px] rounded-lg border border-maritime-border bg-maritime-surface px-3 justify-center"
          >
            {selectedNation ? (
              <Text className="text-maritime-white text-sm">
                {selectedNation.flag} {selectedNation.name}
              </Text>
            ) : (
              <Text className="text-maritime-muted text-sm">
                {t("vessels.flagPlaceholder")}
              </Text>
            )}
          </Pressable>
        </View>
      </Card>

      {/* Dimensions L×B×D */}
      <Card className="mb-4">
        <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-3">
          {t("vessels.dimensions")}
        </Text>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label={t("vessels.lengthM")}
              value={draft.lengthM ? String(draft.lengthM) : ""}
              onChangeText={(text) => setField("lengthM", parseNum(text))}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
          <View className="flex-1">
            <Input
              label={t("vessels.beamM")}
              value={draft.beamM ? String(draft.beamM) : ""}
              onChangeText={(text) => setField("beamM", parseNum(text))}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
          <View className="flex-1">
            <Input
              label={t("vessels.depthM")}
              value={draft.depthM ? String(draft.depthM) : ""}
              onChangeText={(text) => setField("depthM", parseNum(text))}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        </View>
      </Card>

      {/* Tonnage */}
      <Card className="mb-4">
        <Input
          label={t("vessels.dwtCapacity")}
          value={draft.dwtCapacity ? String(draft.dwtCapacity) : ""}
          onChangeText={(text) => setField("dwtCapacity", parseNum(text))}
          keyboardType="numeric"
          placeholder="0"
        />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label={t("vessels.grossTonnage")}
              value={draft.grossTonnage ? String(draft.grossTonnage) : ""}
              onChangeText={(text) => setField("grossTonnage", parseNum(text))}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
          <View className="flex-1">
            <Input
              label={t("vessels.netTonnage")}
              value={draft.netTonnage ? String(draft.netTonnage) : ""}
              onChangeText={(text) => setField("netTonnage", parseNum(text))}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        </View>
      </Card>

      {/* Classification & P&I */}
      <Card className="mb-6">
        <Select
          label={t("vessels.classificationSociety")}
          options={classificationOptions}
          value={draft.classificationSociety ?? null}
          onValueChange={(v) =>
            setField(
              "classificationSociety",
              v as VesselFormData["classificationSociety"]
            )
          }
          placeholder={t("common.select")}
        />
        <Select
          label={t("vessels.piClub")}
          options={piClubOptions}
          value={draft.piClub ?? null}
          onValueChange={(v) =>
            setField("piClub", v as VesselFormData["piClub"])
          }
          placeholder={t("common.select")}
        />
      </Card>

      {/* Action Buttons */}
      <View className="flex-row gap-3 mb-8">
        <View className="flex-1">
          <Button
            label={t("common.cancel")}
            onPress={handleCancel}
            variant="ghost"
            fullWidth
          />
        </View>
        <View className="flex-1">
          <Button
            label={t("common.save")}
            onPress={handleSave}
            variant="primary"
            fullWidth
          />
        </View>
      </View>

      {/* Flag Picker Modal */}
      <Modal
        visible={flagPickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFlagPickerOpen(false)}
      >
        <View className="flex-1 bg-maritime-bg">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
            <Text className="text-maritime-white text-lg font-semibold">
              {t("vessels.flag")}
            </Text>
            <Pressable onPress={() => setFlagPickerOpen(false)}>
              <Text className="text-maritime-teal text-sm font-medium">
                {t("common.done")}
              </Text>
            </Pressable>
          </View>

          {/* Search */}
          <View className="px-4 pb-2">
            <TextInput
              value={flagSearch}
              onChangeText={setFlagSearch}
              placeholder={t("common.search")}
              placeholderTextColor="#6B7280"
              className="h-10 rounded-lg border border-maritime-border bg-maritime-surface px-3 text-maritime-white text-sm"
              autoFocus
            />
          </View>

          {/* List */}
          <FlatList
            data={filteredNations}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setField("flag", item.code);
                  setFlagPickerOpen(false);
                }}
                className={`flex-row items-center px-4 py-3 border-b border-maritime-border ${
                  draft.flag === item.code ? "bg-maritime-teal-bg" : ""
                }`}
              >
                <Text className="text-lg mr-3">{item.flag}</Text>
                <Text className="text-maritime-white text-sm flex-1">
                  {item.name}
                </Text>
                <Text className="text-maritime-muted text-xs">
                  {item.code}
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
          />
        </View>
      </Modal>
    </ScrollView>
  );
}
