import { setupWorker } from "msw/browser";

import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

// Добавляем проверку на Chrome и первую загрузку
if (typeof window !== "undefined" && /Chrome/.test(navigator.userAgent)) {
  // Проверяем, есть ли уже зарегистрированный service worker
  navigator.serviceWorker.getRegistration().then((registration) => {
    if (!registration) {
      // Если нет, регистрируем вручную
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
