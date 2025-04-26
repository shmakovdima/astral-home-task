import { useRef } from "react";
import { useDrop } from "react-dnd";

type DayDropZoneProps = {
  children: React.ReactNode;
  onDayChange: (daysToMove: number) => void;
  onDrop: (daysToMove: number) => void;
};

export const DayDropZone = ({
  children,
  onDayChange,
  onDrop,
}: DayDropZoneProps) => {
  const startX = useRef<number | null>(null);
  const daysToMove = useRef<number>(0);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "event",
      hover: (_, monitor) => {
        const clientOffset = monitor.getClientOffset();

        if (!clientOffset) return;

        if (startX.current === null) {
          startX.current = clientOffset.x;
          return;
        }

        const deltaX = clientOffset.x - startX.current;
        const dayWidth = window.innerWidth / 7; // Примерная ширина дня
        const newDaysToMove = Math.round(deltaX / dayWidth);

        if (newDaysToMove !== daysToMove.current) {
          daysToMove.current = newDaysToMove;
          onDayChange(newDaysToMove);
        }
      },
      drop: () => {
        const result = { daysToMove: daysToMove.current };
        onDrop(daysToMove.current);
        startX.current = null;
        daysToMove.current = 0;
        return result;
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [onDayChange, onDrop],
  );

  return (
    <div
      className={`w-full h-full ${isOver ? "bg-blue-50/30" : ""}`}
      ref={drop}
    >
      {children}
    </div>
  );
};
