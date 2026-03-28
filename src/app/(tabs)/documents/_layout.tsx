import { Stack } from "expo-router";

export default function DocumentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0a1628" },
      }}
    />
  );
}
