import { useRouter } from "expo-router";
import {
  Award,
  ChevronRight,
  Gift,
  Settings,
  Trophy,
  UserRound,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Card, Metric, Page, StateView } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useMe } from "@/services/queries";

const menuItems = [
  {
    title: "배지와 업적",
    subtitle: "보유한 배지 확인",
    icon: Award,
    route: "/badges" as const,
  },
  {
    title: "주간 랭킹",
    subtitle: "우리 동네 주간 점수",
    icon: Trophy,
    route: "/ranking" as const,
  },
  {
    title: "혜택 지갑",
    subtitle: "포인트 적립·사용 내역",
    icon: Gift,
    route: "/benefits" as const,
  },
  {
    title: "설정",
    subtitle: "알림 · 위치 · 개인정보",
    icon: Settings,
    route: "/settings" as const,
  },
];

export default function MyPageScreen() {
  const router = useRouter();
  const me = useMe();
  if (me.isLoading)
    return (
      <Page>
        <StateView type="loading" />
      </Page>
    );
  if (me.isError)
    return (
      <Page>
        <StateView type="error" onRetry={() => me.refetch()} />
      </Page>
    );
  const user = me.data;
  if (!user)
    return (
      <Page>
        <StateView type="empty" title="프로필을 찾지 못했어요" />
      </Page>
    );
  return (
    <Page testID="profile-screen">
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <UserRound size={30} color={colors.purpleStrong} />
        </View>
        <View style={styles.profileCopy}>
          <AppText variant="title">{user.nickname}</AppText>
          <AppText color={colors.inkMuted}>
            {user.district} · {user.rhythmWeeks}주 연속 목표 달성
          </AppText>
        </View>
        <Card
          tone="outline"
          onPress={() => router.push("/profile/edit")}
          accessibilityLabel="프로필 편집"
          style={styles.editButton}
        >
          <AppText variant="caption">편집</AppText>
        </Card>
      </View>
      <Card tone="lime" style={styles.metrics}>
        <Metric value={`${user.totalOutings}`} label="총 외출" />
        <View style={styles.metricDivider} />
        <Metric value={`${user.rhythmWeeks}주`} label="주간 리듬" />
        <View style={styles.metricDivider} />
        <Metric value={`${user.points.toLocaleString()}P`} label="포인트" />
      </Card>
      <View style={styles.menu}>
        {menuItems.map(({ title, subtitle, icon: Icon, route }) => (
          <Card
            key={title}
            tone="outline"
            onPress={() => router.push(route)}
            accessibilityLabel={title}
            style={styles.menuRow}
          >
            <View style={styles.menuIcon}>
              <Icon size={20} color={colors.ink} />
            </View>
            <View style={styles.menuCopy}>
              <AppText variant="label">{title}</AppText>
              <AppText variant="caption" color={colors.inkMuted}>
                {subtitle}
              </AppText>
            </View>
            <ChevronRight size={20} color={colors.inkFaint} />
          </Card>
        ))}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.purpleSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCopy: { flex: 1 },
  editButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  metrics: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    height: 34,
    backgroundColor: colors.limeInk,
    opacity: 0.25,
  },
  heatmapCard: { gap: spacing.lg, marginTop: spacing.sm },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menu: { gap: spacing.sm, marginTop: spacing.xl },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  menuCopy: { flex: 1, gap: 2 },
});
