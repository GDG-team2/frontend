import { Redirect, useRouter } from "expo-router";
import { Info, MapPin, RotateCcw, Sparkles, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import {
  AppText,
  Button,
  Card,
  Chip,
  MapPreview,
  Metric,
  Page,
  StateView,
  TopBar,
} from "@/components/ui";
import { colors, layout, radius, spacing } from "@/constants/theme";
import { useRecommendation, useRecommendMission } from "@/services/queries";

const rejectReasons = [
  "조금 멀어요",
  "지금은 실외가 싫어요",
  "취향이 아니에요",
  "다른 걸 보고 싶어요",
];

export default function MissionScreen() {
  const router = useRouter();
  const recommendation = useRecommendation();
  const generate = useRecommendMission();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (recommendation.isLoading)
    return (
      <Page>
        <TopBar title="미션 제안" />
        <StateView
          type="loading"
          description="컨디션과 동네를 보고 하나만 고르는 중이에요."
        />
      </Page>
    );
  if (recommendation.isError)
    return (
      <Page>
        <TopBar title="미션 제안" />
        <StateView
          type="error"
          description="미션을 고르지 못했어요."
          onRetry={() => recommendation.refetch()}
        />
      </Page>
    );
  if (recommendation.data?.status === "IN_PROGRESS")
    return <Redirect href="/mission/active" />;
  if (recommendation.data?.status === "ARRIVED")
    return <Redirect href="/mission/complete" />;
  if (!recommendation.data) {
    return (
      <Page>
        <TopBar title="미션 제안" />
        <StateView
          type="empty"
          title="가까운 산책 미션을 찾아볼까요?"
          description="현재 위치를 허용하면 주변 목적지를 추천해요."
        />
        {generate.error ? (
          <AppText color={colors.danger}>{generate.error.message}</AppText>
        ) : null}
        <Button
          label="현재 위치로 미션 추천받기"
          loading={generate.isPending}
          onPress={() => generate.mutate()}
        />
      </Page>
    );
  }

  const mission = recommendation.data;
  return (
    <Page
      testID="mission-screen"
      actionHeight={118}
      action={
        <View style={styles.actionStack}>
          <Button
            label="이 미션으로 나가기"
            onPress={() => router.push("/mission/commit")}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="다른 미션 보기"
            onPress={() => setRejectOpen(true)}
            style={styles.rejectButton}
          >
            <RotateCcw size={16} color={colors.inkMuted} />
            <AppText variant="label" color={colors.inkMuted}>
              다른 미션 보기
            </AppText>
          </Pressable>
        </View>
      }
    >
      {generate.error ? (
        <AppText color={colors.danger}>{generate.error.message}</AppText>
      ) : null}
      <TopBar
        title="오늘의 미션"
        rightIcon={Info}
        onRightPress={() => router.push("/mission/details")}
      />
      <View style={styles.eyebrow}>
        <Sparkles size={16} color={colors.purpleStrong} />
        <AppText variant="label" color={colors.purpleInk}>
          내 주변에서 찾은 한 칸
        </AppText>
      </View>
      <AppText variant="title">{mission.title}</AppText>
      <AppText color={colors.inkMuted} style={styles.summary}>
        {mission.summary}
      </AppText>
      <View style={styles.tags}>
        {mission.tags.map((tag) => (
          <Chip key={tag} label={tag} compact />
        ))}
      </View>
      <MapPreview height={230} />
      <Card tone="subtle" style={styles.metrics}>
        <Metric
          value={mission.durationMin == null ? "—" : `${mission.durationMin}분`}
          label="예상 시간"
        />
        <View style={styles.metricDivider} />
        <Metric
          value={mission.distanceM == null ? "—" : `${mission.distanceM}m`}
          label="거리"
        />
        <View style={styles.metricDivider} />
        <Metric
          value={`+${mission.reward}P`}
          label="완료 보상"
          accent={colors.purpleStrong}
        />
      </Card>
      <Card tone="purple" style={styles.reasonCard}>
        <View style={styles.reasonIcon}>
          <Sparkles size={18} color={colors.purpleInk} />
        </View>
        <View style={styles.reasonCopy}>
          <AppText variant="label" color={colors.purpleInk}>
            왜 이 미션인가요?
          </AppText>
          <AppText color={colors.purpleInk}>{mission.reason}</AppText>
        </View>
      </Card>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/place")}
        style={styles.placeRow}
      >
        <View style={styles.placeIcon}>
          <MapPin size={18} color={colors.limeInk} />
        </View>
        <View style={styles.placeCopy}>
          <AppText variant="label">{mission.destination}</AppText>
          <AppText variant="caption" color={colors.inkMuted}>
            {mission.address}
          </AppText>
        </View>
        <AppText variant="caption" color={colors.purpleInk}>
          장소 보기
        </AppText>
      </Pressable>

      <Modal
        visible={rejectOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setRejectOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="닫기"
            style={StyleSheet.absoluteFill}
            onPress={() => setRejectOpen(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <AppText variant="heading">어떤 점이 아쉬웠나요?</AppText>
                <AppText variant="caption" color={colors.inkMuted}>
                  현재 위치를 기준으로 다시 추천해요.
                </AppText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="닫기"
                onPress={() => setRejectOpen(false)}
                style={styles.closeButton}
              >
                <X size={21} color={colors.ink} />
              </Pressable>
            </View>
            <View style={styles.tags}>
              {rejectReasons.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  selected={reason === item}
                  onPress={() => setReason(item)}
                />
              ))}
            </View>
            <Button
              label="새 미션 받기"
              disabled={!reason}
              loading={generate.isPending}
              onPress={() => {
                setRejectOpen(false);
                generate.mutate();
              }}
            />
          </View>
        </View>
      </Modal>
    </Page>
  );
}

const styles = StyleSheet.create({
  actionStack: { gap: spacing.xxs },
  rejectButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  summary: { marginTop: spacing.xs, marginBottom: spacing.md },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  metrics: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    height: 34,
    backgroundColor: colors.borderStrong,
  },
  reasonCard: {
    marginTop: spacing.sm,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  reasonIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  reasonCopy: { flex: 1, gap: spacing.xxs },
  placeRow: {
    minHeight: 70,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  placeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.limeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  placeCopy: { flex: 1 },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(22,22,20,0.34)",
    alignItems: "center",
  },
  sheet: {
    width: "100%",
    maxWidth: layout.maxWidth,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    backgroundColor: colors.surface,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
