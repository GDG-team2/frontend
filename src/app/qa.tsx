import { USE_MSW } from "@/constants/api";
import { UnavailableFeature } from "@/components/UnavailableFeature";
import { useQueryClient } from "@tanstack/react-query";
import { type Href, useRouter } from "expo-router";
import {
  AlertTriangle,
  Check,
  CloudOff,
  Gauge,
  KeyRound,
  Map,
  RotateCcw,
  TimerReset,
} from "lucide-react-native";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

import { AppText, Button, Card, ListRow, Page, TopBar } from "@/components/ui";
import { colors, radius, spacing } from "@/constants/theme";
import { kakaoStatus } from "@/services/kakao";
import { clearAccessToken } from "@/services/session";
import { useAppStore } from "@/store/app-store";
import type { MockScenario } from "@/types/domain";

const scenarios: {
  value: MockScenario;
  title: string;
  description: string;
  icon: typeof Check;
  tone: string;
}[] = [
  {
    value: "success",
    title: "정상",
    description: "즉시 성공 응답",
    icon: Check,
    tone: colors.successSoft,
  },
  {
    value: "slow",
    title: "느린 응답",
    description: "1.2초 로딩",
    icon: TimerReset,
    tone: colors.limeSoft,
  },
  {
    value: "error",
    title: "서버 오류",
    description: "503와 재시도",
    icon: CloudOff,
    tone: colors.dangerSoft,
  },
  {
    value: "empty",
    title: "빈 상태",
    description: "추천·목록 없음",
    icon: Gauge,
    tone: colors.purpleSoft,
  },
];

const screenLinks: { title: string; subtitle: string; route: Href }[] = [
  {
    title: "핵심 미션 여정",
    subtitle: "제안 → 약속 → 이동 → 완료",
    route: "/mission",
  },
  {
    title: "GPS 도착 오류",
    subtitle: "운영 오류 복구 상태",
    route: "/mission/gps-error",
  },
  {
    title: "제휴 미션",
    subtitle: "광고 고지와 일반 미션 전환",
    route: "/mission/sponsored",
  },
  { title: "내 미션", subtitle: "예정·완료 목록", route: "/my-missions" },
  { title: "인사이트", subtitle: "차트·프라이버시", route: "/insights" },
  { title: "주간 랭킹", subtitle: "기본 비공개 참여", route: "/ranking" },
  {
    title: "개인정보와 권한",
    subtitle: "위치·기록 보관",
    route: "/settings/privacy",
  },
];

function PreviewQaScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const queryClient = useQueryClient();
  const scenario = useAppStore((state) => state.qaScenario);
  const setScenario = useAppStore((state) => state.setQaScenario);
  const reset = useAppStore((state) => state.reset);

  function selectScenario(value: MockScenario) {
    setScenario(value);
    queryClient.clear();
  }

  async function resetQa() {
    const { resetMockState } = await import("@/mocks/handlers");
    resetMockState();
    await clearAccessToken();
    reset();
    queryClient.clear();
    router.replace("/");
  }

  return (
    <Page>
      <TopBar title="QA 컨트롤" />
      <Card
        tone="purple"
        style={[styles.statusCard, compact && styles.statusCardCompact]}
      >
        <View style={styles.statusIcon}>
          <Gauge size={24} color={colors.purpleInk} />
        </View>
        <View style={styles.statusCopy}>
          <AppText variant="heading" color={colors.purpleInk}>
            MSW 목업 서버 동작 중
          </AppText>
          <AppText variant="caption" color={colors.purpleInk}>
            화면을 나가면 선택한 시나리오로 API를 다시 요청해요.
          </AppText>
        </View>
      </Card>

      <View style={styles.header}>
        <AppText variant="heading">API 상태</AppText>
        <AppText variant="caption" color={colors.inkMuted}>
          로딩·오류·빈 상태를 실제 네트워크 흐름처럼 확인
        </AppText>
      </View>
      <View style={styles.scenarioGrid}>
        {scenarios.map(({ value, title, description, icon: Icon, tone }) => {
          const selected = scenario === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${title}, ${description}`}
              onPress={() => selectScenario(value)}
              style={[
                styles.scenario,
                compact && styles.scenarioCompact,
                selected && styles.scenarioSelected,
              ]}
            >
              <View style={[styles.scenarioIcon, { backgroundColor: tone }]}>
                <Icon size={20} color={colors.ink} />
              </View>
              <AppText variant="label">{title}</AppText>
              <AppText variant="caption" color={colors.inkMuted}>
                {description}
              </AppText>
              {selected ? (
                <View style={styles.selectedBadge}>
                  <Check size={13} color={colors.ink} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.header}>
        <AppText variant="heading">Kakao 준비 상태</AppText>
        <AppText variant="caption" color={colors.inkMuted}>
          키 없이도 동일한 앱 흐름을 검증할 수 있어요.
        </AppText>
      </View>
      <Card tone="outline" style={styles.integrationCard}>
        <ListRow
          title="Kakao 로그인"
          subtitle={
            kakaoStatus.configured
              ? "앱 키 감지됨"
              : "현재 API에서 지원하지 않음"
          }
          value={kakaoStatus.configured ? "설정됨" : "대기"}
          icon={KeyRound}
        />
        <ListRow
          title="Kakao 지도"
          subtitle={
            kakaoStatus.mapConfigured
              ? "JavaScript 키 감지됨"
              : "Figma 지도+모의 좌표 사용"
          }
          value={kakaoStatus.mapConfigured ? "설정됨" : "대기"}
          icon={Map}
        />
      </Card>
      {!kakaoStatus.configured ? (
        <Card tone="lime" style={styles.note}>
          <AlertTriangle size={19} color={colors.limeInk} />
          <AppText
            variant="caption"
            color={colors.limeInk}
            style={styles.noteCopy}
          >
            카카오 로그인 API는 제공되지 않아 이메일 로그인을 사용해요. 명세에
            포함된 인증·미션·보상·설정·랭킹 흐름을 목업으로 확인할 수 있어요.
          </AppText>
        </Card>
      ) : null}

      <View style={styles.header}>
        <AppText variant="heading">운영 화면 바로가기</AppText>
      </View>
      <Card tone="outline" style={styles.integrationCard}>
        {screenLinks.map((item) => (
          <ListRow
            key={item.title}
            title={item.title}
            subtitle={item.subtitle}
            onPress={() => router.push(item.route)}
          />
        ))}
      </Card>
      <Button
        label="QA 상태 초기화"
        icon={RotateCcw}
        variant="danger"
        style={styles.resetButton}
        onPress={() => void resetQa()}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  statusCardCompact: { flexDirection: "column", alignItems: "flex-start" },
  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  statusCopy: { flex: 1, minWidth: 0, gap: 2 },
  header: { gap: 2, marginTop: spacing.xxl, marginBottom: spacing.md },
  scenarioGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  scenario: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 130,
    minHeight: 132,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xxs,
    backgroundColor: colors.white,
  },
  scenarioCompact: { flexBasis: "100%", minWidth: "100%", minHeight: 112 },
  scenarioSelected: { borderColor: colors.ink, borderWidth: 2 },
  scenarioIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  selectedBadge: {
    position: "absolute",
    right: 9,
    top: 9,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.lime,
    alignItems: "center",
    justifyContent: "center",
  },
  integrationCard: { paddingVertical: 0 },
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  noteCopy: { flex: 1 },
  resetButton: { marginTop: spacing.xxl },
});

export default function Screen() {
  return USE_MSW ? <PreviewQaScreen /> : <UnavailableFeature title="QA" />;
}
