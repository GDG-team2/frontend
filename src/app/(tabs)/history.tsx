import { AppText, Page } from "@/components/ui";
import { HistoryContent } from "@/components/HistoryContent";
export default function HistoryScreen() {
  return (
    <Page testID="history-screen">
      <AppText variant="title">활동 기록</AppText>
      <HistoryContent />
    </Page>
  );
}
