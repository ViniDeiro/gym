import { DimensionValue, StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";

type ProgressBarProps = {
  value: number;
  color?: string;
};

export function ProgressBar({ value, color = colors.primary }: ProgressBarProps) {
  const width = `${Math.max(0, Math.min(100, value))}%` as DimensionValue;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 9,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border
  },
  fill: {
    height: "100%",
    borderRadius: 999
  }
});
