import { SettingsEditor } from "@/components/SettingsEditor";
export default function RankingSettingsScreen() {
  return (
    <SettingsEditor
      title="공개 설정"
      fields={[
        ["rankingSetting", "랭킹 공개"],
        ["nameSetting", "이름 공개"],
        ["placeSetting", "장소 공개"],
        ["friendSetting", "친구 공개"],
      ]}
    />
  );
}
