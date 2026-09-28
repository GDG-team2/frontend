import { useRouter } from "expo-router";
import { LockKeyhole, Medal, ShieldCheck, Trophy } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import {
  AppText,
  Button,
  Card,
  Page,
  StateView,
  TopBar,
} from "@/components/ui";
import { colors, radius, spacing } from "@/constants/theme";
import { useRanking } from "@/services/queries";

export default function RankingScreen() {
  const router = useRouter();

  const query = useRanking();
  const optIn = query.data?.myRanking?.isParticipating === true;
  if (query.isLoading)
    return (
      <Page>
        <TopBar title="주간 랭킹" />
        <StateView type="loading" />
      </Page>
    );
  if (query.isError)
    return (
      <Page>
        <TopBar title="주간 랭킹" />
        <StateView type="error" onRetry={() => query.refetch()} />
      </Page>
    );
  return (
    <Page
      action={
        !optIn ? (
          <Button
            label="공개 범위 정하고 참여하기"
            icon={ShieldCheck}
            onPress={() => router.push("/ranking/settings")}
          />
        ) : undefined
      }
    >
      <TopBar
        title="주간 랭킹"
        rightLabel="설정"
        onRightPress={() => router.push("/ranking/settings")}
      />
      <Card tone="purple" style={styles.hero}>
        <View style={styles.heroIcon}>
          <Trophy size={27} color={colors.purpleInk} />
        </View>
        <View style={styles.heroCopy}>
          <AppText variant="caption" color={colors.purpleInk}>
            {query.data?.region?.regionName ?? "내 동네"} ·{" "}
            {query.data?.weekPeriod?.startDate} ~{" "}
            {query.data?.weekPeriod?.endDate}
          </AppText>
          <AppText variant="title" color={colors.purpleInk}>
            {optIn
              ? query.data?.myRanking?.rank
                ? `현재 ${query.data.myRanking.rank}위`
                : "순위 집계 중"
              : "랭킹 미참여"}
          </AppText>
          <AppText color={colors.purpleInk}>
            {optIn
              ? `이번 주 ${query.data?.myRanking?.score ?? 0}점`
              : "설정에서 공개 여부를 선택할 수 있어요."}
          </AppText>
        </View>
      </Card>
      {!optIn ? (
        <Card tone="subtle" style={styles.privateCard}>
          <LockKeyhole size={21} color={colors.inkMuted} />
          <View style={styles.privateCopy}>
            <AppText variant="label">닉네임·동네 범위를 직접 선택해요</AppText>
            <AppText variant="caption" color={colors.inkMuted}>
              정확한 위치, 경로, 미션 내용은 랭킹에 사용하지 않아요.
            </AppText>
          </View>
        </Card>
      ) : null}
      <View style={styles.header}>
        <AppText variant="heading">이번 주 동네 순위</AppText>
        <AppText variant="caption" color={colors.inkMuted}>
          주간 점수를 비교해요
        </AppText>
      </View>
      {!query.data?.leaderboard?.length ? (
        <StateView type="empty" title="아직 참여자가 없어요" />
      ) : (
        <View style={styles.list}>
          {query.data.leaderboard.map((entry) => (
            <Card
              key={`${entry.rank}-${entry.nickname}`}
              tone={
                entry.userUuid === query.data?.myRanking?.userUuid
                  ? "lime"
                  : "outline"
              }
              style={styles.row}
            >
              <View
                style={[
                  styles.rank,
                  (entry.rank ?? 0) > 0 &&
                    (entry.rank ?? 0) <= 3 &&
                    styles.topRank,
                ]}
              >
                {(entry.rank ?? 0) > 0 && (entry.rank ?? 0) <= 3 ? (
                  <Medal size={20} color={colors.purpleStrong} />
                ) : (
                  <AppText variant="label">{entry.rank}</AppText>
                )}
              </View>
              <AppText variant="label" style={styles.nickname}>
                {entry.userUuid === query.data?.myRanking?.userUuid && !optIn
                  ? "나 (비공개)"
                  : entry.nickname}
              </AppText>
              <AppText variant="label" color={colors.inkMuted}>
                {entry.score ?? 0}점
              </AppText>
            </Card>
          ))}
        </View>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: { flex: 1, gap: 2 },
  privateCard: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  privateCopy: { flex: 1, gap: 2 },
  header: { gap: 2, marginTop: spacing.xxl, marginBottom: spacing.md },
  list: { gap: spacing.xs },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  rank: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSubtle,
  },
  topRank: { backgroundColor: colors.purpleSoft },
  nickname: { flex: 1 },
});
