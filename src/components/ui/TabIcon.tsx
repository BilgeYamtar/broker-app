import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

interface TabIconProps {
  name: IoniconsName;
  color: string;
  size?: number;
}

export function TabIcon({ name, color, size = 22 }: TabIconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}
