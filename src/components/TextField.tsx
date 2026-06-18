import { useState } from "react";
import { Text, TextInput, TextInputProps, StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";

type TextFieldProps = TextInputProps & {
  label: string;
};

export function TextField({ label, ...props }: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        {...props}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        style={[styles.input, focused && styles.inputFocused, props.multiline && styles.multiline, props.style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8
  },
  label: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase"
  },
  input: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "700"
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.ink
  },
  multiline: {
    minHeight: 96,
    paddingTop: 14,
    textAlignVertical: "top"
  }
});
