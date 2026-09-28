import { useState } from "react";
import { View } from "react-native";
import {
  AppText,
  Button,
  Card,
  Page,
  StateView,
  TopBar,
} from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { usePoints } from "@/services/queries";
export default function BenefitsScreen() {
  const [page, setPage] = useState(0);
  const query = usePoints(page);
  if (query.isLoading)
    return (
      <Page>
        <TopBar title="포인트 내역" />
        <StateView type="loading" />
      </Page>
    );
  if (query.isError)
    return (
      <Page>
        <TopBar title="포인트 내역" />
        <StateView type="error" onRetry={() => query.refetch()} />
      </Page>
    );
  return (
    <Page>
      <TopBar title="포인트 내역" />
      <Card tone="purple">
        <AppText>보유 포인트</AppText>
        <AppText variant="display">
          {(query.data?.currentPoint ?? 0).toLocaleString()} P
        </AppText>
      </Card>
      <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
        {query.data?.history?.length ? (
          query.data.history.map((entry) => (
            <Card key={entry.historyId}>
              <AppText variant="label">{entry.description}</AppText>
              <AppText>
                {entry.type === "USE" ? "−" : "+"}
                {Math.abs(entry.amount ?? 0)} P
              </AppText>
              <AppText variant="caption" color={colors.inkMuted}>
                {entry.createdAt
                  ? new Date(entry.createdAt).toLocaleString("ko-KR")
                  : ""}
              </AppText>
            </Card>
          ))
        ) : (
          <StateView type="empty" title="포인트 내역이 없어요" />
        )}
        <AppText>{page + 1}페이지</AppText>
        <Button
          label="이전"
          variant="secondary"
          disabled={page === 0}
          onPress={() => setPage(page - 1)}
        />
        <Button
          label="다음"
          variant="secondary"
          disabled={!query.data?.pagination?.hasNext}
          onPress={() => setPage(page + 1)}
        />
      </View>
    </Page>
  );
}
