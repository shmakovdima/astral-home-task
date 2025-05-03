import { Roboto } from "next/font/google";
import Metrika from "next-metrika";
import { dehydrate } from "@tanstack/react-query";

import { fetchEvents } from "@/lib/server";
import { DnDProvider } from "@/providers/DnDProvider";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";

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

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const queryClient = await fetchEvents();
  const dehydratedState = dehydrate(queryClient);

  return (
    <html lang="en">
      <body className={roboto.className}>
        <Metrika id={101466502} />
        <ReactQueryProvider dehydratedState={dehydratedState}>
          <DnDProvider>
            <ToastProvider>{children}</ToastProvider>
          </DnDProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
