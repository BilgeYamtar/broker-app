import { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useI18n } from "@/lib/i18n";
import { generateUUID } from "@/utils/uuid";
import { compressPhoto, saveToDocumentDirectory } from "@/utils/photoUtils";
import * as photoRepository from "../photoRepository";
import type { Photo } from "../photoSchemas";

interface PhotoCaptureProps {
  vesselId?: string;
  brokerNoteId?: string;
  onPhotoCaptured: (photo: Photo) => void;
}

export function PhotoCapture({
  vesselId,
  brokerNoteId,
  onPhotoCaptured,
}: PhotoCaptureProps) {
  const { t } = useI18n();
  const [capturing, setCapturing] = useState(false);

  const processAndSave = async (sourceUri: string) => {
    setCapturing(true);
    try {
      // 1. Compress
      const compressed = await compressPhoto(sourceUri);
      if (!compressed.success) {
        Alert.alert(t("common.error"), t("errors.photoCompressFailed"));
        return;
      }

      // 2. Persist to documentDirectory
      const fileName = `${Date.now()}_${generateUUID()}`;
      const saved = saveToDocumentDirectory(compressed.data.uri, fileName);
      if (!saved.success) {
        Alert.alert(t("common.error"), t("errors.photoCaptureFailed"));
        return;
      }

      // 3. Save metadata to SQLite
      const result = await photoRepository.createPhoto({
        uri: saved.data,
        vesselId: vesselId ?? null,
        brokerNoteId: brokerNoteId ?? null,
      });

      if (result.success) {
        onPhotoCaptured(result.data);
      } else {
        Alert.alert(t("common.error"), t("errors.photoCaptureFailed"));
      }
    } finally {
      setCapturing(false);
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      await processAndSave(result.assets[0].uri);
    }
  };

  const handleChooseFromLibrary = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      await processAndSave(result.assets[0].uri);
    }
  };

  const showPicker = () => {
    Alert.alert(t("vessels.addPhoto"), undefined, [
      { text: t("vessels.takePhoto"), onPress: handleTakePhoto },
      {
        text: t("vessels.chooseFromLibrary"),
        onPress: handleChooseFromLibrary,
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  return (
    <Pressable
      onPress={showPicker}
      disabled={capturing}
      className="items-center justify-center min-h-[44px] rounded-lg border border-dashed border-maritime-border bg-maritime-surface px-4 py-3"
    >
      <Text className="text-maritime-teal text-sm font-medium">
        {capturing ? t("common.loading") : t("vessels.addPhoto")}
      </Text>
    </Pressable>
  );
}
