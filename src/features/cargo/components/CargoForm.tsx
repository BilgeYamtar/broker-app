import { useEffect, useCallback } from "react";
import { View, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n";
import { cargoTypes } from "@/data/cargoTypes";
import { hazardClasses } from "@/data/hazardClasses";
import { cargoFormSchema, type CargoFormData } from "../cargoSchemas";
import { useCargoStore } from "../useCargoStore";

interface CargoFormProps {
  initialData?: CargoFormData;
  cargoId?: string;
}

const cargoTypeOptions = cargoTypes.map((t) => ({ label: t, value: t }));
const hazardClassOptions = hazardClasses.map((h) => ({ label: h, value: h }));

export function CargoForm({ initialData, cargoId }: CargoFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const draftCargo = useCargoStore((s) => s.draftCargo);
  const updateDraft = useCargoStore((s) => s.updateDraft);
  const clearDraft = useCargoStore((s) => s.clearDraft);
  const saveCargo = useCargoStore((s) => s.saveCargo);
  const updateCargoAction = useCargoStore((s) => s.updateCargo);

  const isEditing = !!cargoId;

  // Initialize draft from initialData (edit mode) or restore persisted draft (new mode)
  useEffect(() => {
    if (initialData) {
      updateDraft(initialData);
    } else if (!draftCargo) {
      updateDraft({
        temperatureControl: false,
        ventilation: false,
      });
    }
  }, []);

  const draft = draftCargo ?? {};

  const setField = useCallback(
    <K extends keyof CargoFormData>(key: K, value: CargoFormData[K]) => {
      updateDraft({ [key]: value });
    },
    [updateDraft]
  );

  const handleSave = async () => {
    const formData: CargoFormData = {
      cargoName: draft.cargoName ?? "",
      cargoType: (draft.cargoType ?? "Liquid Bulk") as CargoFormData["cargoType"],
      weightMt: draft.weightMt ?? 0,
      volumeCbm: draft.volumeCbm ?? 0,
      hazardClass: (draft.hazardClass ?? "Non-Hazardous") as CargoFormData["hazardClass"],
      temperatureControl: draft.temperatureControl ?? false,
      ventilation: draft.ventilation ?? false,
    };

    const parsed = cargoFormSchema.safeParse(formData);
    if (!parsed.success) {
      const messages = parsed.error.issues.map((issue) => issue.message);
      const unique = [...new Set(messages)];
      Alert.alert(t("common.error"), unique.join("\n"));
      return;
    }

    const result = isEditing
      ? await updateCargoAction(cargoId, parsed.data)
      : await saveCargo(parsed.data);

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

  return (
    <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
      <Card className="mb-6">
        {/* Cargo Name */}
        <Input
          label={t("cargo.cargoName")}
          value={draft.cargoName ?? ""}
          onChangeText={(text) => setField("cargoName", text)}
          placeholder={t("cargo.cargoName")}
        />

        {/* Cargo Type + Hazard Class — side by side like mockup */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Select
              label={t("cargo.cargoType")}
              options={cargoTypeOptions}
              value={draft.cargoType ?? null}
              onValueChange={(v) =>
                setField("cargoType", v as CargoFormData["cargoType"])
              }
              placeholder={t("common.select")}
            />
          </View>
          <View className="flex-1">
            <Select
              label={t("cargo.hazardClass")}
              options={hazardClassOptions}
              value={draft.hazardClass ?? null}
              onValueChange={(v) =>
                setField("hazardClass", v as CargoFormData["hazardClass"])
              }
              placeholder={t("common.select")}
            />
          </View>
        </View>

        {/* Weight + Volume — side by side like mockup */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label={t("cargo.weightMt")}
              value={draft.weightMt ? String(draft.weightMt) : ""}
              onChangeText={(text) => {
                const num = parseFloat(text);
                setField("weightMt", isNaN(num) ? 0 : num);
              }}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
          <View className="flex-1">
            <Input
              label={t("cargo.volumeCbm")}
              value={draft.volumeCbm ? String(draft.volumeCbm) : ""}
              onChangeText={(text) => {
                const num = parseFloat(text);
                setField("volumeCbm", isNaN(num) ? 0 : num);
              }}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
        </View>

        {/* Special Handling Toggles */}
        <View className="mt-2 border-t border-maritime-border pt-4">
          <Toggle
            label={t("cargo.temperatureControl")}
            value={draft.temperatureControl ?? false}
            onValueChange={(v) => setField("temperatureControl", v)}
          />
          <Toggle
            label={t("cargo.ventilation")}
            value={draft.ventilation ?? false}
            onValueChange={(v) => setField("ventilation", v)}
          />
        </View>
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
    </ScrollView>
  );
}
