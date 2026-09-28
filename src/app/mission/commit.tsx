import { useRecommendation } from "@/services/queries";
import { useRouter } from "expo-router";
import { Check, Clock3, MapPin, ShieldCheck } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Card, Page, TopBar } from "@/components/ui";
import { colors, radius, spacing } from "@/constants/theme";

export default function CommitScreen() {
  const router = useRouter();
  const { data: mission } = useRecommendation();
  return (
    <Page
      action={
        <Button
          label="좋아요, 출발할게요"
          disabled={!mission}
          onPress={() => router.push("/mission/permission")}
        />
      }
    >
      <TopBar title="출발 약속" />
      <View style={styles.timer}>
        <View style={styles.timerInner}>
          <AppText variant="display">{mission?.durationMin ?? "—"}</AppText>
          <AppText variant="label" color={colors.inkMuted}>
            예상 소요 시간
          </AppText>
        </View>
      </View>
      <View style={styles.header}>
        <AppText variant="title" align="center">
          완벽하게 하지 않아도 돼요.
        </AppText>
        <AppText color={colors.inkMuted} align="center">
          오늘의 약속은 문 밖으로 한 걸음 나가는 것까지예요.
        </AppText>
      </View>
      <Card tone="lime" style={styles.promiseCard}>
        <MapPin size={22} color={colors.limeInk} />
        <View style={styles.promiseCopy}>
          <AppText variant="label" color={colors.limeInk}>
            {mission?.destination ?? "미션을 먼저 골라주세요"}
          </AppText>
          <AppText color={colors.limeInk}>목적지까지 가볍게 걸어보기</AppText>
        </View>
      </Card>
      <View style={styles.checklist}>
        {[
          {
            icon: Clock3,
            text:
              mission?.distanceM == null
                ? "목적지를 확인하고 출발해요"
                : `목적지까지 ${mission.distanceM}m`,
          },
          { icon: ShieldCheck, text: "중간에 돌아와도 괜찮아요" },
          { icon: Check, text: "도착하면 GPS로 확인해요" },
        ].map(({ icon: Icon, text }) => (
          <View key={text} style={styles.checkRow}>
            <View style={styles.checkIcon}>
              <Icon size={17} color={colors.ink} />
            </View>
            <AppText>{text}</AppText>
          </View>
        ))}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  timer: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: colors.limeFaint,
    borderWidth: 16,
    borderColor: colors.lime,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xxl,
  },
  timerInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    gap: spacing.xs,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  promiseCard: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xl },
  promiseCopy: { flex: 1, gap: spacing.xxs },
  checklist: {
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  checkRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  checkIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
});
