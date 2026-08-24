import type { PropsWithChildren } from "react";
import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";

import { colors, font } from "@/constants/theme";

export type TextVariant = "display" | "title" | "heading" | "body" | "label" | "caption";

type AppTextProps = TextProps &
  PropsWithChildren<{
    variant?: TextVariant;
    color?: string;
    align?: TextStyle["textAlign"];
  }>;

export function AppText({ children, variant = "body", color = colors.ink, align, style, ...props }: AppTextProps) {
  return (
    <Text {...props} style={[styles.base, styles[variant], { color, textAlign: align }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: font.regular,
    includeFontPadding: false,
  },
  display: {
    fontFamily: font.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -1.2,
  },
  title: {
    fontFamily: font.bold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.7,
  },
  heading: {
    fontFamily: font.bold,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.35,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  label: {
    fontFamily: font.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
});
