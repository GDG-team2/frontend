import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { AppText, Button, Page, TopBar } from "@/components/ui";
import { ChoiceGroup } from "@/components/ChoiceGroup";
import { RequestError } from "@/components/RequestError";
import { budgets, categories, moods, moveTypes } from "@/constants/options";
import { colors, spacing } from "@/constants/theme";
import { useRecommendMission } from "@/services/queries";
import type { MissionRecommendRequest } from "@/types/api";

export default function MissionConditionsScreen() {
  const router = useRouter();
  const mutation = useRecommendMission();
  const [draft, setDraft] = useState<
    Omit<MissionRecommendRequest, "latitude" | "longitude">
  >({});
  return (
    <Page
      action={
        <Button
          label="이 조건으로 미션 찾기"
          loading={mutation.isPending}
          onPress={() =>
            mutation.mutate(draft, {
              onSuccess: () => router.replace("/mission"),
            })
          }
        />
      }
    >
      <TopBar title="미션 조건" />
      <View style={{ gap: spacing.xl, marginTop: spacing.lg }}>
        <AppText variant="title">오늘은 어떻게 나가고 싶나요?</AppText>
        <AppText color={colors.inkMuted}>
          선택한 조건은 이번 추천에만 적용돼요. 선택하지 않은 항목은 추천
          기본값을 사용해요.
        </AppText>
        <ChoiceGroup
          title="지금 기분"
          options={moods}
          value={draft.mood}
          disabled={mutation.isPending}
          onChange={(mood) =>
            setDraft({ ...draft, mood: draft.mood === mood ? undefined : mood })
          }
        />
        <ChoiceGroup
          title="활동"
          options={categories}
          value={draft.category}
          disabled={mutation.isPending}
          onChange={(category) =>
            setDraft({
              ...draft,
              category: draft.category === category ? undefined : category,
            })
          }
        />
        <ChoiceGroup
          title="이동수단"
          options={moveTypes}
          value={draft.moveType}
          disabled={mutation.isPending}
          onChange={(moveType) =>
            setDraft({
              ...draft,
              moveType: draft.moveType === moveType ? undefined : moveType,
            })
          }
        />
        <ChoiceGroup
          title="예산"
          options={budgets}
          value={draft.budget}
          disabled={mutation.isPending}
          onChange={(budget) =>
            setDraft({
              ...draft,
              budget: draft.budget === budget ? undefined : budget,
            })
          }
        />
        <Button
          label="추천 기본값 바꾸기"
          variant="secondary"
          disabled={mutation.isPending}
          onPress={() => router.push("/onboarding/preferences")}
        />
        <RequestError error={mutation.error} />
      </View>
    </Page>
  );
}
