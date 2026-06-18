import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  style?: ViewStyle;
};

export function Button({ title, onPress, loading, variant = "primary", style }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        loading && styles.disabled,
        style
      ]}
    >
      {loading ? <ActivityIndicator color={variant === "primary" ? colors.background : colors.text} /> : <Text style={[styles.text, variant === "primary" && styles.primaryText]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border
  },
  ghost: {
    backgroundColor: "transparent"
  },
  danger: {
    backgroundColor: colors.danger
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }]
  },
  disabled: {
    opacity: 0.7
  },
  text: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 15
  },
  primaryText: {
    color: colors.background
  }
});
