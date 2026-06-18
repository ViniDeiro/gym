import { Image, ImageStyle, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

type AvatarProps = {
  name?: string | null;
  uri?: string | null;
  size?: number;
  style?: ImageStyle;
};

export function Avatar({ name, uri, size = 40, style }: AvatarProps) {
  const initial = name?.trim().slice(0, 1).toUpperCase() || "G";
  const dimensionStyle = {
    width: size,
    height: size,
    borderRadius: size / 2
  };

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, dimensionStyle, style]} />;
  }

  return (
    <View style={[styles.fallback, dimensionStyle, style]}>
      <Text style={[styles.initial, { fontSize: Math.max(13, size * 0.42), lineHeight: size }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  fallback: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primaryDark,
    overflow: "hidden"
  },
  initial: {
    color: colors.background,
    fontWeight: "900",
    textAlign: "center"
  }
});
