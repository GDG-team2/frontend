import { useState } from "react";
import { ChoiceGroup } from "@/components/ChoiceGroup";
import { abortReasons } from "@/constants/options";
import type { MissionAbortRequest } from "@/types/api";
import { backend } from "@/services/backend";
import { useMissionAction, useRecommendation } from "@/services/queries";
import { useRouter } from "expo-router";
import { Home, RotateCcw, ShieldCheck } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Card, Page, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";

export default function EndMissionScreen() {
  const router = useRouter();
  const [reason, setReason] = useState<MissionAbortRequest["reason"]>();
  const current = useRecommendation();
  const abort = useMissionAction(async (mission) => {
    try {
      return await backend.abort(Number(mission.id), { reason });
    } catch (error) {
      const detail = await backend
        .mission(Number(mission.id))
        .catch(() => null);
      if (detail?.status === "ABORTED")
        return {
          status: "ABORTED",
          nextRecommendationNote: "미션 중단이 반영됐어요.",
        };
      throw error;
    }
  });
  return (
    <Page>
      <TopBar title="미션 종료" />
      <View style={styles.icon}>
        <ShieldCheck size={38} color={colors.success} />
      </View>
      <View style={styles.header}>
        <AppText variant="title" align="center">
          여기서 멈춰도 충분해요.
        </AppText>
        <AppText color={colors.inkMuted} align="center">
          미션을 중단하면 완료 보상은 지급되지 않아요. 다시 준비됐을 때 새
          산책을 시작해요.
        </AppText>
      </View>
      <Card tone="lime" style={styles.card}>
        <AppText variant="heading" color={colors.limeInk}>
          오늘 이미 해낸 것
        </AppText>
        <AppText color={colors.limeInk}>
          집 밖으로 나왔고 · 새로운 골목을 걸었고 · 스스로 멈출 시점을 골랐어요.
        </AppText>
      </Card>
      {!abort.isSuccess ? (
        <View style={{ marginTop: spacing.lg }}>
          <ChoiceGroup
            title="멈추는 이유 (선택)"
            options={abortReasons}
            value={reason}
            disabled={abort.isPending}
            onChange={setReason}
          />
        </View>
      ) : (
        <Card tone="purple" style={styles.card}>
          <AppText>
            {abort.data?.nextRecommendationNote ??
              "미션을 중단했어요. 준비됐을 때 다시 만나요."}
          </AppText>
        </Card>
      )}
      {abort.error ? (
        <AppText color={colors.danger}>{abort.error.message}</AppText>
      ) : null}
      <View style={styles.actions}>
        <Button
          label={
            abort.isSuccess || !current.data
              ? "홈으로 돌아가기"
              : "잠깐 쉬고 계속"
          }
          disabled={abort.isPending}
          icon={RotateCcw}
          onPress={() =>
            abort.isSuccess || !current.data
              ? router.replace("/(tabs)")
              : router.back()
          }
        />
        {!abort.isSuccess && current.data ? (
          <Button
            label="미션 중단하기"
            loading={abort.isPending}
            icon={Home}
            variant="secondary"
            onPress={() => abort.mutate()}
          />
        ) : null}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.successSoft,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.huge,
  },
  header: {
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  card: { gap: spacing.xs, marginTop: spacing.xxl },
  actions: { gap: spacing.sm, marginTop: spacing.xl },
});
