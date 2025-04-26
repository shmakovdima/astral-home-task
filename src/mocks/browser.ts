import { setupWorker } from "msw/browser";

import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

if (typeof window !== "undefined" && /Chrome/.test(navigator.userAgent)) {
  navigator.serviceWorker.getRegistration().then((registration) => {
    if (!registration) {
      worker
        .start({
          onUnhandledRequest: "bypass",
          serviceWorker: {
            url: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/mockServiceWorker.js`,
          },
          quiet: true,
        })
        .catch(console.error);
    }
  });
}
