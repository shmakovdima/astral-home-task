import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { ErrorState } from "@/components/ErrorState";
import { EventSkeleton } from "@/components/EventSkeleton";
import { useEvent } from "@/hooks/useEvents";

export default function EventDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data: event, isLoading, error } = useEvent(id as string);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Link
          className="text-blue-500 hover:underline mb-4 inline-block"
          href="/"
        >
          ← Back to calendar
        </Link>
        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
          <EventSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Link
          className="text-blue-500 hover:underline mb-4 inline-block"
          href="/"
        >
          ← Back to calendar
        </Link>
        <ErrorState
          message="Failed to load event details"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-8">
        <Link
          className="text-blue-500 hover:underline mb-4 inline-block"
          href="/"
        >
          ← Back to calendar
        </Link>
        <ErrorState message="Event not found" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Link
        className="text-blue-500 hover:underline mb-4 inline-block"
        href="/"
      >
        ← Back to calendar
      </Link>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="relative w-full h-64">
          <Image
            alt={event.title}
            className="object-cover"
            fill
            priority
            src={event.imageUrl}
          />
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{event.title}</h1>

          <div className="flex items-center text-gray-500 mb-4">
            <span>
              {new Date(event.timestamp).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="mx-2">•</span>
            <span>
              {new Date(event.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <p className="text-gray-700 whitespace-pre-line">
            {event.description}
          </p>
        </div>
      </div>
    </div>
  );
}
