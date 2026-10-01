import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { AppText, Button, Card, Chip, StateView } from "./ui";
import { ChoiceGroup } from "./ChoiceGroup";
import { FormField } from "./FormField";
import { useHistory } from "@/services/queries";
import type { HistoryFilter } from "@/services/backend-client";
import { categories } from "@/constants/options";
import { colors, spacing } from "@/constants/theme";
import { formatKoreaTime } from "@/services/time";

export function HistoryContent() {
  const router = useRouter();
  const [filter, setFilter] = useState<HistoryFilter>({
    period: "MONTH",
    page: 0,
    size: 20,
  });
  const [monthOpen, setMonthOpen] = useState(false);
  const [month, setMonth] = useState("");
  const [error, setError] = useState("");
  const query = useHistory(filter);
  const change = (patch: HistoryFilter) =>
    setFilter({ ...filter, ...patch, page: 0 });
  return (
    <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
      <ChoiceGroup
        title="기간"
        options={{ WEEK: "주간", MONTH: "월간", ALL: "전체" }}
        value={filter.period}
        onChange={(period) => change({ period, yearMonth: undefined })}
      />
      {filter.period === "MONTH" ? (
        <Chip
          label={
            monthOpen ? "월 선택 닫기" : (filter.yearMonth ?? "다른 달 보기")
          }
          selected={monthOpen}
          onPress={() => setMonthOpen(!monthOpen)}
        />
      ) : null}
      {filter.period === "MONTH" && monthOpen ? (
        <View style={{ gap: spacing.xs }}>
          <FormField
            label="조회할 월 (YYYY-MM, 비우면 이번 달)"
            value={month}
            onChangeText={setMonth}
            placeholder="2026-09"
            maxLength={7}
          />
          <Button
            label="월 적용"
            variant="secondary"
            onPress={() => {
              if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
                setError("YYYY-MM 형식의 월을 입력해 주세요.");
                return;
              }
              setError("");
              change({ yearMonth: month || undefined });
              setMonthOpen(false);
            }}
          />
          {error ? <AppText color={colors.danger}>{error}</AppText> : null}
        </View>
      ) : null}
      <ChoiceGroup
        title="활동"
        options={categories}
        value={filter.category}
        onChange={(category) =>
          change({
            category: category === filter.category ? undefined : category,
          })
        }
      />
      <Chip
        label="무료 활동만"
        selected={filter.freeOnly}
        onPress={() => change({ freeOnly: !filter.freeOnly })}
      />
      {query.isLoading ? (
        <StateView type="loading" />
      ) : query.isError ? (
        <StateView
          type="error"
          description={query.error.message}
          onRetry={() => query.refetch()}
        />
      ) : (
        <>
          <Card tone="lime" style={{ gap: spacing.xs }}>
            <AppText variant="heading">
              {query.data?.summary?.completedCount ?? 0}번의 외출
            </AppText>
            <AppText>
              {query.data?.summary?.totalOutdoorMinutes ?? 0}분 · 새 장소{" "}
              {query.data?.summary?.newPlaceCount ?? 0}곳
            </AppText>
            <AppText variant="caption">
              예상 왕복{" "}
              {(
                (query.data?.summary?.totalRouteDistanceMeters ?? 0) / 1000
              ).toFixed(1)}
              km · 만족도{" "}
              {query.data?.summary?.averageSatisfaction?.toFixed(1) ?? "—"}/5
            </AppText>
          </Card>
          {!query.data?.records?.length ? (
            <StateView
              type="empty"
              title="아직 기록이 없어요"
              description="이 조건에 맞는 완료한 미션이 없어요. 다른 기간이나 활동을 골라보세요."
            />
          ) : (
            query.data.records.map((record) => (
              <Card
                key={record.missionId}
                tone="outline"
                onPress={() => router.push(`/history/${record.missionId}`)}
                accessibilityLabel={`${record.missionTitle} 기록 보기`}
                style={{ gap: spacing.xs }}
              >
                <AppText variant="caption" color={colors.inkMuted}>
                  {formatKoreaTime(record.completedAt)}
                </AppText>
                <AppText variant="heading">{record.missionTitle}</AppText>
                <AppText>{record.placeName}</AppText>
                <AppText variant="caption" color={colors.inkMuted}>
                  {record.durationMinutes ?? 0}분 · 만족도{" "}
                  {record.satisfaction ?? "—"}/5 ·{" "}
                  {record.isNewPlace ? "새로운 장소" : "다시 찾은 장소"}
                </AppText>
              </Card>
            ))
          )}
          {(query.data?.pagination?.totalPages ?? 0) > 1 ? (
            <View style={{ gap: spacing.xs }}>
              <AppText align="center">
                {(filter.page ?? 0) + 1} / {query.data?.pagination?.totalPages}
              </AppText>
              <Button
                label="이전 기록"
                variant="secondary"
                disabled={!filter.page}
                onPress={() => setFilter({ ...filter, page: filter.page! - 1 })}
              />
              <Button
                label="다음 기록"
                variant="secondary"
                disabled={!query.data?.pagination?.hasNext}
                onPress={() =>
                  setFilter({ ...filter, page: (filter.page ?? 0) + 1 })
                }
              />
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}
