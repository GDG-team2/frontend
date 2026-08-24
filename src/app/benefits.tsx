import { Gift, LockKeyhole, Ticket } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { AppText, Button, Card, Page, StateView, TopBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useBenefits } from "@/services/queries";

export default function BenefitsScreen() {
  const query = useBenefits();
  if (query.isLoading) return <Page><TopBar title="혜택 지갑" /><StateView type="loading" /></Page>;
  if (query.isError) return <Page><TopBar title="혜택 지갑" /><StateView type="error" onRetry={() => query.refetch()} /></Page>;
  return (
    <Page>
      <TopBar title="혜택 지갑" />
      <Card tone="purple" style={styles.balance}>
        <View><AppText variant="caption" color={colors.purpleInk}>사용 가능한 포인트</AppText><AppText variant="display" color={colors.purpleInk}>1,240 P</AppText></View>
        <View style={styles.gift}><Gift size={25} color={colors.purpleInk} /></View>
      </Card>
      <View style={styles.sectionHeader}><AppText variant="heading">바꿀 수 있는 혜택</AppText><AppText variant="caption" color={colors.inkMuted}>동네 제휴 혜택은 선택해서만 보여드려요.</AppText></View>
      {!query.data?.length ? <StateView type="empty" title="지금은 받을 수 있는 혜택이 없어요" /> : (
        <View style={styles.list}>
          {query.data.map((benefit) => (
            <Card key={benefit.id} tone="outline" style={styles.ticket}>
              <View style={styles.ticketIcon}><Ticket size={22} color={colors.limeInk} /></View>
              <View style={styles.ticketCopy}><AppText variant="caption" color={colors.inkMuted}>{benefit.brand}</AppText><AppText variant="heading">{benefit.title}</AppText><AppText variant="caption" color={colors.inkMuted}>{benefit.expiresAt}까지</AppText></View>
              <Button label={`${benefit.points}P`} variant="lime" onPress={() => undefined} style={styles.pointButton} />
            </Card>
          ))}
        </View>
      )}
      <Card tone="subtle" style={styles.privacy}>
        <LockKeyhole size={19} color={colors.inkMuted} />
        <AppText variant="caption" color={colors.inkMuted} style={styles.privacyCopy}>혜택 사용 여부는 랭킹이나 프로필에 공개되지 않아요.</AppText>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  balance: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.lg },
  gift: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  sectionHeader: { gap: 2, marginTop: spacing.xxl, marginBottom: spacing.md },
  list: { gap: spacing.sm },
  ticket: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md },
  ticketIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.limeSoft, alignItems: "center", justifyContent: "center" },
  ticketCopy: { flex: 1 },
  pointButton: { width: 76, minHeight: 42, paddingHorizontal: spacing.xs },
  privacy: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xl, padding: spacing.md },
  privacyCopy: { flex: 1 },
});
