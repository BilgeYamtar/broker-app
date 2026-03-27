import { useEffect, useCallback, useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n";
import {
  brokerNoteFormSchema,
  type BrokerNoteFormData,
} from "../brokerNoteSchemas";
import { useBrokerNoteStore } from "../useBrokerNoteStore";

interface BrokerNoteFormProps {
  vesselId: string;
  initialData?: BrokerNoteFormData;
  noteId?: string;
}

export function BrokerNoteForm({
  vesselId,
  initialData,
  noteId,
}: BrokerNoteFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const draftNote = useBrokerNoteStore((s) => s.draftNote);
  const updateDraft = useBrokerNoteStore((s) => s.updateDraft);
  const clearDraft = useBrokerNoteStore((s) => s.clearDraft);
  const saveNote = useBrokerNoteStore((s) => s.saveNote);
  const updateNoteAction = useBrokerNoteStore((s) => s.updateNote);
  const [saving, setSaving] = useState(false);

  const isEditing = !!noteId;

  useEffect(() => {
    if (initialData) {
      updateDraft(initialData);
    } else if (!draftNote) {
      updateDraft({ vesselId });
    }
  }, []);

  const draft = draftNote ?? {};

  const setField = useCallback(
    <K extends keyof BrokerNoteFormData>(
      key: K,
      value: BrokerNoteFormData[K]
    ) => {
      updateDraft({ [key]: value });
    },
    [updateDraft]
  );

  const handleSave = async () => {
    const formData: BrokerNoteFormData = {
      vesselId: draft.vesselId ?? vesselId,
      noteText: draft.noteText ?? "",
      captainName: draft.captainName || undefined,
      sourceName: draft.sourceName || undefined,
    };

    const parsed = brokerNoteFormSchema.safeParse(formData);
    if (!parsed.success) {
      Alert.alert(t("common.error"), t("errors.validationFailed"));
      return;
    }

    setSaving(true);
    const result = isEditing
      ? await updateNoteAction(noteId, parsed.data)
      : await saveNote(parsed.data);
    setSaving(false);

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
        {/* Note Text — multiline */}
        <Input
          label={t("brokerNotes.noteText")}
          value={draft.noteText ?? ""}
          onChangeText={(text) => setField("noteText", text)}
          placeholder={t("brokerNotes.noteTextPlaceholder")}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        {/* Captain Name + Source — side by side */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label={t("brokerNotes.captainName")}
              value={draft.captainName ?? ""}
              onChangeText={(text) => setField("captainName", text)}
              placeholder={t("brokerNotes.captainName")}
            />
          </View>
          <View className="flex-1">
            <Input
              label={t("brokerNotes.sourceName")}
              value={draft.sourceName ?? ""}
              onChangeText={(text) => setField("sourceName", text)}
              placeholder={t("brokerNotes.sourceName")}
            />
          </View>
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
            loading={saving}
            fullWidth
          />
        </View>
      </View>
    </ScrollView>
  );
}
