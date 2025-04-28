import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { Roboto } from "next/font/google";
import { YandexMetricaProvider } from "next-yandex-metrica";

import { DnDProvider } from "@/providers/DnDProvider";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";

import "../styles/globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("../mocks/browser").then(({ worker }) => {
        worker
          .start({
            onUnhandledRequest: "bypass",
            serviceWorker: {
              url: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/mockServiceWorker.js`,
            },
            quiet: true,
          })
          .then(() => setIsReady(true));
      });
    } else {
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <YandexMetricaProvider
      initParameters={{
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
      }}
      tagID={101466502}
    >
      <ReactQueryProvider>
        <DnDProvider>
          <ToastProvider>
            <div className={roboto.className}>
              <Component {...pageProps} />
            </div>
          </ToastProvider>
        </DnDProvider>
      </ReactQueryProvider>
    </YandexMetricaProvider>
  );
};

export default MyApp;
