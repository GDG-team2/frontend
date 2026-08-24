import { Bell, Gift, Moon, Sparkles, Target } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Card, Page, ToggleRow, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useAppStore } from "@/store/app-store";

export default function NotificationSettingsScreen() {
  const enabled = useAppStore((state) => state.notificationsEnabled);
  const setEnabled = useAppStore((state) => state.setNotificationsEnabled);
  return (
    <Page>
      <TopBar title="알림 설정" />
      <View style={styles.header}><AppText variant="title">도움 되는 순간만 알려드릴게요.</AppText><AppText color={colors.inkMuted}>모든 알림은 기본적으로 조용하고, 마케팅 알림은 꺼져 있어요.</AppText></View>
      <Card tone="purple" style={styles.master}><ToggleRow title="오하꼼 알림" description="전체 알림을 한 번에 켜거나 꺼요" value={enabled} onValueChange={setEnabled} icon={Bell} /></Card>
      <Card tone="outline" style={styles.group}>
        <ToggleRow title="오늘의 미션" description="내가 고른 시간대에 한 번" value={enabled} onValueChange={() => undefined} icon={Sparkles} />
        <ToggleRow title="주간 목표" description="목표까지 한 번 남았을 때" value={enabled} onValueChange={() => undefined} icon={Target} />
        <ToggleRow title="혜택과 포인트" description="곧 만료되는 혜택만" value={false} onValueChange={() => undefined} icon={Gift} />
      </Card>
      <Card tone="subtle" style={styles.quiet}><Moon size={20} color={colors.inkMuted} /><View style={styles.quietCopy}><AppText variant="label">방해 금지 시간</AppText><AppText variant="caption" color={colors.inkMuted}>오후 10:00 – 오전 8:00</AppText></View><AppText variant="caption" color={colors.purpleInk}>변경</AppText></Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginTop: spacing.xl },
  master: { marginTop: spacing.xl, paddingVertical: 0 },
  group: { marginTop: spacing.sm, paddingVertical: 0 },
  quiet: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm, padding: spacing.md },
  quietCopy: { flex: 1 },
});
