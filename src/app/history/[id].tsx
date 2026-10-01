import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { AppText, Card, Page, StateView, TopBar } from "@/components/ui";
import { MapLink } from "@/components/MapLink";
import { colors, spacing } from "@/constants/theme";
import { abortReasons, categories } from "@/constants/options";
import { useMissionDetail } from "@/services/queries";
import { formatKoreaTime } from "@/services/time";
export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const missionId = Number(id);
  const query = useMissionDetail(missionId);
  const data = query.data;
  return (
    <Page>
      <TopBar title="기록 상세" />
      {!Number.isSafeInteger(missionId) || missionId <= 0 ? (
        <StateView type="empty" title="기록 주소를 확인해 주세요" />
      ) : query.isLoading ? (
        <StateView type="loading" />
      ) : query.isError ? (
        <StateView
          type="error"
          description={query.error.message}
          onRetry={() => query.refetch()}
        />
      ) : data ? (
        <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
          <AppText variant="caption" color={colors.purpleInk}>
            {data.status === "COMPLETED"
              ? "완료한 외출"
              : data.status === "ABORTED"
                ? "중단한 외출"
                : "미션"}{" "}
            · {data.placeCategory ? categories[data.placeCategory] : ""}
          </AppText>
          <AppText variant="title">{data.missionTitle}</AppText>
          <AppText color={colors.inkMuted}>
            {data.place?.name} · {data.place?.roadAddress}
          </AppText>
          <MapLink
            name={data.place?.name ?? "목적지"}
            latitude={data.place?.latitude}
            longitude={data.place?.longitude}
            placeUrl={data.place?.placeUrl}
          />
          <Card tone="lime" style={{ gap: spacing.xs }}>
            <AppText variant="heading">
              {data.durationMinutes ?? 0}분의 외출
            </AppText>
            <AppText>
              예상 왕복 {((data.routeDistanceMeters ?? 0) / 1000).toFixed(1)}km
              · 예상 비용 {(data.estCost ?? 0).toLocaleString()}원
            </AppText>
            <AppText variant="caption">
              이동 거리는 실제 경로 추적값이 아닌 추천 시점의 추정 거리예요.
            </AppText>
            {data.stepCount != null ? (
              <AppText>{data.stepCount.toLocaleString()}걸음</AppText>
            ) : null}
          </Card>
          {data.mood ? (
            <Card tone="purple" style={{ gap: spacing.xs }}>
              <AppText variant="heading">외출 전후의 기분</AppText>
              <AppText>
                {data.mood.beforeScore ?? "미선택"} →{" "}
                {data.mood.afterScore ?? "미기록"} / 5
              </AppText>
              {data.mood.change != null ? (
                <AppText>
                  기분 변화 {data.mood.change > 0 ? "+" : ""}
                  {data.mood.change}
                </AppText>
              ) : null}
            </Card>
          ) : null}
          {data.abort ? (
            <Card tone="subtle">
              <AppText>
                {data.abort.reason
                  ? abortReasons[data.abort.reason]
                  : "이유 없이 중단했어요"}
              </AppText>
              {data.abort.movedDistanceMeters != null ? (
                <AppText>이동 {data.abort.movedDistanceMeters}m</AppText>
              ) : null}
            </Card>
          ) : null}
          <AppText variant="heading">이번 외출의 흐름</AppText>
          {data.timeline?.map((event, index) => (
            <Card
              key={`${event.type}-${index}`}
              tone="outline"
              style={{ gap: spacing.xs }}
            >
              <AppText variant="caption" color={colors.inkMuted}>
                {formatKoreaTime(event.at)}
              </AppText>
              <AppText>{event.note}</AppText>
            </Card>
          ))}
        </View>
      ) : (
        <StateView type="empty" title="기록을 찾을 수 없어요" />
      )}
    </Page>
  );
}
