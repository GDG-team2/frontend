import { SettingsEditor } from "@/components/SettingsEditor";
export default function NotificationSettingsScreen() {
  return (
    <SettingsEditor
      title="알림 설정"
      quiet
      fields={[
        ["allAlarm", "전체 알림"],
        ["startAlarm", "시작 알림"],
        ["missionAlarm", "미션 알림"],
        ["insightAlarm", "인사이트 알림"],
        ["rewardAlarm", "보상 알림"],
      ]}
    />
  );
}
