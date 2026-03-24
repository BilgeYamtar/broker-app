import { useState, useEffect, useCallback } from "react";
import { View, Pressable } from "react-native";
import { Image } from "expo-image";
import { PhotoCapture } from "./PhotoCapture";
import { PhotoViewer } from "./PhotoViewer";
import * as photoRepository from "../photoRepository";
import type { Photo } from "../photoSchemas";

interface VesselPhotoHeaderProps {
  vesselId: string;
}

const BLUR_HASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

export function VesselPhotoHeader({ vesselId }: VesselPhotoHeaderProps) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const loadPhoto = useCallback(async () => {
    const result = await photoRepository.getPhotosByVesselId(vesselId);
    if (result.success && result.data.length > 0) {
      setPhoto(result.data[0]);
    }
  }, [vesselId]);

  useEffect(() => {
    loadPhoto();
  }, [loadPhoto]);

  const handlePhotoCaptured = (newPhoto: Photo) => {
    setPhoto(newPhoto);
  };

  return (
    <View className="mb-4">
      {photo ? (
        <>
          <Pressable
            onPress={() => setViewerOpen(true)}
            className="rounded-xl overflow-hidden mb-3"
          >
            <Image
              source={{ uri: photo.uri }}
              style={{ width: "100%", height: 200 }}
              contentFit="cover"
              placeholder={{ blurhash: BLUR_HASH }}
              transition={200}
            />
          </Pressable>
          <PhotoViewer
            uri={photo.uri}
            visible={viewerOpen}
            onClose={() => setViewerOpen(false)}
          />
        </>
      ) : null}
      <PhotoCapture
        vesselId={vesselId}
        onPhotoCaptured={handlePhotoCaptured}
      />
    </View>
  );
}
