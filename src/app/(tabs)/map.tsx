import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { MapPinned } from "lucide-react-native";
import { AppText, Card, Page, StateView } from "@/components/ui";
import { ChoiceGroup } from "@/components/ChoiceGroup";
import { MapLink } from "@/components/MapLink";
import { colors, spacing } from "@/constants/theme";
import { useMissionMap } from "@/services/queries";
import { formatKoreaTime } from "@/services/time";
export default function PersonalMapScreen() {
  const [period, setPeriod] = useState<"WEEK" | "MONTH" | "ALL">("MONTH");
  const query = useMissionMap({ period });
  const router = useRouter();
  return (
    <Page testID="map-screen">
      <View style={{ gap: spacing.lg }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <MapPinned size={24} color={colors.purpleStrong} />
          <AppText variant="title">내 지도</AppText>
        </View>
        <ChoiceGroup
          title="다녀온 기간"
          options={{ WEEK: "이번 주", MONTH: "이번 달", ALL: "전체" }}
          value={period}
          onChange={setPeriod}
        />
        {query.isLoading ? (
          <StateView type="loading" />
        ) : query.isError ? (
          <StateView
            type="error"
            description={query.error.message}
            onRetry={() => query.refetch()}
          />
        ) : (
          <>
            <Card tone="lime" style={{ gap: spacing.xs }}>
              <AppText variant="heading">
                {query.data?.stats?.outingCount ?? 0}번 나가고,{" "}
                {query.data?.stats?.newPlaceCount ?? 0}곳 발견했어요
              </AppText>
              <AppText>
                예상 왕복 이동{" "}
                {(
                  (query.data?.stats?.totalRouteDistanceMeters ?? 0) / 1000
                ).toFixed(1)}
                km
              </AppText>
            </Card>
            <AppText variant="heading">다녀온 장소</AppText>
            <AppText color={colors.inkMuted}>
              장소의 정확한 위치와 길찾기는 카카오맵에서 볼 수 있어요.
            </AppText>
            {!query.data?.places?.length ? (
              <StateView
                type="empty"
                title="아직 다녀온 장소가 없어요"
                description="미션을 마치면 나만의 장소가 쌓여요."
              />
            ) : (
              query.data.places.map((place) => (
                <Card
                  key={place.placeId}
                  tone="outline"
                  style={{ gap: spacing.sm }}
                >
                  <AppText variant="heading">{place.name}</AppText>
                  <AppText variant="caption" color={colors.inkMuted}>
                    {place.visitCount}번 방문 ·{" "}
                    {formatKoreaTime(place.lastVisitedAt)}
                  </AppText>
                  <MapLink
                    name={place.name ?? "방문 장소"}
                    latitude={place.latitude}
                    longitude={place.longitude}
                  />
                </Card>
              ))
            )}
            {query.data?.recent?.length ? (
              <>
                <AppText variant="heading">최근 기록</AppText>
                {query.data.recent.map((record) => (
                  <Card
                    key={record.missionId}
                    tone="purple"
                    onPress={() => router.push(`/history/${record.missionId}`)}
                    accessibilityLabel={`${record.missionTitle} 기록 보기`}
                  >
                    <AppText variant="label">{record.missionTitle}</AppText>
                    <AppText variant="caption">
                      {formatKoreaTime(record.completedAt)} ·{" "}
                      {record.durationMinutes}분
                    </AppText>
                  </Card>
                ))}
              </>
            ) : null}
          </>
        )}
      </View>
    </Page>
  );
}
