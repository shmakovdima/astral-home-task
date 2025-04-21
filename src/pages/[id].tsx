import { useEvent } from '@/hooks/useEvents';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function EventDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data: event, isLoading, error } = useEvent(id as string);

  if (isLoading) return <div>Loading event...</div>;
  if (error) return <div>Error loading event: {(error as Error).message}</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="container mx-auto py-8">
      <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Back to calendar
      </Link>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <img 
          src={event.imageUrl} 
          alt={event.title}
          className="w-full h-64 object-cover"
        />
        
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
          
          <div className="flex items-center text-gray-500 mb-4">
            <span>
              {new Date(event.timestamp).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span className="mx-2">•</span>
            <span>
              {new Date(event.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
        </div>
      </div>
    </div>
  );
}