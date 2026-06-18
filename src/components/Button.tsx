import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/theme/colors";

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  style?: ViewStyle;
};

export function Button({ title, onPress, loading, variant = "primary", style }: ButtonProps) {
  const content = loading ? (
    <ActivityIndicator color={variant === "primary" ? colors.background : colors.text} />
  ) : (
    <Text style={[styles.text, variant === "primary" && styles.primaryText]}>{title}</Text>
  );

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
      {variant === "primary" ? (
        <LinearGradient colors={[colors.primary, "#8BFFD9"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientFill}>
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    overflow: "hidden"
  },
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8
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
    fontWeight: "900",
    fontSize: 15
  },
  primaryText: {
    color: colors.background
  },
  gradientFill: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  }
});
