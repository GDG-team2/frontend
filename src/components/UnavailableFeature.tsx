import { AppText, Page, StateView, TopBar } from "@/components/ui";
export function UnavailableFeature({ title }: { title: string }) {
  return (
    <Page>
      <TopBar title={title} />
      <StateView type="empty" title="아직 준비 중인 기능이에요" />
      <AppText>
        현재는 이 정보를 조회하거나 변경할 수 없어요. 연결이 준비되면 이용할 수
        있어요.
      </AppText>
    </Page>
  );
}
