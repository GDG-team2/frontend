import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText, Button, Card, Page, TopBar } from "@/components/ui";
import { colors, radius, spacing } from "@/constants/theme";

const items = [
  { id: "age", title: "만 14세 이상이에요", required: true },
  { id: "terms", title: "서비스 이용약관에 동의해요", required: true },
  { id: "privacy", title: "개인정보 수집·이용에 동의해요", required: true },
  { id: "marketing", title: "동네 혜택과 소식을 받아볼게요", required: false },
];

export default function TermsScreen() {
  const router = useRouter();
  const [checked, setChecked] = useState<string[]>(["age", "terms", "privacy"]);
  const requiredReady = items.filter((item) => item.required).every((item) => checked.includes(item.id));

  function toggle(id: string) {
    setChecked((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <Page action={<Button label="다음" disabled={!requiredReady} onPress={() => router.push("/onboarding/profile")} />}>
      <TopBar title="약관 동의" />
      <View style={styles.header}>
        <AppText variant="title">필요한 약속만 확인할게요.</AppText>
        <AppText color={colors.inkMuted}>선택 동의는 언제든 설정에서 바꿀 수 있어요.</AppText>
      </View>
      <Card tone="subtle" style={styles.list}>
        {items.map((item, index) => {
          const selected = checked.includes(item.id);
          return (
            <Pressable
              key={item.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={item.title}
              onPress={() => toggle(item.id)}
              style={[styles.row, index < items.length - 1 && styles.divider]}
            >
              <View style={[styles.check, selected && styles.checkSelected]}>
                {selected ? <Check size={16} strokeWidth={3} color={colors.ink} /> : null}
              </View>
              <AppText variant="label" style={styles.rowTitle}>{item.title}</AppText>
              <AppText variant="caption" color={item.required ? colors.purpleInk : colors.inkFaint}>{item.required ? "필수" : "선택"}</AppText>
            </Pressable>
          );
        })}
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xxl, marginBottom: spacing.xl, gap: spacing.xs },
  list: { paddingVertical: 0, paddingHorizontal: spacing.md },
  row: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  check: { width: 24, height: 24, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center" },
  checkSelected: { backgroundColor: colors.lime, borderColor: colors.limeStrong },
  rowTitle: { flex: 1 },
});
