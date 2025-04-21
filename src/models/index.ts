type Event = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  timestamp: string;
};

export type EventsByDate = {
  [date: string]: Event[];
};
