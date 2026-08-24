import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Footprints, LockKeyhole, MessageCircle, Sparkles } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Card, Page } from "@/components/ui";
import { colors, radius, spacing } from "@/constants/theme";
import { signInWithKakao } from "@/services/kakao";
import { useAppStore } from "@/store/app-store";

export default function Index() {
  const router = useRouter();
  const setAuthenticated = useAppStore((state) => state.setAuthenticated);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const onboardingComplete = useAppStore((state) => state.onboardingComplete);
  const login = useMutation({
    mutationFn: signInWithKakao,
    onSuccess: () => {
      setAuthenticated(true);
      router.replace(onboardingComplete ? "/(tabs)" : "/onboarding/terms");
    },
  });

  function enterQa() {
    completeOnboarding();
    router.replace("/(tabs)");
  }

  return (
    <Page scroll={false} contentStyle={styles.page}>
      <View style={styles.brandRow}>
        <View style={styles.logoMark}>
          <Footprints size={23} color={colors.ink} />
        </View>
        <AppText variant="heading">오하꼼</AppText>
      </View>

      <View style={styles.hero}>
        <View style={styles.sparkle}>
          <Sparkles size={28} color={colors.purpleStrong} />
        </View>
        <AppText variant="display">밖에 나갈 이유,{"\n"}하나만 골라드릴게요.</AppText>
        <AppText color={colors.inkMuted} style={styles.heroCopy}>
          결정은 줄이고, 외출은 한 칸 가볍게. 지금 기분에 맞는 20분 미션을 만나보세요.
        </AppText>
      </View>

      <Card tone="lime" style={styles.trustCard}>
        <View style={styles.trustIcon}>
          <LockKeyhole size={19} color={colors.limeInk} />
        </View>
        <View style={styles.trustCopy}>
          <AppText variant="label" color={colors.limeInk}>정확한 위치는 출발할 때만</AppText>
          <AppText variant="caption" color={colors.limeInk}>동네 추천에는 구 단위 정보만 사용해요.</AppText>
        </View>
      </Card>

      <View style={styles.actions}>
        {login.error ? (
          <AppText variant="caption" color={colors.danger} align="center">
            로그인 연결을 확인하지 못했어요. QA 모드로 바로 둘러볼 수 있어요.
          </AppText>
        ) : null}
        <Button label="카카오로 시작하기" icon={MessageCircle} variant="kakao" loading={login.isPending} onPress={() => login.mutate()} />
        <Button label="QA 모드로 바로 둘러보기" variant="secondary" onPress={enterQa} />
        <AppText variant="caption" color={colors.inkFaint} align="center">
          계속하면 오하꼼의 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </AppText>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: { justifyContent: "space-between", paddingTop: spacing.md },
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  logoMark: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.lime, alignItems: "center", justifyContent: "center" },
  hero: { gap: spacing.md, marginTop: spacing.xl },
  sparkle: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.purpleSoft, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  heroCopy: { maxWidth: 360 },
  trustCard: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, marginTop: spacing.xl },
  trustIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  trustCopy: { flex: 1, gap: 2 },
  actions: { gap: spacing.sm, marginTop: spacing.xl },
});
