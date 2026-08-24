import { Platform } from "react-native";

export const colors = {
  ink: "#161614",
  inkMuted: "#73736D",
  inkFaint: "#9B9A93",
  canvas: "#F2F1EB",
  surface: "#FFFFFF",
  surfaceRaised: "#FFFFFF",
  surfaceSubtle: "#F7F6F1",
  chip: "#F4F3ED",
  border: "#E8E7E0",
  borderStrong: "#DAD9D2",
  lime: "#DAF768",
  limeStrong: "#D0F958",
  limeSoft: "#EEFAB8",
  limeFaint: "#F2F8CF",
  limeInk: "#59620D",
  limeIcon: "#7EAA19",
  purple: "#7463FB",
  purpleStrong: "#6553EA",
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
  sm: 9,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 26,
  round: 999,
} as const;

export const font = {
  regular: "NotoSansKR_400Regular",
  medium: "NotoSansKR_500Medium",
  bold: "NotoSansKR_700Bold",
  mono: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
} as const;

export const shadow = {
  soft: Platform.select({
    ios: {
      shadowColor: "#161614",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    android: { elevation: 2 },
    default: { boxShadow: "0 4px 14px rgba(22,22,20,0.06)" },
  }),
  card: Platform.select({
    ios: {
      shadowColor: "#161614",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.09,
      shadowRadius: 22,
    },
    android: { elevation: 4 },
    default: { boxShadow: "0 10px 28px rgba(22,22,20,0.09)" },
  }),
  raised: Platform.select({
    ios: {
      shadowColor: "#161614",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 28,
    },
    android: { elevation: 7 },
    default: { boxShadow: "0 14px 36px rgba(22,22,20,0.12)" },
  }),
  floating: Platform.select({
    ios: {
      shadowColor: "#161614",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.14,
      shadowRadius: 18,
    },
    android: { elevation: 8 },
    default: { boxShadow: "0 10px 24px rgba(22,22,20,0.14)" },
  }),
  docked: Platform.select({
    ios: {
      shadowColor: "#161614",
      shadowOffset: { width: 0, height: -5 },
      shadowOpacity: 0.1,
      shadowRadius: 18,
    },
    android: { elevation: 8 },
    default: { boxShadow: "0 -6px 24px rgba(22,22,20,0.1)" },
  }),
  tab: Platform.select({
    ios: {
      shadowColor: "#161614",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 28,
    },
    android: { elevation: 10 },
    default: { boxShadow: "0 12px 34px rgba(22,22,20,0.15)" },
  }),
} as const;

export const layout = {
  maxWidth: 480,
  screenPadding: 24,
  minTouch: 44,
  bottomActionHeight: 92,
} as const;
