import { useState } from "react";
import { TextInput, View } from "react-native";
import { AppText, Button, Card, Chip, Page, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useSaveSettings } from "@/services/queries";
import { useAppStore } from "@/store/app-store";
import type { UserSettingsUpdateRequest } from "@/types/api";

type BooleanSetting = Exclude<
  keyof UserSettingsUpdateRequest,
  "quietStart" | "quietEnd"
>;
export function SettingsEditor({
  title,
  fields,
  quiet = false,
}: {
  title: string;
  fields: [BooleanSetting, string][];
  quiet?: boolean;
}) {
  const saved = useAppStore((state) => state.settings);
  const [draft, setDraft] = useState<UserSettingsUpdateRequest>({});
  const [times, setTimes] = useState({ quietStart: "", quietEnd: "" });
  const [validation, setValidation] = useState("");
  const mutation = useSaveSettings();
  function save() {
    const patch = { ...draft };
    for (const key of ["quietStart", "quietEnd"] as const) {
      if (!times[key]) continue;
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(times[key])) {
        setValidation("방해 금지 시간은 HH:mm 형식으로 입력해 주세요.");
        return;
      }
      const [hour, minute] = times[key].split(":").map(Number);
      patch[key] = { hour, minute, second: 0, nano: 0 };
    }
    setValidation("");
    mutation.mutate(patch, {
      onSuccess: () => {
        setDraft({});
        setTimes({ quietStart: "", quietEnd: "" });
      },
    });
  }
  return (
    <Page
      action={
        <Button
          label="변경 사항 저장"
          loading={mutation.isPending}
          disabled={
            !Object.keys(draft).length && !times.quietStart && !times.quietEnd
          }
          onPress={save}
        />
      }
    >
      <TopBar title={title} />
      <AppText color={colors.inkMuted}>
        바꿀 항목을 선택해 주세요. 선택한 항목만 저장해요. 현재 기기에서 저장한
        적 없는 설정은 확인 전으로 표시돼요.
      </AppText>
      <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
        {fields.map(([key, label]) => {
          const value = draft[key] ?? saved[key];
          return (
            <Card key={key}>
              <AppText variant="label">{label}</AppText>
              <AppText variant="caption">
                {value === undefined ? "확인 전" : value ? "켜짐" : "꺼짐"}
              </AppText>
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <Chip
                  label="켜기"
                  selected={value === true}
                  onPress={() => {
                    if (!mutation.isPending) {
                      mutation.reset();
                      setDraft({ ...draft, [key]: true });
                    }
                  }}
                />
                <Chip
                  label="끄기"
                  selected={value === false}
                  onPress={() => {
                    if (!mutation.isPending) {
                      mutation.reset();
                      setDraft({ ...draft, [key]: false });
                    }
                  }}
                />
              </View>
            </Card>
          );
        })}
        {quiet ? (
          <Card>
            <AppText variant="label">방해 금지 시간</AppText>
            {(["quietStart", "quietEnd"] as const).map((key) => (
              <View key={key}>
                <AppText>{key === "quietStart" ? "시작" : "종료"}</AppText>
                <TextInput
                  accessibilityLabel={
                    key === "quietStart" ? "방해 금지 시작" : "방해 금지 종료"
                  }
                  placeholder="HH:mm"
                  value={times[key]}
                  editable={!mutation.isPending}
                  onChangeText={(value) => setTimes({ ...times, [key]: value })}
                  style={{
                    padding: spacing.md,
                    color: colors.ink,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
              </View>
            ))}
          </Card>
        ) : null}
        {validation || mutation.error ? (
          <AppText color={colors.danger}>
            {validation || mutation.error?.message}
          </AppText>
        ) : null}
        {mutation.isSuccess ? <AppText>설정이 저장됐어요.</AppText> : null}
      </View>
    </Page>
  );
}
