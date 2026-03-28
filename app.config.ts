import { ExpoConfig, ConfigContext } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

function getAppName(): string {
  if (IS_DEV) return "Yük Portföyü (Dev)";
  if (IS_PREVIEW) return "Yük Portföyü (Preview)";
  return "Yük Portföyü";
}

function getBundleId(): string {
  if (IS_DEV) return "com.yukportfoyu.app.dev";
  if (IS_PREVIEW) return "com.yukportfoyu.app.preview";
  return "com.yukportfoyu.app";
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "yuk-portfoyu",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "yukportfoyu",
  userInterfaceStyle: "dark",
  ios: {
    bundleIdentifier: getBundleId(),
    supportsTablet: false,
    infoPlist: {
      NSCameraUsageDescription:
        "Gemi ve yük fotoğrafları çekmek için kamera erişimi gereklidir.",
      NSPhotoLibraryUsageDescription:
        "Mevcut fotoğrafları gemi profillerine eklemek için galeri erişimi gereklidir.",
    },
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: getBundleId(),
    adaptiveIcon: {
      backgroundColor: "#0a1628",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    permissions: [
      "CAMERA",
      "READ_MEDIA_IMAGES",
    ],
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#0a1628",
        android: {
          image: "./assets/images/splash-icon.png",
          imageWidth: 76,
        },
      },
    ],
    "expo-sqlite",
    "expo-image",
    "expo-localization",
    [
      "expo-camera",
      {
        cameraPermission:
          "Gemi ve yük fotoğrafları çekmek için kamera erişimi gereklidir.",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Mevcut fotoğrafları gemi profillerine eklemek için galeri erişimi gereklidir.",
      },
    ],
    "expo-sharing",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  updates: {
    url: "https://u.expo.dev/c7296099-246c-4dac-8fdd-93c5513bd211",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  extra: {
    revenueCatApiKey: "test_zSZpPGGidGDNjDRqjugdthlmbiC",
    eas: {
      projectId: "c7296099-246c-4dac-8fdd-93c5513bd211",
    },
  },
});
