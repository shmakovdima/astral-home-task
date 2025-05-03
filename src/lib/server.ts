import { QueryClient } from "@tanstack/react-query";

import { eventsResponseSchema } from "@/lib/validations";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });

export const fetchEvents = async () => {
  const queryClient = createQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: ["events"],
      queryFn: async () => {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

        console.log("[Server] Fetching events from:", `${baseUrl}/api/events`);

        const response = await fetch(`${baseUrl}/api/events`, {
          cache: "no-store",
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();

          console.error("[Server] Failed to fetch events:", {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          });

          throw new Error(
            `Failed to fetch events: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        return eventsResponseSchema.parse(data);
      },
    });
  } catch (error) {
    console.error("[Server] Error in fetchEvents:", error);

    return queryClient;
  }

  return queryClient;
};
