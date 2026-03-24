import { View, Pressable } from "react-native";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

export function Card({ children, onPress, className = "" }: CardProps) {
  const baseClasses = `bg-maritime-card border border-maritime-border rounded-xl p-4 ${className}`;

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={baseClasses}>
        {children}
      </Pressable>
    );
  }

  return <View className={baseClasses}>{children}</View>;
}
