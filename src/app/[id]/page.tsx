"use client";

import { notFound, useParams } from "next/navigation";

import { DayEventCard } from "@/components/DayEventCard";
import { WeekEventCard } from "@/components/WeekEventCard";
import { useEvent } from "@/hooks/api/useEvent";

const Page = () => {
  const params = useParams();

  const {
    data: event,
    isLoading,
    error,
  } = useEvent({ id: params.id as string });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error instanceof Error && error.message === "NOT_FOUND") {
    notFound();
  }

  if (!event) {
    return null;
  }

  return (
    <div>
      <div className="block md:hidden overflow-hidden">
        <DayEventCard {...event} />
      </div>
      <div className="hidden md:block">
        <WeekEventCard {...event} />
      </div>
    </div>
  );
};

export default Page;
