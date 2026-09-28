import { USE_MSW } from "@/constants/api";
import { UnavailableFeature } from "@/components/UnavailableFeature";
import { useRouter } from "expo-router";
import { Camera, MapPin, UserRound } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { AppText, Button, Page, TopBar } from "@/components/ui";
import { colors, font, radius, spacing } from "@/constants/theme";

function PreviewEditProfileScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState("선우");
  const [bio, setBio] = useState("결정은 작게, 산책은 가볍게.");
  return (
    <Page action={<Button label="변경 사항 저장" disabled={!nickname.trim()} onPress={() => router.back()} />}>
      <TopBar title="프로필 편집" />
      <View style={styles.avatarWrap}><View style={styles.avatar}><UserRound size={38} color={colors.purpleStrong} /></View><Pressable accessibilityRole="button" accessibilityLabel="프로필 사진 변경" style={styles.camera}><Camera size={18} color={colors.white} /></Pressable></View>
      <View style={styles.fields}>
        <View style={styles.field}><AppText variant="label">닉네임</AppText><TextInput value={nickname} onChangeText={setNickname} maxLength={12} style={styles.input} /><AppText variant="caption" color={colors.inkFaint} align="right">{nickname.length}/12</AppText></View>
        <View style={styles.field}><AppText variant="label">한 줄 소개</AppText><TextInput value={bio} onChangeText={setBio} maxLength={40} style={styles.input} /><AppText variant="caption" color={colors.inkFaint} align="right">{bio.length}/40</AppText></View>
        <View style={styles.field}><AppText variant="label">활동 동네</AppText><Pressable accessibilityRole="button" accessibilityLabel="활동 동네 변경" style={styles.area}><MapPin size={19} color={colors.inkMuted} /><AppText style={styles.areaCopy}>서울 마포구</AppText><AppText variant="caption" color={colors.purpleInk}>변경</AppText></Pressable><AppText variant="caption" color={colors.inkMuted}>구 단위만 프로필에 저장해요.</AppText></View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  avatarWrap: { alignSelf: "center", marginVertical: spacing.xxl },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.purpleSoft, alignItems: "center", justifyContent: "center" },
  camera: { position: "absolute", right: 0, bottom: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.ink, borderWidth: 3, borderColor: colors.white, alignItems: "center", justifyContent: "center" },
  fields: { gap: spacing.xl },
  field: { gap: spacing.xs },
  input: { height: 54, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.md, fontFamily: font.regular, fontSize: 16, lineHeight: 24, color: colors.ink },
  area: { height: 54, flexDirection: "row", alignItems: "center", gap: spacing.xs, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.md },
  areaCopy: { flex: 1 },
});

export default function Screen() { return USE_MSW ? <PreviewEditProfileScreen /> : <UnavailableFeature title="프로필 편집" />; }
