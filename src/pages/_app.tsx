import type { AppProps } from "next/app";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { useEffect, useState } from "react";

import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      import("../mocks/browser").then(({ worker }) => {
        worker.start({
          onUnhandledRequest: "bypass",
          serviceWorker: {
            url: "/mockServiceWorker.js",
          },
          quiet: true,
        }).then(() => {
          setIsReady(true);
        });
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
      <Component {...pageProps} />
    </ReactQueryProvider>
  );
}

export default MyApp;
