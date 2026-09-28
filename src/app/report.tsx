import { USE_MSW } from "@/constants/api";
import { UnavailableFeature } from "@/components/UnavailableFeature";
import { useRouter } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { AppText, Button, Chip, Page, TopBar } from "@/components/ui";
import { colors, font, radius, spacing } from "@/constants/theme";

const reasons = ["장소가 없어요", "영업/개방 정보가 달라요", "위험한 경로예요", "부적절한 정보예요", "기타"];

function PreviewReportScreen() {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  if (done) {
    return <Page action={<Button label="확인" onPress={() => router.back()} />}><TopBar title="장소 신고" /><View style={styles.success}><View style={styles.successIcon}><CheckCircle2 size={38} color={colors.success} /></View><AppText variant="title" align="center">알려주셔서 고마워요.</AppText><AppText color={colors.inkMuted} align="center">확인 전까지 같은 추천이 반복되지 않도록 임시로 제외할게요.</AppText></View></Page>;
  }
  return (
    <Page action={<Button label="신고 보내기" disabled={!reason} onPress={() => setDone(true)} />}>
      <TopBar title="장소 신고" />
      <View style={styles.header}><AppText variant="title">어떤 정보가 달랐나요?</AppText><AppText color={colors.inkMuted}>안전과 장소 품질 개선에만 사용하며, 신고자 정보는 공개하지 않아요.</AppText></View>
      <View style={styles.chips}>{reasons.map((item) => <Chip key={item} label={item} selected={reason === item} onPress={() => setReason(item)} />)}</View>
      <View style={styles.field}><AppText variant="label">자세한 내용 <AppText variant="caption" color={colors.inkFaint}>(선택)</AppText></AppText><TextInput value={detail} onChangeText={setDetail} multiline maxLength={300} placeholder="확인에 도움이 될 내용을 적어주세요." placeholderTextColor={colors.inkFaint} style={styles.input} /><AppText variant="caption" color={colors.inkFaint} align="right">{detail.length}/300</AppText></View>
    </Page>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginTop: spacing.xl },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.xl },
  field: { gap: spacing.xs, marginTop: spacing.xxl },
  input: { minHeight: 150, borderRadius: radius.lg, backgroundColor: colors.surfaceSubtle, borderWidth: 1, borderColor: colors.border, padding: spacing.md, textAlignVertical: "top", fontFamily: font.regular, fontSize: 16, lineHeight: 24, color: colors.ink },
  success: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingHorizontal: spacing.lg },
  successIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.successSoft, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
});

export default function Screen() { return USE_MSW ? <PreviewReportScreen /> : <UnavailableFeature title="장소 신고" />; }
