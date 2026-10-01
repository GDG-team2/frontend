import { useState } from "react";
import { View } from "react-native";
import { AppText, Button, Page, StateView, TopBar } from "@/components/ui";
import { ChoiceGroup } from "@/components/ChoiceGroup";
import { FormField } from "@/components/FormField";
import { RequestError } from "@/components/RequestError";
import { budgets, categories, moveTypes } from "@/constants/options";
import { colors, spacing } from "@/constants/theme";
import { usePreferences, useSavePreferences } from "@/services/queries";
import type { PreferenceUpdateRequest } from "@/types/api";

export default function PreferencesScreen() {
  const query = usePreferences();
  const mutation = useSavePreferences();
  const [draft, setDraft] = useState<PreferenceUpdateRequest>({});
  const [walkTime, setWalkTime] = useState<string>();
  const [validation, setValidation] = useState("");
  const values = { ...query.data, ...draft };
  function set(patch: PreferenceUpdateRequest) {
    mutation.reset();
    setDraft({ ...draft, ...patch });
  }
  function save() {
    const minutes = walkTime === undefined ? values.walkTime : Number(walkTime);
    if (!Number.isInteger(minutes) || minutes! < 10 || minutes! > 120) {
      setValidation("전체 외출 시간은 10~120분으로 입력해 주세요.");
      return;
    }
    setValidation("");
    mutation.mutate(
      { ...draft, ...(walkTime === undefined ? {} : { walkTime: minutes }) },
      {
        onSuccess: () => {
          setDraft({});
          setWalkTime(undefined);
        },
      },
    );
  }
  if (query.isLoading)
    return (
      <Page>
        <TopBar title="추천 기본값" />
        <StateView type="loading" />
      </Page>
    );
  if (query.isError)
    return (
      <Page>
        <TopBar title="추천 기본값" />
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
          label="추천 기본값 저장"
          loading={mutation.isPending}
          disabled={!Object.keys(draft).length && walkTime === undefined}
          onPress={save}
        />
      }
    >
      <TopBar title="추천 기본값" />
      <View style={{ gap: spacing.xl, marginTop: spacing.lg }}>
        <AppText variant="title">정답 없이, 끌리는 것만.</AppText>
        <AppText color={colors.inkMuted}>
          장소에서 보내는 시간까지 포함한 외출 시간을 정해요.
        </AppText>
        <FormField
          label="전체 외출 시간 (분)"
          value={walkTime ?? String(values.walkTime ?? 60)}
          onChangeText={setWalkTime}
          keyboardType="number-pad"
          editable={!mutation.isPending}
          maxLength={3}
          hint="10~120분 · 왕복 이동과 머무는 시간 포함"
        />
        <ChoiceGroup
          title="이동수단"
          options={moveTypes}
          value={values.moveType}
          disabled={mutation.isPending}
          onChange={(moveType) => set({ moveType })}
        />
        <ChoiceGroup
          title="활동 (여러 개 선택, 선택이 없으면 전체)"
          options={categories}
          value={values.categories ?? []}
          disabled={mutation.isPending}
          onChange={(value) =>
            set({
              categories: values.categories?.includes(value)
                ? values.categories.filter((v) => v !== value)
                : [...(values.categories ?? []), value],
            })
          }
        />
        <ChoiceGroup
          title="예산"
          options={budgets}
          value={values.budget}
          disabled={mutation.isPending}
          onChange={(budget) => set({ budget })}
        />
        <ChoiceGroup
          title="이번 주 목표"
          options={{
            "1": "1회",
            "2": "2회",
            "3": "3회",
            "4": "4회",
            "5": "5회",
            "6": "6회",
            "7": "7회",
          }}
          value={String(values.weeklyGoal ?? 3)}
          disabled={mutation.isPending}
          onChange={(value) => set({ weeklyGoal: Number(value) })}
        />
        {validation ? (
          <AppText color={colors.danger}>{validation}</AppText>
        ) : null}
        <RequestError error={mutation.error} />
        {mutation.isSuccess ? (
          <AppText accessibilityLiveRegion="polite">
            추천 기본값이 저장됐어요.
          </AppText>
        ) : null}
      </View>
    </Page>
  );
}
