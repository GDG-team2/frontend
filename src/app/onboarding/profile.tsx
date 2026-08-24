import { useRouter } from "expo-router";
import { MapPin, UserRound } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { AppText, Button, Card, Page, TopBar } from "@/components/ui";
import { colors, font, radius, spacing } from "@/constants/theme";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState("은후");
  return (
    <Page action={<Button label="취향 고르기" disabled={!nickname.trim()} onPress={() => router.push("/onboarding/preferences")} />}>
      <TopBar title="프로필 설정" />
      <View style={styles.header}>
        <AppText variant="title">어떻게 불러드릴까요?</AppText>
        <AppText color={colors.inkMuted}>추천에 필요한 최소 정보만 받을게요.</AppText>
      </View>
      <View style={styles.avatar}>
        <UserRound size={34} color={colors.purpleStrong} />
      </View>
      <View style={styles.field}>
        <AppText variant="label">닉네임</AppText>
        <TextInput
          value={nickname}
          onChangeText={setNickname}
          maxLength={12}
          placeholder="닉네임 입력"
          placeholderTextColor={colors.inkFaint}
          style={styles.input}
          accessibilityLabel="닉네임"
        />
        <AppText variant="caption" color={colors.inkFaint} align="right">{nickname.length}/12</AppText>
      </View>
      <Card tone="purple" style={styles.areaCard}>
        <MapPin size={21} color={colors.purpleStrong} />
        <View style={styles.areaCopy}>
          <AppText variant="label" color={colors.purpleInk}>활동 동네 · 서울 마포구</AppText>
          <AppText variant="caption" color={colors.purpleInk}>정확한 주소는 저장하지 않아요.</AppText>
        </View>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xxl, gap: spacing.xs },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.purpleSoft, alignItems: "center", justifyContent: "center", marginVertical: spacing.xxl, alignSelf: "center" },
  field: { gap: spacing.xs },
  input: { height: 54, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.md, fontFamily: font.regular, fontSize: 16, color: colors.ink, backgroundColor: colors.white },
  areaCard: { marginTop: spacing.xl, flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md },
  areaCopy: { flex: 1, gap: 2 },
});
