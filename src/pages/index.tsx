import { useAllEvents } from '@/hooks/useEvents';
import Link from 'next/link';
import { Suspense } from 'react';

function CalendarContent() {
  const { data: eventsByDate } = useAllEvents();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Calendar</h1>
      
      {Object.entries(eventsByDate || {}).map(([date, events]) => (
        <div key={date} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
          
          <div className="grid gap-4">
            {events.map((event) => (
              <Link 
                key={event.id} 
                href={`/${event.id}`}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-medium">{event.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
export default function IndexPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8">Loading calendar...</div>}>
      <CalendarContent />
    </Suspense>
  );
}
