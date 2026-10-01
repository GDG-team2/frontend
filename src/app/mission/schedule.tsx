import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AppText,
  Button,
  Card,
  Page,
  StateView,
  TopBar,
} from "@/components/ui";
import { FormField } from "@/components/FormField";
import { RequestError } from "@/components/RequestError";
import { colors, spacing } from "@/constants/theme";
import { backend } from "@/services/backend";
import {
  queryKeys,
  useMissionDetail,
  useRecommendation,
} from "@/services/queries";
import { formatKoreaTime, toKoreaTime, validDeparture } from "@/services/time";

export default function ScheduleScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const current = useRecommendation();
  const missionId = Number(id ?? current.data?.id);
  const detail = useMissionDetail(missionId);
  const router = useRouter();
  const client = useQueryClient();
  const [departAt, setDepartAt] = useState(() =>
    toKoreaTime(Date.now() + 3600000)
      .slice(0, 16)
      .replace("T", " "),
  );
  const save = useMutation({
    mutationFn: async () => {
      const value = departAt.trim().replace(" ", "T");
      if (!validDeparture(value))
        throw new Error(
          "한국 시간 기준, 지금부터 14일 이내의 출발 시각을 YYYY-MM-DD HH:mm 형식으로 입력해 주세요.",
        );
      return backend.schedule(missionId, { departAt: `${value}:00` });
    },
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.scheduled }),
        client.invalidateQueries({ queryKey: queryKeys.recommendation }),
      ]);
    },
  });
  return (
    <Page
      action={
        <Button
          label={save.isSuccess ? "내 미션 보기" : "출발 약속 저장"}
          loading={save.isPending}
          disabled={
            !Number.isSafeInteger(missionId) ||
            detail.isLoading ||
            detail.isError ||
            detail.data?.status !== "READY"
          }
          onPress={() =>
            save.isSuccess ? router.replace("/my-missions") : save.mutate()
          }
        />
      }
    >
      <TopBar title="출발 약속" />
      {detail.isLoading || (!id && current.isLoading) ? (
        <StateView type="loading" />
      ) : detail.isError || current.isError ? (
        <StateView
          type="error"
          onRetry={() => {
            void detail.refetch();
            void current.refetch();
          }}
        />
      ) : (
        <View style={{ gap: spacing.lg, marginTop: spacing.xl }}>
          <AppText variant="title">내가 편한 시간에 나가요.</AppText>
          <Card tone="lime">
            <AppText variant="heading">
              {detail.data?.missionTitle ?? "미션을 먼저 골라주세요"}
            </AppText>
          </Card>
          <FormField
            label="출발 시각 (한국 시간)"
            value={departAt}
            onChangeText={(value) => {
              save.reset();
              setDepartAt(value);
            }}
            placeholder="2026-10-01 17:30"
            maxLength={16}
            editable={!save.isPending}
          />
          <AppText color={colors.inkMuted}>
            지금부터 14일 이내로 약속할 수 있어요. 시간이 지나도 패널티 없이
            출발할 수 있어요.
          </AppText>
          <RequestError error={save.error} />
          {save.isSuccess ? (
            <AppText accessibilityLiveRegion="polite">
              {formatKoreaTime(save.data.scheduledAt)}에 출발하기로 했어요.
            </AppText>
          ) : null}
        </View>
      )}
    </Page>
  );
}
