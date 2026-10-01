import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AppText,
  Button,
  Card,
  Page,
  StateView,
  TopBar,
} from "@/components/ui";
import { ChoiceGroup } from "@/components/ChoiceGroup";
import { HistoryContent } from "@/components/HistoryContent";
import { RequestError } from "@/components/RequestError";
import { colors, spacing } from "@/constants/theme";
import { backend } from "@/services/backend";
import { requestMissionLocation } from "@/services/location";
import { useRecommendation, useScheduled, queryKeys } from "@/services/queries";
import { formatKoreaTime } from "@/services/time";
export default function MyMissionsScreen() {
  const [tab, setTab] = useState<"scheduled" | "current" | "completed">(
    "scheduled",
  );
  const [cancelId, setCancelId] = useState<number>();
  const router = useRouter();
  const client = useQueryClient();
  const scheduled = useScheduled();
  const current = useRecommendation();
  const action = useMutation({
    mutationFn: async ({
      id,
      kind,
    }: {
      id: number;
      kind: "start" | "abort";
    }) => {
      if (kind === "abort") return backend.abort(id);
      if (!(await requestMissionLocation()).granted)
        throw new Error("출발하려면 위치 권한을 허용해 주세요.");
      return backend.start(id);
    },
    onSuccess: async (_, vars) => {
      setCancelId(undefined);
      await Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.scheduled }),
        client.invalidateQueries({ queryKey: queryKeys.recommendation }),
      ]);
      if (vars.kind === "start") router.push("/mission/active");
    },
    onError: () => {
      void client.invalidateQueries({ queryKey: queryKeys.scheduled });
      void client.invalidateQueries({ queryKey: queryKeys.recommendation });
    },
  });
  return (
    <Page>
      <TopBar title="내 미션" />
      <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
        <ChoiceGroup
          title="미션 상태"
          options={{ scheduled: "예정", current: "진행 중", completed: "완료" }}
          value={tab}
          onChange={setTab}
        />
        <RequestError error={action.error} />
        {tab === "completed" ? (
          <HistoryContent />
        ) : tab === "current" ? (
          current.isLoading ? (
            <StateView type="loading" />
          ) : current.isError ? (
            <StateView type="error" onRetry={() => current.refetch()} />
          ) : current.data ? (
            <Card tone="lime" style={{ gap: spacing.md }}>
              <AppText variant="heading">{current.data.title}</AppText>
              <AppText>
                {current.data.status === "READY"
                  ? "출발을 기다리고 있어요"
                  : "산책을 이어가요"}
              </AppText>
              <Button
                label="미션 이어하기"
                onPress={() => router.push("/mission")}
              />
            </Card>
          ) : (
            <StateView
              type="empty"
              title="진행 중인 미션이 없어요"
              actionLabel="미션 받기"
              onAction={() => router.push("/mission")}
            />
          )
        ) : scheduled.isLoading ? (
          <StateView type="loading" />
        ) : scheduled.isError ? (
          <StateView type="error" onRetry={() => scheduled.refetch()} />
        ) : !scheduled.data?.missions?.length ? (
          <StateView
            type="empty"
            title="아직 출발 약속이 없어요"
            description="마음에 드는 미션을 골라 출발 시간을 정해보세요."
            actionLabel="미션 받기"
            onAction={() => router.push("/mission")}
          />
        ) : (
          scheduled.data.missions.map((mission) => (
            <Card
              key={mission.missionId}
              tone="outline"
              style={{ gap: spacing.sm }}
            >
              <AppText variant="caption" color={colors.purpleInk}>
                {formatKoreaTime(mission.scheduledAt)} ·{" "}
                {mission.isOverdue
                  ? "시간이 지나도 출발할 수 있어요"
                  : `${mission.minutesUntilDeparture}분 후`}
              </AppText>
              <AppText variant="heading">{mission.missionTitle}</AppText>
              <AppText>
                {mission.totalMinutes ?? "—"}분 ·{" "}
                {(mission.estCost ?? 0).toLocaleString()}원 예상
              </AppText>
              <Button
                label="지금 출발하기"
                disabled={action.isPending}
                onPress={() =>
                  action.mutate({ id: mission.missionId!, kind: "start" })
                }
              />
              <Button
                label="출발 시간 변경"
                variant="secondary"
                disabled={action.isPending}
                onPress={() =>
                  router.push({
                    pathname: "/mission/schedule",
                    params: { id: mission.missionId },
                  })
                }
              />
              <Button
                label={
                  cancelId === mission.missionId
                    ? "이 약속 취소 확인"
                    : "약속 취소"
                }
                variant="secondary"
                disabled={action.isPending}
                onPress={() =>
                  cancelId === mission.missionId
                    ? action.mutate({ id: mission.missionId!, kind: "abort" })
                    : setCancelId(mission.missionId)
                }
              />
            </Card>
          ))
        )}
      </View>
    </Page>
  );
}
