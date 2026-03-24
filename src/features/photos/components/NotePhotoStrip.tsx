import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { Image } from "expo-image";
import { useI18n } from "@/lib/i18n";
import { PhotoCapture } from "./PhotoCapture";
import { PhotoViewer } from "./PhotoViewer";
import * as photoRepository from "../photoRepository";
import type { Photo } from "../photoSchemas";

interface NotePhotoStripProps {
  brokerNoteId: string;
}

const BLUR_HASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";
const THUMB_SIZE = 80;

export function NotePhotoStrip({ brokerNoteId }: NotePhotoStripProps) {
  const { t } = useI18n();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    const result = await photoRepository.getPhotosByBrokerNoteId(brokerNoteId);
    if (result.success) {
      setPhotos(result.data);
    }
  }, [brokerNoteId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const handlePhotoCaptured = (newPhoto: Photo) => {
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  const handleDeletePhoto = (photo: Photo) => {
    Alert.alert(
      t("common.deleteConfirmTitle"),
      t("brokerNotes.deletePhotoMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            const result = await photoRepository.deletePhoto(photo.id);
            if (result.success) {
              setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
            }
          },
        },
      ]
    );
  };

  return (
    <View className="mt-4">
      <Text className="text-maritime-muted text-xs uppercase tracking-widest mb-2">
        {t("brokerNotes.photos")}
      </Text>

      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
        >
          {photos.map((photo) => (
            <Pressable
              key={photo.id}
              onPress={() => setViewerUri(photo.uri)}
              onLongPress={() => handleDeletePhoto(photo)}
              className="mr-2 rounded-lg overflow-hidden"
            >
              <Image
                source={{ uri: photo.uri }}
                style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                contentFit="cover"
                placeholder={{ blurhash: BLUR_HASH }}
                transition={200}
              />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <PhotoCapture
        brokerNoteId={brokerNoteId}
        onPhotoCaptured={handlePhotoCaptured}
      />

      {viewerUri && (
        <PhotoViewer
          uri={viewerUri}
          visible
          onClose={() => setViewerUri(null)}
        />
      )}
    </View>
  );
}
