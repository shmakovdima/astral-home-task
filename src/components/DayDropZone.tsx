import { useEffect, useRef, useState } from "react";
import { useDrop } from "react-dnd";

type DayDropZoneProps = {
  children: React.ReactNode;
  onDayChange: (daysToMove: number) => void;
  onDrop: (daysToMove: number) => void;
  onWeekChange?: (direction: "prev" | "next") => void;
};

export const DayDropZone = ({
  children,
  onDayChange,
  onDrop,
  onWeekChange,
}: DayDropZoneProps) => {
  const startX = useRef<number | null>(null);
  const daysToMove = useRef<number>(0);
  const [isNearLeftEdge, setIsNearLeftEdge] = useState(false);
  const [isNearRightEdge, setIsNearRightEdge] = useState(false);
  const weekChangeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasDroppedRef = useRef(false); // Add this line to define the reference
  const edgeThreshold = 100; // пикселей от края экрана

  // Очистка таймера при размонтировании
  useEffect(
    () => () => {
      if (weekChangeTimerRef.current) {
        clearTimeout(weekChangeTimerRef.current);
      }
    },
    [],
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "event",
      hover: (_, monitor) => {
        // Сбрасываем флаг при начале нового перетаскивания
        if (!monitor.isOver()) {
          hasDroppedRef.current = false;
        }

        const clientOffset = monitor.getClientOffset();

        if (!clientOffset) return;

        if (startX.current === null) {
          startX.current = clientOffset.x;
          return;
        }

        const deltaX = clientOffset.x - startX.current;
        const dayWidth = window.innerWidth / 7; // Примерная ширина дня
        const newDaysToMove = Math.round(deltaX / dayWidth);

        // Проверка близости к краям экрана
        const isLeftEdge = clientOffset.x < edgeThreshold;
        const isRightEdge = clientOffset.x > window.innerWidth - edgeThreshold;

        setIsNearLeftEdge(isLeftEdge);
        setIsNearRightEdge(isRightEdge);

        if (isLeftEdge && onWeekChange) {
          if (!weekChangeTimerRef.current) {
            weekChangeTimerRef.current = setTimeout(() => {
              onWeekChange("prev");
              // Сбрасываем начальную позицию после перехода на другую неделю
              startX.current = null;
              daysToMove.current = 0;
              weekChangeTimerRef.current = null;
            }, 500); // Задержка перед переходом на другую неделю
          }
        } else if (isRightEdge && onWeekChange) {
          if (!weekChangeTimerRef.current) {
            weekChangeTimerRef.current = setTimeout(() => {
              onWeekChange("next");
              // Сбрасываем начальную позицию после перехода на другую неделю
              startX.current = null;
              daysToMove.current = 0;
              weekChangeTimerRef.current = null;
            }, 500); // Задержка перед переходом на другую неделю
          }
        } else if (weekChangeTimerRef.current) {
          // Если курсор ушел от края, отменяем таймер
          clearTimeout(weekChangeTimerRef.current);
          weekChangeTimerRef.current = null;
        }

        if (newDaysToMove !== daysToMove.current) {
          daysToMove.current = newDaysToMove;
          onDayChange(newDaysToMove);
        }
      },
      drop: () => {
        // Очищаем таймер при завершении перетаскивания
        if (weekChangeTimerRef.current) {
          clearTimeout(weekChangeTimerRef.current);
          weekChangeTimerRef.current = null;
        }

        const result = { daysToMove: daysToMove.current };

        // Вызываем onDrop только один раз
        if (!hasDroppedRef.current) {
          hasDroppedRef.current = true;
          onDrop(daysToMove.current);

          // Сбрасываем флаг через небольшую задержку
          setTimeout(() => {
            hasDroppedRef.current = false;
          }, 200);
        }

        startX.current = null;
        daysToMove.current = 0;
        setIsNearLeftEdge(false);
        setIsNearRightEdge(false);

        return result;
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [onDayChange, onDrop, onWeekChange],
  );

  return (
    <div
      className={`w-full h-full relative ${isOver ? "bg-blue-50/30" : ""}`}
      ref={drop}
    >
      {isNearLeftEdge ? (
        <div className="absolute left-0 top-0 bottom-0 w-[100px] bg-gradient-to-r from-blue-500/20 to-transparent z-10 flex items-center justify-start">
          <div className="ml-4 bg-blue-500 rounded-full p-2 text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15 19l-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
        </div>
      ) : null}

      {isNearRightEdge ? (
        <div className="absolute right-0 top-0 bottom-0 w-[100px] bg-gradient-to-l from-blue-500/20 to-transparent z-10 flex items-center justify-end">
          <div className="mr-4 bg-blue-500 rounded-full p-2 text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 5l7 7-7 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
        </div>
      ) : null}

      {children}
    </div>
  );
};
