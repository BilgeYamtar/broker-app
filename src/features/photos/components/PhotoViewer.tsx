import { View, Pressable, Text, Modal } from "react-native";
import { Image } from "expo-image";

interface PhotoViewerProps {
  uri: string;
  visible: boolean;
  onClose: () => void;
}

const BLUR_HASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

export function PhotoViewer({ uri, visible, onClose }: PhotoViewerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {/* Close button */}
        <Pressable
          onPress={onClose}
          className="absolute top-14 right-4 z-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/60"
          hitSlop={8}
        >
          <Text className="text-white text-lg">✕</Text>
        </Pressable>

        {/* Full-screen image */}
        <View className="flex-1 items-center justify-center">
          <Image
            source={{ uri }}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            placeholder={{ blurhash: BLUR_HASH }}
            transition={200}
          />
        </View>
      </View>
    </Modal>
  );
}
