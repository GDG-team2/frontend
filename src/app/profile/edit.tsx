import { useState } from "react";
import { View } from "react-native";
import { UserRound } from "lucide-react-native";
import { AppText, Button, Page, StateView, TopBar } from "@/components/ui";
import { FormField } from "@/components/FormField";
import { RequestError } from "@/components/RequestError";
import { colors, spacing } from "@/constants/theme";
import { useMe, useSaveProfile } from "@/services/queries";
import { birthYearValue } from "@/services/validation";
import type { UserProfileUpdateRequest } from "@/types/api";

export default function EditProfileScreen() {
  const query = useMe();
  const mutation = useSaveProfile();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [validation, setValidation] = useState("");
  function save() {
    try {
      const patch: UserProfileUpdateRequest = {};
      if (draft.nickname !== undefined) {
        if (!draft.nickname.trim()) throw new Error("닉네임을 입력해 주세요.");
        patch.nickname = draft.nickname.trim();
      }
      if (draft.regionCode !== undefined) {
        if (!/^\d{10}$/.test(draft.regionCode))
          throw new Error("동네 코드는 10자리 숫자로 입력해 주세요.");
        patch.regionCode = draft.regionCode;
      }
      if (draft.rankingNickname !== undefined)
        patch.rankingNickname = draft.rankingNickname.trim();
      if (draft.birthYear !== undefined) {
        const year = birthYearValue(draft.birthYear);
        if (!year)
          throw new Error(
            "출생 연도를 입력해 주세요. 저장한 연도를 지우는 기능은 아직 지원하지 않아요.",
          );
        patch.birthYear = year;
      }
      setValidation("");
      mutation.mutate(patch, { onSuccess: () => setDraft({}) });
    } catch (error) {
      setValidation((error as Error).message);
    }
  }
  if (query.isLoading)
    return (
      <Page>
        <TopBar title="프로필 편집" />
        <StateView type="loading" />
      </Page>
    );
  if (query.isError)
    return (
      <Page>
        <TopBar title="프로필 편집" />
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
          disabled={!Object.keys(draft).length}
          loading={mutation.isPending}
          onPress={save}
        />
      }
    >
      <TopBar title="프로필 편집" />
      <View
        style={{
          alignSelf: "center",
          padding: spacing.xl,
          borderRadius: 60,
          backgroundColor: colors.purpleSoft,
          marginVertical: spacing.xl,
        }}
      >
        <UserRound size={38} color={colors.purpleStrong} />
      </View>
      <View style={{ gap: spacing.xl }}>
        {(
          [
            { key: "nickname", label: "닉네임", max: 20 },
            { key: "rankingNickname", label: "랭킹 닉네임", max: 20 },
            { key: "regionCode", label: "동네 코드 (법정동/행정동)", max: 10 },
            { key: "birthYear", label: "출생 연도", max: 4 },
          ] as const
        ).map(({ key, label, max }) => (
          <FormField
            key={key}
            label={label}
            value={draft[key] ?? String(query.data?.[key] ?? "")}
            onChangeText={(value) => {
              mutation.reset();
              setDraft({ ...draft, [key]: value });
            }}
            maxLength={max}
            editable={!mutation.isPending}
            keyboardType={
              key === "regionCode" || key === "birthYear"
                ? "number-pad"
                : "default"
            }
            hint={
              key === "rankingNickname"
                ? "비워두면 기본 닉네임이 표시돼요."
                : undefined
            }
          />
        ))}
        {validation ? (
          <AppText color={colors.danger}>{validation}</AppText>
        ) : null}
        <RequestError error={mutation.error} />
        {mutation.isSuccess ? (
          <AppText accessibilityLiveRegion="polite">
            프로필이 저장됐어요.
          </AppText>
        ) : null}
      </View>
    </Page>
  );
}
