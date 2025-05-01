import { Roboto } from "next/font/google";

import { DnDProvider } from "@/providers/DnDProvider";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { YandexMetricaWrapper } from "@/providers/YandexMetricaWrapper";

import "@/styles/globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Astral Home Task",
  description: "Astral Home Task Application",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body className={roboto.className}>
      <YandexMetricaWrapper>
        <ReactQueryProvider>
          <DnDProvider>
            <ToastProvider>{children}</ToastProvider>
          </DnDProvider>
        </ReactQueryProvider>
      </YandexMetricaWrapper>
    </body>
  </html>
);

export default RootLayout;
