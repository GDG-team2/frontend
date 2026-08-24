import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Chip, Page, SectionHeader, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";

const preferenceGroups = [
  { title: "어떤 장소가 편한가요?", items: ["조용한 골목", "공원", "서점", "카페", "물가"] },
  { title: "보통 얼마나 걸을까요?", items: ["10분", "20분", "30분", "시간 상관없음"] },
  { title: "혼자일 때 선호하는 건?", items: ["사진 찍기", "찾기", "구경하기", "작은 보상"] },
];

export default function PreferencesScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState(["조용한 골목", "20분", "찾기"]);
  const toggle = (item: string) => setSelected((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);

  return (
    <Page action={<Button label="이 취향으로 시작" onPress={() => router.push("/onboarding/ready")} />}>
      <TopBar title="초기 취향" />
      <View style={styles.header}>
        <AppText variant="title">정답 없이, 끌리는 것만.</AppText>
        <AppText color={colors.inkMuted}>선택은 추천을 시작하기 위한 힌트예요. 언제든 바꿀 수 있어요.</AppText>
      </View>
      <View style={styles.groups}>
        {preferenceGroups.map((group) => (
          <View key={group.title} style={styles.group}>
            <SectionHeader title={group.title} />
            <View style={styles.chips}>
              {group.items.map((item) => <Chip key={item} label={item} selected={selected.includes(item)} onPress={() => toggle(item)} />)}
            </View>
          </View>
        ))}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xxl, gap: spacing.xs },
  groups: { gap: spacing.xxl, marginTop: spacing.xxl },
  group: { gap: spacing.md },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
});
