import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import { patchEventDateSchema } from "@/lib/validations";

export const useUpdateEventDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      timestamp,
    }: {
      id: string;
      timestamp: string;
    }) => {
      const validatedData = patchEventDateSchema.parse({ timestamp });
      const { data } = await api.patch(`/api/events/${id}`, validatedData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
