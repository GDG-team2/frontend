import { useRouter } from "expo-router";
import { Linking } from "react-native";
import {
  AppText,
  Button,
  Card,
  Page,
  StateView,
  TopBar,
} from "@/components/ui";
import { useRecommendation } from "@/services/queries";
export default function PlaceScreen() {
  const router = useRouter();
  const current = useRecommendation();
  if (current.isLoading)
    return (
      <Page>
        <StateView type="loading" />
      </Page>
    );
  if (current.isError)
    return (
      <Page>
        <StateView type="error" onRetry={() => current.refetch()} />
      </Page>
    );
  const mission = current.data;
  if (!mission)
    return (
      <Page>
        <StateView
          type="empty"
          title="선택한 목적지가 없어요"
          actionLabel="미션 고르기"
          onAction={() => router.replace("/mission")}
        />
      </Page>
    );
  return (
    <Page>
      <TopBar title="목적지" />
      <Card>
        <AppText variant="title">{mission.destination}</AppText>
        <AppText>{mission.address}</AppText>
        <AppText>{mission.tags.join(" · ")}</AppText>
      </Card>
      <Button
        label="지도에서 보기"
        onPress={() =>
          void Linking.openURL(
            `https://map.kakao.com/link/map/${encodeURIComponent(mission.destination)},${mission.latitude},${mission.longitude}`,
          )
        }
      />
      <Button
        label="현재 미션으로"
        variant="secondary"
        onPress={() => router.replace("/mission")}
      />
    </Page>
  );
}
