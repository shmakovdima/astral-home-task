import { setupWorker } from "msw/browser";

import { handlers } from "./handlers";

// Create a new worker instance
const worker = setupWorker(...handlers);

// Start the worker when the app starts
if (typeof window !== "undefined") {
  worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });
}

export { worker };
