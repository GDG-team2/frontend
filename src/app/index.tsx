import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { AppText, Button, Card, Page } from "@/components/ui";
import { colors, radius, spacing } from "@/constants/theme";
import { USE_MSW } from "@/constants/api";
import { backend } from "@/services/backend";
import { saveAccessToken } from "@/services/session";
import { useAppStore } from "@/store/app-store";

export default function Index() {
  const router = useRouter();
  const client = useQueryClient();
  const authenticated = useAppStore((state) => state.authenticated);
  const [signup, setSignup] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    nickname: "",
    birth: "",
    regionCode: "",
  });
  const [notice, setNotice] = useState("");
  const auth = useMutation({
    mutationFn: async (qa: boolean) => {
      const credentials = qa
        ? { email: "qa@example.com", password: "qa-password" }
        : { email: form.email.trim(), password: form.password };
      if (signup && !qa) {
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(form.birth) ||
          Number.isNaN(Date.parse(form.birth)) ||
          new Date(form.birth).toISOString().slice(0, 10) !== form.birth
        )
          throw new Error(
            "생년월일을 YYYY-MM-DD 형식의 실제 날짜로 입력해 주세요.",
          );
        await backend.signup({
          ...form,
          ...credentials,
          nickname: form.nickname.trim(),
          regionCode: form.regionCode.trim(),
        });
        setSignup(false);
        setNotice("가입이 완료됐어요. 이메일과 비밀번호로 로그인해 주세요.");
        return;
      }
      const result = await backend.login(credentials);
      if (!result.accessToken)
        throw new Error("로그인 응답에 인증 정보가 없어요.");
      await saveAccessToken(result.accessToken);
      client.clear();
      useAppStore.getState().reset();
      useAppStore.getState().completeOnboarding();
      router.replace("/(tabs)");
    },
  });
  if (authenticated) return <Redirect href="/(tabs)" />;
  const fields = signup
    ? (["email", "password", "nickname", "birth", "regionCode"] as const)
    : (["email", "password"] as const);
  const labels = {
    email: "이메일",
    password: "비밀번호",
    nickname: "닉네임",
    birth: "생년월일 (YYYY-MM-DD)",
    regionCode: "동네 코드 (법정동/행정동)",
  };
  return (
    <Page>
      <View style={styles.hero}>
        <AppText variant="heading">오하꼼</AppText>
        <AppText variant="display">
          밖에 나갈 이유, 하나만 골라드릴게요.
        </AppText>
        <AppText color={colors.inkMuted}>
          {signup ? "새 계정 만들기" : "이메일로 로그인하세요."}
        </AppText>
      </View>
      <Card style={styles.form}>
        {fields.map((key) => (
          <View key={key} style={styles.field}>
            <AppText variant="label">{labels[key]}</AppText>
            <TextInput
              accessibilityLabel={labels[key]}
              value={form[key]}
              onChangeText={(value) =>
                setForm((previous) => ({ ...previous, [key]: value }))
              }
              editable={!auth.isPending}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={key === "password"}
              keyboardType={key === "email" ? "email-address" : "default"}
              style={styles.input}
            />
          </View>
        ))}
      </Card>
      {notice ? <AppText>{notice}</AppText> : null}
      {auth.error ? (
        <AppText color={colors.danger}>{auth.error.message}</AppText>
      ) : null}
      <View style={styles.form}>
        <Button
          label={signup ? "회원가입" : "로그인"}
          loading={auth.isPending}
          disabled={fields.some((key) => !form[key].trim())}
          onPress={() => auth.mutate(false)}
        />
        <Button
          label={signup ? "로그인으로 돌아가기" : "계정 만들기"}
          variant="secondary"
          disabled={auth.isPending}
          onPress={() => {
            setSignup(!signup);
            auth.reset();
            setNotice("");
          }}
        />
        {USE_MSW ? (
          <Button
            label="QA 모드로 바로 둘러보기"
            variant="secondary"
            loading={auth.isPending}
            onPress={() => auth.mutate(true)}
          />
        ) : null}
      </View>
    </Page>
  );
}
const styles = StyleSheet.create({
  hero: { gap: spacing.md, marginVertical: spacing.xl },
  form: { gap: spacing.md, marginBottom: spacing.md },
  field: { gap: spacing.xs },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: colors.ink,
    fontSize: 16,
  },
});
