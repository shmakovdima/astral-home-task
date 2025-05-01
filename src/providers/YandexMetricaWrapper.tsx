"use client";

import { YandexMetricaProvider } from "next-yandex-metrica";

export const YandexMetricaWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <YandexMetricaProvider
    initParameters={{
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
    }}
    tagID={101466502}
  >
    {children}
  </YandexMetricaProvider>
);
