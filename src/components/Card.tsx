import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/theme/colors";

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style }: CardProps) {
  return (
    <View style={styles.shadow}>
      <LinearGradient colors={[colors.cardElevated, colors.card]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, style]}>
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8
  },
  card: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    overflow: "hidden"
  }
});
