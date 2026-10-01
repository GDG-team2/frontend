import { useQueryClient } from "@tanstack/react-query";
import { USE_MSW } from "@/constants/api";
import { useRouter } from "expo-router";
import {
  Bell,
  ChevronRight,
  FileText,
  LogOut,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react-native";
import { Linking, Pressable, StyleSheet, View } from "react-native";

import { AppText, Card, ListRow, Page, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { clearAccessToken } from "@/services/session";
import { useState } from "react";
import { legalDocuments } from "@/constants/legal";
import { useMe, usePreferences } from "@/services/queries";
import { budgets, moveTypes } from "@/constants/options";
import { useAppStore } from "@/store/app-store";

export default function SettingsScreen() {
  const router = useRouter();
  const client = useQueryClient();
  const me = useMe();
  const preferences = usePreferences();
  const [error, setError] = useState("");
  const reset = useAppStore((state) => state.reset);
  async function logout() {
    await clearAccessToken();
    reset();
    client.clear();
    router.replace("/");
  }
  return (
    <Page>
      <TopBar title="설정" />
      <AppText
        variant="caption"
        color={colors.inkMuted}
        style={styles.groupLabel}
      >
        앱 설정
      </AppText>
      <Card tone="outline" style={styles.group}>
        <ListRow
          title="추천 기본값"
          subtitle={
            preferences.data
              ? `${preferences.data.walkTime}분 · ${moveTypes[preferences.data.moveType ?? "WALK"]} · ${budgets[preferences.data.budget ?? "ANY"]}`
              : "시간 · 이동수단 · 예산 · 주간 목표"
          }
          icon={SlidersHorizontal}
          onPress={() => router.push("/onboarding/preferences")}
        />
        <ListRow
          title="알림 설정"
          subtitle="미션 · 목표 · 혜택"
          icon={Bell}
          onPress={() => router.push("/settings/notifications")}
        />
        <ListRow
          title="개인정보와 권한"
          subtitle="위치 · 기록 · 데이터"
          icon={ShieldCheck}
          onPress={() => router.push("/settings/privacy")}
        />
        {USE_MSW ? (
          <ListRow
            title="QA 시나리오"
            subtitle="목업 API 상태와 화면 확인"
            icon={SlidersHorizontal}
            onPress={() => router.push("/qa")}
          />
        ) : null}
      </Card>
      <AppText
        variant="caption"
        color={colors.inkMuted}
        style={styles.groupLabel}
      >
        도움과 정보
      </AppText>
      <Card tone="outline" style={styles.group}>
        {legalDocuments.map(({ key, label, url }) => (
          <ListRow
            key={key}
            title={label}
            subtitle={url ? "원문 보기" : "준비 중"}
            icon={FileText}
            onPress={
              url
                ? () =>
                    void Linking.openURL(url).catch(() =>
                      setError("약관 페이지를 열지 못했어요."),
                    )
                : undefined
            }
          />
        ))}
      </Card>
      <Card tone="subtle" style={styles.appInfo}>
        <View>
          <AppText variant="label">오하꼼</AppText>
          <AppText variant="caption" color={colors.inkMuted}>
            버전 1.0.0
          </AppText>
        </View>
        <View style={styles.buildBadge}>
          <AppText variant="caption" color={colors.purpleInk}>
            {USE_MSW ? "MSW QA" : "계정"}
          </AppText>
        </View>
      </Card>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="로그아웃"
        onPress={() =>
          void logout().catch(() =>
            setError("로그아웃하지 못했어요. 다시 시도해 주세요."),
          )
        }
        style={styles.logout}
      >
        <LogOut size={18} color={colors.danger} />
        <AppText variant="label" color={colors.danger}>
          로그아웃
        </AppText>
        <ChevronRight
          size={18}
          color={colors.danger}
          style={styles.logoutChevron}
        />
      </Pressable>
      {error ? <AppText color={colors.danger}>{error}</AppText> : null}
      <View style={styles.locationNote}>
        <MapPin size={15} color={colors.inkFaint} />
        <AppText variant="caption" color={colors.inkFaint}>
          활동 동네 · {me.data?.district ?? "확인 중"}
        </AppText>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  groupLabel: { marginTop: spacing.xl, marginBottom: spacing.xs },
  group: { paddingVertical: 0 },
  appInfo: {
    marginTop: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  buildBadge: {
    backgroundColor: colors.purpleSoft,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 99,
  },
  logout: {
    minHeight: 60,
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  logoutChevron: { marginLeft: "auto" },
  locationNote: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
});
