import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { Roboto } from "next/font/google";

import { useReloadOnResize } from "@/hooks/useReloadOnResize";
import { DnDProvider } from "@/providers/DnDProvider";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";

import "../styles/globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [isReady, setIsReady] = useState(false);
  useReloadOnResize();

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
    <ReactQueryProvider>
      <DnDProvider>
        <div className={roboto.className}>
          <Component {...pageProps} />
        </div>
      </DnDProvider>
    </ReactQueryProvider>
  );
};

export default MyApp;
