import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

import { Event, EventsByDate } from '@/models';

export const useAllEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<EventsByDate> => {
      const { data } = await axiosInstance.get('/api/events');
      return data;
    }
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async (): Promise<Event> => {
      const { data } = await axiosInstance.get(`/api/event/${id}`);
      return data;
    },
    enabled: !!id,
  });
};