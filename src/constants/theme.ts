import { Platform } from "react-native";

export const colors = {
  ink: "#161614",
  inkMuted: "#73736D",
  inkFaint: "#9B9A93",
  canvas: "#F2F1EB",
  surface: "#FFFFFF",
  surfaceSubtle: "#F7F6F1",
  chip: "#F4F3ED",
  border: "#E8E7E0",
  borderStrong: "#DAD9D2",
  lime: "#D9F56A",
  limeStrong: "#CFF75A",
  limeSoft: "#EEF9B9",
  limeFaint: "#F2F8CF",
  limeInk: "#59620D",
  limeIcon: "#7EAA19",
  purple: "#7767F7",
  purpleStrong: "#6857E6",
  purpleSoft: "#EAE6FF",
  purpleFaint: "#F2EFFF",
  purpleInk: "#5142C6",
  successSoft: "#E8F4E9",
  success: "#3E6B41",
  dangerSoft: "#FBE8E5",
  danger: "#B14B40",
  kakao: "#FEE500",
  white: "#FFFFFF",
  transparent: "transparent",
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  huge: 40,
  section: 56,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
} as const;

export const font = {
  regular: "NotoSansKR_400Regular",
  medium: "NotoSansKR_500Medium",
  bold: "NotoSansKR_700Bold",
  mono: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
} as const;

export const shadow = {
  card: Platform.select({
    ios: {
      shadowColor: "#161614",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.06,
      shadowRadius: 20,
    },
    android: { elevation: 3 },
    default: { boxShadow: "0 8px 24px rgba(22,22,20,0.06)" },
  }),
  floating: Platform.select({
    ios: {
      shadowColor: "#161614",
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
    },
    android: { elevation: 8 },
    default: { boxShadow: "0 -8px 28px rgba(22,22,20,0.08)" },
  }),
} as const;

export const layout = {
  maxWidth: 480,
  screenPadding: 20,
  minTouch: 44,
  bottomActionHeight: 88,
} as const;
