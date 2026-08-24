import { Database, Download, LocateFixed, MapPinned, ShieldCheck, Trash2 } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Card, ListRow, Page, ToggleRow, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useAppStore } from "@/store/app-store";

export default function PrivacyScreen() {
  const locationGranted = useAppStore((state) => state.locationGranted);
  return (
    <Page>
      <TopBar title="개인정보와 권한" />
      <Card tone="lime" style={styles.hero}><ShieldCheck size={26} color={colors.limeInk} /><View style={styles.heroCopy}><AppText variant="heading" color={colors.limeInk}>내 정보는 내가 조절해요</AppText><AppText color={colors.limeInk}>정확한 위치는 미션 이동 중에만 사용하고, 경로 원본은 기본 보관하지 않아요.</AppText></View></Card>
      <AppText variant="caption" color={colors.inkMuted} style={styles.label}>권한</AppText>
      <Card tone="outline" style={styles.group}>
        <ListRow title="위치 권한" subtitle="미션 이동 안내에만 사용" value={locationGranted ? "허용됨" : "사용 전"} icon={LocateFixed} onPress={() => undefined} />
        <ListRow title="활동 동네" subtitle="정확한 주소 없이 구 단위" value="마포구" icon={MapPinned} onPress={() => undefined} />
      </Card>
      <AppText variant="caption" color={colors.inkMuted} style={styles.label}>기록 보관</AppText>
      <Card tone="outline" style={styles.group}>
        <ToggleRow title="경로를 기기에 저장" description="서버에는 거리·시간만 전송" value={false} onValueChange={() => undefined} icon={Database} />
        <ListRow title="내 데이터 내려받기" subtitle="JSON 파일로 준비" icon={Download} onPress={() => undefined} />
        <ListRow title="외출 기록 전체 삭제" subtitle="삭제 후 복구할 수 없어요" icon={Trash2} destructive onPress={() => undefined} />
      </Card>
      <Button label="개인정보 처리방침 보기" variant="secondary" onPress={() => undefined} />
    </Page>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  heroCopy: { flex: 1, gap: spacing.xs },
  label: { marginTop: spacing.xl, marginBottom: spacing.xs },
  group: { paddingVertical: 0, marginBottom: spacing.sm },
});
