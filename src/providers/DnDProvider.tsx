import { type ReactNode } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

type Props = {
  children: ReactNode;
};

export const DnDProvider = ({ children }: Props) => {
  const isTouchDevice =
    typeof window !== "undefined" && "ontouchstart" in window;

  return (
    <DndProvider
      backend={isTouchDevice ? TouchBackend : HTML5Backend}
      options={{
        enableMouseEvents: true,
        enableTouchEvents: true,
        enableKeyboardEvents: true,
        delayTouchStart: 0,
        delayMouseStart: 0,
        touchSlop: 0,
        ignoreContextMenu: true,
        scrollAngleRanges: [
          { start: 30, end: 150 },
          { start: 210, end: 330 },
        ],
      }}
    >
      {children}
    </DndProvider>
  );
};
