import { ReactNode } from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
};

export function Screen({ children, scroll = true }: ScreenProps) {
  const content = <View style={styles.content}>{children}</View>;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[colors.backgroundAlt, colors.background]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.topRail} />
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flexGrow: 1,
    padding: 20,
    gap: 16
  },
  scrollContent: {
    flexGrow: 1
  },
  topRail: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: colors.glow
  }
});
