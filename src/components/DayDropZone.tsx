import { useDrop } from "react-dnd";

type DayDropZoneProps = {
  daysToMove: number;
  children: React.ReactNode;
};

export const DayDropZone = ({ children, daysToMove }: DayDropZoneProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "event",
    drop: () => ({ daysToMove }),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`relative transition-colors duration-200 ${
        isOver ? "bg-blue-50" : ""
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}; 