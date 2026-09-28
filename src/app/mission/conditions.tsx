import { USE_MSW } from "@/constants/api";
import { UnavailableFeature } from "@/components/UnavailableFeature";
import { useRouter } from "expo-router";
import { Mic, SlidersHorizontal } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { AppText, Button, Chip, Page, TopBar } from "@/components/ui";
import { colors, font, radius, spacing } from "@/constants/theme";

const groups = [
  { title: "시간", values: ["10분", "20분", "30분", "상관없음"] },
  { title: "분위기", values: ["조용한", "사람 있는", "자연", "실내"] },
  { title: "활동", values: ["걷기", "찾기", "사진", "작은 보상"] },
];

function PreviewMissionConditionsScreen() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("조용한 곳에서 20분만 걷고 싶어");
  const [selected, setSelected] = useState(["20분", "조용한", "걷기"]);
  const [activeGroup, setActiveGroup] = useState(groups[0]);
  const selectOption = (value: string) => {
    setSelected((items) => [...items.filter((item) => !activeGroup.values.includes(item)), value]);
  };

  return (
    <Page action={<Button label="이 조건으로 미션 찾기" icon={SlidersHorizontal} onPress={() => router.replace("/mission")} />}>
      <TopBar title="미션 조건" />
      <View style={styles.header}>
        <AppText variant="title">오늘은 어떻게 나가고 싶나요?</AppText>
        <AppText color={colors.inkMuted}>문장으로 말하고, 아래 조건으로 가볍게 다듬어도 돼요.</AppText>
      </View>
      <View style={styles.promptWrap}>
        <TextInput
          accessibilityLabel="원하는 미션 설명"
          multiline
          value={prompt}
          onChangeText={setPrompt}
          placeholder="예: 비 안 맞고 조용히 걷고 싶어"
          placeholderTextColor={colors.inkFaint}
          style={styles.prompt}
        />
        <Pressable accessibilityRole="button" accessibilityLabel="음성으로 말하기" style={styles.micButton}>
          <Mic size={20} color={colors.purpleStrong} />
        </Pressable>
      </View>
      <View style={styles.filters}>
        <View style={styles.filterHeading}>
          <AppText variant="label">빠른 조건</AppText>
          <AppText variant="caption" color={colors.inkMuted}>{selected.join(" · ")}</AppText>
        </View>
        <View style={styles.categoryTabs}>
          {groups.map((group) => {
            const isActive = activeGroup.title === group.title;
            return (
              <Pressable
                key={group.title}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                onPress={() => setActiveGroup(group)}
                style={({ pressed }) => [styles.categoryTab, isActive && styles.categoryTabSelected, pressed && styles.categoryTabPressed]}
              >
                <AppText variant="label" color={isActive ? colors.ink : colors.inkMuted}>{group.title}</AppText>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.optionGroup}>
          <AppText variant="caption" color={colors.inkMuted}>{activeGroup.title} 선택</AppText>
          <View style={styles.chips}>
            {activeGroup.values.map((value) => (
              <Chip key={value} label={value} selected={selected.includes(value)} onPress={() => selectOption(value)} />
            ))}
          </View>
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginTop: spacing.xl },
  promptWrap: { minHeight: 112, marginTop: spacing.lg },
  prompt: { flex: 1, minHeight: 112, borderRadius: radius.xl, backgroundColor: colors.surfaceSubtle, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, padding: spacing.md, paddingRight: 58, textAlignVertical: "top", fontFamily: font.regular, fontSize: 16, lineHeight: 24, color: colors.ink },
  micButton: { position: "absolute", right: spacing.sm, bottom: spacing.sm, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.purpleSoft, alignItems: "center", justifyContent: "center" },
  filters: { gap: spacing.sm, marginTop: spacing.lg },
  filterHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md },
  categoryTabs: { minHeight: 48, flexDirection: "row", padding: 4, borderRadius: radius.lg, backgroundColor: colors.surfaceSubtle },
  categoryTab: { flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.transparent },
  categoryTabSelected: { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
  categoryTabPressed: { backgroundColor: colors.chip },
  optionGroup: { gap: spacing.xs, paddingTop: spacing.xxs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
});

export default function Screen() { return USE_MSW ? <PreviewMissionConditionsScreen /> : <UnavailableFeature title="미션 조건" />; }
