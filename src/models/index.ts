export type Event = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  timestamp: string;
  duration: number;
  location: string;
};

export type EventsByDate = {
  [date: string]: Event[];
};
