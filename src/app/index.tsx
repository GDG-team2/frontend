import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, TextInput, View } from "react-native";
import { AppText, Button, Card, Page } from "@/components/ui";
import { colors, radius, spacing } from "@/constants/theme";
import { USE_MSW } from "@/constants/api";
import { backend } from "@/services/backend";
import { saveSession } from "@/services/session";
import { legalDocuments, legalReady } from "@/constants/legal";
import { validateCredentials, birthYearValue } from "@/services/validation";
import { RequestError } from "@/components/RequestError";
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
    birthYear: "",
    regionCode: "",
  });
  const [agreements, setAgreements] = useState({
    service: false,
    privacy: false,
    location: false,
    marketing: false,
  });
  const [notice, setNotice] = useState("");
  const auth = useMutation({
    mutationFn: async (qa: boolean) => {
      const credentials = qa
        ? { email: "qa@example.com", password: "qa-password" }
        : { email: form.email.trim(), password: form.password };
      validateCredentials(
        credentials.email,
        credentials.password,
        signup && !qa,
      );
      if (signup && !qa) {
        if (!legalReady && !USE_MSW)
          throw new Error("약관을 준비 중이라 아직 가입할 수 없어요.");
        if (!agreements.service || !agreements.privacy || !agreements.location)
          throw new Error("필수 약관을 확인하고 동의해 주세요.");
        if (!/^\d{10}$/.test(form.regionCode))
          throw new Error("동네 코드는 10자리 숫자로 입력해 주세요.");
        await backend.signup({
          ...credentials,
          nickname: form.nickname.trim(),
          regionCode: form.regionCode,
          birthYear: birthYearValue(form.birthYear),
          agreements,
        });
        setSignup(false);
        setNotice("가입이 완료됐어요. 이메일과 비밀번호로 로그인해 주세요.");
        return;
      }
      const result = await backend.login(credentials);
      if (!result.accessToken || !result.refreshToken)
        throw new Error("로그인 응답에 인증 정보가 없어요.");
      await saveSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      client.clear();
      useAppStore.getState().reset();
      useAppStore.getState().completeOnboarding();
      router.replace("/(tabs)");
    },
  });
  if (authenticated) return <Redirect href="/(tabs)" />;
  const fields = signup
    ? (["email", "password", "nickname", "birthYear", "regionCode"] as const)
    : (["email", "password"] as const);
  const labels = {
    email: "이메일",
    password: "비밀번호",
    nickname: "닉네임",
    birthYear: "출생 연도 (선택)",
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
              keyboardType={
                key === "email"
                  ? "email-address"
                  : key === "birthYear" || key === "regionCode"
                    ? "number-pad"
                    : "default"
              }
              autoComplete={
                key === "email"
                  ? "email"
                  : key === "password"
                    ? signup
                      ? "new-password"
                      : "current-password"
                    : "off"
              }
              maxLength={
                key === "nickname"
                  ? 20
                  : key === "birthYear"
                    ? 4
                    : key === "regionCode"
                      ? 10
                      : 254
              }
              style={styles.input}
            />
          </View>
        ))}
      </Card>
      {signup ? (
        <Card style={styles.form}>
          <AppText variant="heading">약관 동의</AppText>
          {!legalReady && !USE_MSW ? (
            <AppText color={colors.inkMuted}>
              가입에 필요한 약관 원문을 준비 중이에요. 준비가 끝나면 회원가입할
              수 있어요.
            </AppText>
          ) : null}
          {[
            ...legalDocuments,
            {
              key: "marketing" as const,
              label: "마케팅 정보 수신",
              url: undefined,
            },
          ].map(({ key, label, url }) => (
            <View key={key} style={styles.field}>
              <Pressable
                accessibilityRole="checkbox"
                aria-checked={agreements[key]}
                accessibilityLabel={label}
                accessibilityState={{
                  checked: agreements[key],
                  disabled: auth.isPending,
                }}
                disabled={auth.isPending}
                onPress={() =>
                  setAgreements({ ...agreements, [key]: !agreements[key] })
                }
                style={styles.agreement}
              >
                <AppText>
                  {agreements[key] ? "✓" : "○"} {label} (
                  {key === "marketing" ? "선택" : "필수"})
                </AppText>
              </Pressable>
              {url ? (
                <Button
                  variant="secondary"
                  label={`${label} 원문 보기`}
                  onPress={() =>
                    void Linking.openURL(url).catch(() =>
                      setNotice("약관 페이지를 열지 못했어요."),
                    )
                  }
                />
              ) : null}
            </View>
          ))}
        </Card>
      ) : null}
      {auth.isPending ? (
        <AppText accessibilityLiveRegion="polite" color={colors.inkMuted}>
          연결 중이에요. 처음 연결할 때는 1분 이상 걸릴 수 있어요.
        </AppText>
      ) : null}
      {notice ? <AppText>{notice}</AppText> : null}
      <RequestError error={auth.error} />
      <View style={styles.form}>
        <Button
          label={signup ? "회원가입" : "로그인"}
          loading={auth.isPending}
          disabled={
            fields.some((key) => key !== "birthYear" && !form[key].trim()) ||
            (signup &&
              ((!USE_MSW && !legalReady) ||
                !agreements.service ||
                !agreements.privacy ||
                !agreements.location))
          }
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
  agreement: { minHeight: 48, justifyContent: "center" },
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
