import { useState } from "react";
import { TextInput, View } from "react-native";
import {
  AppText,
  Button,
  Card,
  ToggleRow,
  Page,
  StateView,
  TopBar,
} from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useSaveSettings, useSettings } from "@/services/queries";
import { RequestError } from "./RequestError";
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
  const query = useSettings();
  const saved = query.data ?? {};
  const [draft, setDraft] = useState<UserSettingsUpdateRequest>({});
  const [times, setTimes] = useState<
    Partial<Record<"quietStart" | "quietEnd", string>>
  >({});
  const [validation, setValidation] = useState("");
  const mutation = useSaveSettings();
  function save() {
    const patch = { ...draft };
    for (const key of ["quietStart", "quietEnd"] as const) {
      if (times[key] === undefined) continue;
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(times[key])) {
        setValidation("방해 금지 시간은 HH:mm 형식으로 입력해 주세요.");
        return;
      }
      patch[key] = times[key];
    }
    setValidation("");
    mutation.mutate(patch, {
      onSuccess: () => {
        setDraft({});
        setTimes({});
      },
    });
  }
  if (query.isLoading)
    return (
      <Page>
        <TopBar title={title} />
        <StateView type="loading" />
      </Page>
    );
  if (query.isError)
    return (
      <Page>
        <TopBar title={title} />
        <StateView
          type="error"
          description={query.error.message}
          onRetry={() => query.refetch()}
        />
      </Page>
    );
  return (
    <Page
      action={
        <Button
          label="변경 사항 저장"
          loading={mutation.isPending}
          disabled={
            !Object.keys(draft).length &&
            times.quietStart === undefined &&
            times.quietEnd === undefined
          }
          onPress={save}
        />
      }
    >
      <TopBar title={title} />
      <AppText color={colors.inkMuted}>
        바꿀 항목을 선택해 주세요. 변경한 항목만 저장해요.
      </AppText>
      <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
        {(quiet
          ? [
              ...fields,
              ["quietEnabled", "조용한 시간 사용"] as [BooleanSetting, string],
            ]
          : fields
        ).map(([key, label]) => {
          const value = draft[key] ?? saved[key];
          return <Card key={key} style={{ paddingVertical: 0 }}><ToggleRow title={label} value={value === true} disabled={mutation.isPending} onValueChange={(value) => { mutation.reset(); setDraft({ ...draft, [key]: value }); }} /></Card>;
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
                  value={times[key] ?? saved[key]?.slice(0, 5) ?? ""}
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
        {validation ? (
          <AppText color={colors.danger}>{validation}</AppText>
        ) : null}
        <RequestError error={mutation.error} />
        {mutation.isSuccess ? <AppText>설정이 저장됐어요.</AppText> : null}
      </View>
    </Page>
  );
}
