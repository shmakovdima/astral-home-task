export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  timestamp: string;
}

export interface EventsByDate {
  [date: string]: Event[];
}