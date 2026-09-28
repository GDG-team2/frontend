import { useRouter } from "expo-router";
import { AppText, Button, Page, TopBar } from "@/components/ui";
import { colors } from "@/constants/theme";
import { backend } from "@/services/backend";
import { requestMissionLocation } from "@/services/location";
import { useMissionAction } from "@/services/queries";

export default function LocationPermissionScreen() {
  const router = useRouter();
  const start = useMissionAction(async (mission) => {
    if (mission.status === "ARRIVED") return "/mission/complete" as const;
    if (!(await requestMissionLocation()).granted)
      throw new Error("기기 설정에서 위치 권한을 허용해 주세요.");
    if (mission.status === "READY") await backend.start(Number(mission.id));
    return "/mission/active" as const;
  });
  return (
    <Page
      action={
        <Button
          label="위치 허용하고 출발하기"
          loading={start.isPending}
          onPress={() =>
            start.mutate(undefined, {
              onSuccess: (path) => router.replace(path),
            })
          }
        />
      }
    >
      <TopBar title="출발 확인" />
      <AppText variant="title">
        목적지 도착을 확인할 때 위치가 필요해요.
      </AppText>
      <AppText>출발 요청이 완료되면 산책을 시작해요.</AppText>
      {start.error ? (
        <AppText color={colors.danger}>{start.error.message}</AppText>
      ) : null}
    </Page>
  );
}
