import { useRouter } from "expo-router";
import { Bell, ChevronRight, CircleHelp, FileText, KeyRound, LogOut, MapPin, ShieldCheck, SlidersHorizontal } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText, Card, ListRow, Page, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { clearAccessToken } from "@/services/session";
import { useAppStore } from "@/store/app-store";

export default function SettingsScreen() {
  const router = useRouter();
  const reset = useAppStore((state) => state.reset);
  async function logout() {
    await clearAccessToken();
    reset();
    router.replace("/");
  }
  return (
    <Page>
      <TopBar title="설정" />
      <AppText variant="caption" color={colors.inkMuted} style={styles.groupLabel}>앱 설정</AppText>
      <Card tone="outline" style={styles.group}>
        <ListRow title="알림 설정" subtitle="미션 · 목표 · 혜택" icon={Bell} onPress={() => router.push("/settings/notifications")} />
        <ListRow title="개인정보와 권한" subtitle="위치 · 기록 · 데이터" icon={ShieldCheck} onPress={() => router.push("/settings/privacy")} />
        <ListRow title="QA 시나리오" subtitle="목업 API 상태와 화면 확인" icon={SlidersHorizontal} onPress={() => router.push("/qa")} />
      </Card>
      <AppText variant="caption" color={colors.inkMuted} style={styles.groupLabel}>도움과 정보</AppText>
      <Card tone="outline" style={styles.group}>
        <ListRow title="도움말" icon={CircleHelp} onPress={() => undefined} />
        <ListRow title="이용약관" icon={FileText} onPress={() => undefined} />
        <ListRow title="개인정보 처리방침" icon={KeyRound} onPress={() => undefined} />
      </Card>
      <Card tone="subtle" style={styles.appInfo}>
        <View><AppText variant="label">오하꼼</AppText><AppText variant="caption" color={colors.inkMuted}>버전 1.0.0 · Expo SDK 57</AppText></View>
        <View style={styles.buildBadge}><AppText variant="caption" color={colors.purpleInk}>MSW QA</AppText></View>
      </Card>
      <Pressable accessibilityRole="button" accessibilityLabel="로그아웃" onPress={() => void logout()} style={styles.logout}>
        <LogOut size={18} color={colors.danger} />
        <AppText variant="label" color={colors.danger}>로그아웃</AppText>
        <ChevronRight size={18} color={colors.danger} style={styles.logoutChevron} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="위치 안내" style={styles.locationNote}>
        <MapPin size={15} color={colors.inkFaint} /><AppText variant="caption" color={colors.inkFaint}>현재 활동 동네 · 서울 마포구</AppText>
      </Pressable>
    </Page>
  );
}

const styles = StyleSheet.create({
  groupLabel: { marginTop: spacing.xl, marginBottom: spacing.xs },
  group: { paddingVertical: 0 },
  appInfo: { marginTop: spacing.xl, flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.md },
  buildBadge: { backgroundColor: colors.purpleSoft, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99 },
  logout: { minHeight: 60, marginTop: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  logoutChevron: { marginLeft: "auto" },
  locationNote: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 5 },
});
