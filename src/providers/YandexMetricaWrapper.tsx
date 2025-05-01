'use client';

import { YandexMetricaProvider } from "next-yandex-metrica";

export function YandexMetricaWrapper({ children }: { children: React.ReactNode }) {
  return (
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
} 