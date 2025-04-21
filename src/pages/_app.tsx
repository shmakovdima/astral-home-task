import type { AppProps } from "next/app";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";

import "../styles/globals.css";

if (process.env.NODE_ENV === "development") {
  import("../mocks/browser").then(({ worker }) => {
    worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: "/mockServiceWorker.js",
      },
      quiet: true,
    });
  });
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ReactQueryProvider>
      <Component {...pageProps} />
    </ReactQueryProvider>
  );
}
