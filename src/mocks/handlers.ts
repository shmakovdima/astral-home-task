import { http, HttpResponse } from 'msw'
import { EventsByDate } from '../models'

const events: EventsByDate = {
  "2024-03-11": [
    {
      id: "event-1",
      title: "Coffee with Alex",
      description: "Meet with Alex to brainstorm ideas for the upcoming product launch.",
      imageUrl: "https://fastly.picsum.photos/id/312/1920/1080.jpg",
      timestamp: new Date("2024-03-11T09:00:00-05:00").toISOString(),
    },
    {
      id: "event-2",
      title: "Team Standup",
      description: "Weekly standup meeting with the dev team.",
      imageUrl: "http://fastly.picsum.photos/id/737/1920/1080.jpg",
      timestamp: new Date("2024-03-11T14:00:00-05:00").toISOString(),
    },
  ],
  "2024-03-12": [
    {
      id: "event-3",
      title: "Yoga Session",
      description: "Join for a relaxing yoga session to reduce stress and improve mindfulness.",
      imageUrl: "https://fastly.picsum.photos/id/392/1920/1080.jpg",
      timestamp: new Date("2024-03-12T12:00:00-05:00").toISOString(),
    },
    {
      id: "event-4",
      title: "Product Demo",
      description: "Demo of UI improvements and performance optimizations.",
      imageUrl: "https://fastly.picsum.photos/id/249/1920/1080.jpg",
      timestamp: new Date("2024-03-12T15:30:00-05:00").toISOString(),
    },
  ],
  "2024-03-13": [
    {
      id: "event-5",
      title: "Client Meeting",
      description: "Review project progress and timeline adjustments.",
      imageUrl: "https://fastly.picsum.photos/id/908/1920/1080.jpg",
      timestamp: new Date("2024-03-13T11:30:00-05:00").toISOString(),
    },
  ],
};

export const handlers = [
  // Get all events
  http.get('/api/events', () => {
    return HttpResponse.json(events)
  }),
  
  // Get a specific event by ID
  http.get('/api/event/:id', ({ params }) => {
    const { id } = params
    
    // Search for the event across all dates
    for (const date in events) {
      const event = events[date].find(event => event.id === id)
      if (event) {
        return HttpResponse.json(event)
      }
    }
    
    return new HttpResponse(null, {
      status: 404,
      statusText: 'Event not found'
    })
  }),
]