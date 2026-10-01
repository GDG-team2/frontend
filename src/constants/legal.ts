export const legalDocuments = [
  {
    key: "service",
    label: "서비스 이용약관",
    url: process.env.EXPO_PUBLIC_SERVICE_TERMS_URL,
  },
  {
    key: "privacy",
    label: "개인정보 수집·이용 동의",
    url: process.env.EXPO_PUBLIC_PRIVACY_TERMS_URL,
  },
  {
    key: "location",
    label: "위치기반서비스 이용약관",
    url: process.env.EXPO_PUBLIC_LOCATION_TERMS_URL,
  },
] as const;
export const legalReady = legalDocuments.every(
  ({ url }) => url && /^https:\/\//.test(url),
);
