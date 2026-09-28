import { useBadges } from "@/services/queries";
import { Award } from "lucide-react-native";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { AppText, Card, Page, StateView, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";

export default function BadgesScreen() {
  const { width } = useWindowDimensions();
  const narrow = width < 360;
  const query = useBadges();
  if (query.isLoading)
    return (
      <Page>
        <StateView type="loading" />
      </Page>
    );
  if (query.isError)
    return (
      <Page>
        <StateView type="error" onRetry={() => query.refetch()} />
      </Page>
    );
  const badges = (query.data?.badges ?? []).map((badge) => ({
    id: badge.badgeId,
    title: badge.badgeName,
    description: badge.description,
    icon: Award,
    earned: badge.isAcquired,
    tone: badge.isAcquired ? colors.lime : colors.surfaceSubtle,
  }));

  return (
    <Page>
      <TopBar title="배지와 업적" />
      <Card tone="lime" style={styles.summary}>
        <Award size={29} color={colors.limeInk} />
        <View style={styles.summaryCopy}>
          <AppText variant="title" color={colors.limeInk}>
            {query.data?.summary?.totalCount ?? 0}개 중{" "}
            {query.data?.summary?.acquiredCount ?? 0}개
          </AppText>
          <AppText color={colors.limeInk}>
            서두르지 않아도 하나씩 쌓여요.
          </AppText>
        </View>
      </Card>
      {!badges.length ? (
        <StateView type="empty" title="등록된 배지가 없어요" />
      ) : null}
      <View style={styles.grid}>
        {badges.map(({ id, title, description, icon: Icon, earned, tone }) => (
          <Card
            key={id}
            tone="outline"
            style={[
              styles.badgeCard,
              narrow && styles.badgeCardNarrow,
              !earned && styles.locked,
            ]}
          >
            <View style={[styles.badgeIcon, { backgroundColor: tone }]}>
              <Icon size={26} color={earned ? colors.ink : colors.inkFaint} />
            </View>
            <AppText
              variant="label"
              align="center"
              color={earned ? colors.ink : colors.inkMuted}
            >
              {title}
            </AppText>
            <AppText variant="caption" align="center" color={colors.inkFaint}>
              {description}
            </AppText>
          </Card>
        ))}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  summaryCopy: { flex: 1, minWidth: 0, gap: 2 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  badgeCard: {
    width: "48%",
    minHeight: 168,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.md,
  },
  badgeCardNarrow: { width: "100%", minHeight: 148 },
  badgeIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  locked: { opacity: 0.62 },
});
