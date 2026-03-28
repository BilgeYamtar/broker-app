import { Stack } from "expo-router";

export default function RouteLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0a1628" },
      }}
    />
  );
}
