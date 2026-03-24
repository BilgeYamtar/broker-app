import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { useI18n } from "@/lib/i18n";
import { PhotoViewer } from "./PhotoViewer";
import * as photoRepository from "../photoRepository";
import type { Photo } from "../photoSchemas";

interface VesselPhotoGridProps {
  vesselId: string;
}

const BLUR_HASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";
const NUM_COLUMNS = 3;
const GAP = 4;

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
}

export function VesselPhotoGrid({ vesselId }: VesselPhotoGridProps) {
  const { t } = useI18n();
  const { width: screenWidth } = useWindowDimensions();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  // Account for px-4 (16px each side) padding on the parent
  const containerWidth = screenWidth - 32;
  const thumbSize = Math.floor(
    (containerWidth - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS
  );

  const loadPhotos = useCallback(async () => {
    const result = await photoRepository.getAllPhotosForVessel(vesselId);
    if (result.success) {
      setPhotos(result.data);
    }
  }, [vesselId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const renderItem = useCallback(
    ({ item }: { item: Photo }) => (
      <Pressable
        onPress={() => setViewerUri(item.uri)}
        className="mb-1"
        style={{ marginRight: GAP }}
      >
        <View className="rounded-lg overflow-hidden">
          <Image
            source={{ uri: item.uri }}
            style={{ width: thumbSize, height: thumbSize }}
            contentFit="cover"
            placeholder={{ blurhash: BLUR_HASH }}
            transition={200}
          />
        </View>
        <Text className="text-maritime-muted text-2xs mt-1 text-center">
          {formatTimestamp(item.createdAt)}
        </Text>
      </Pressable>
    ),
    [thumbSize]
  );

  const keyExtractor = useCallback((item: Photo) => item.id, []);

  if (photos.length === 0) return null;

  return (
    <View className="mt-6">
      <Text className="text-maritime-white text-lg font-semibold mb-3">
        {t("brokerNotes.photoGallery")}
      </Text>
      <FlashList
        data={photos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        scrollEnabled={false}
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
