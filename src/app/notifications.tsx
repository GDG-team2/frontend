import { Bell, Gift, Sparkles } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Page, StateView, TopBar } from "@/components/ui";
import { colors, font, radius, spacing } from "@/constants/theme";
import { useNotifications } from "@/services/queries";

const icons = { mission: Sparkles, reward: Gift, system: Bell };

export default function NotificationsScreen() {
  const query = useNotifications();
  if (query.isLoading) return <Page><TopBar title="알림" /><StateView type="loading" /></Page>;
  if (query.isError) return <Page><TopBar title="알림" /><StateView type="error" onRetry={() => query.refetch()} /></Page>;
  return (
    <Page>
      <TopBar title="알림" rightLabel="모두 읽음" onRightPress={() => undefined} />
      {!query.data?.length ? <StateView type="empty" title="새 알림이 없어요" description="미션과 기록 소식이 여기에 도착해요." /> : (
        <View style={styles.list}>
          {query.data.map((item, index) => {
            const Icon = icons[item.type];
            return (
              <View key={item.id} style={[styles.row, item.unread && styles.rowUnread, index < query.data.length - 1 && styles.rowDivider]}>
                <View style={[styles.icon, item.unread && styles.iconUnread]}><Icon size={19} color={item.unread ? colors.purpleInk : colors.inkMuted} /></View>
                <View style={styles.copy}>
                  <View style={styles.titleRow}><AppText style={styles.title}>{item.title}</AppText><AppText style={styles.date} color={colors.inkFaint}>{item.date}</AppText></View>
                  <AppText style={styles.body} color={colors.inkMuted}>{item.body}</AppText>
                </View>
                {item.unread ? <View style={styles.dot} /> : null}
              </View>
            );
          })}
        </View>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: spacing.md, borderRadius: radius.xl, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.surfaceRaised, overflow: "hidden" },
  row: { minHeight: 96, flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, padding: spacing.md },
  rowUnread: { backgroundColor: colors.purpleFaint },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceSubtle, alignItems: "center", justifyContent: "center" },
  iconUnread: { backgroundColor: colors.white },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  titleRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: spacing.xs },
  title: { flex: 1, minWidth: 140, fontFamily: font.medium, fontSize: 16, lineHeight: 22, letterSpacing: -0.2 },
  date: { flexShrink: 0, fontSize: 12, lineHeight: 20 },
  body: { fontSize: 14, lineHeight: 22 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.purple, marginTop: 7 },
});
