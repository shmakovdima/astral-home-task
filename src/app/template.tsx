'use client';

import { useEffect, useState } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
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

  return <>{children}</>;
} 