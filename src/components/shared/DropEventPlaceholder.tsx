type Props = {
  minHeight?: number;
};

export const DropEventPlaceholder = ({ minHeight = 140 }: Props) => (
  <div
    className="flex items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/70 text-center text-gray-500"
    style={{
      minHeight: `${minHeight}px`,
      padding: "0.5rem",
    }}
  >
    <div className="flex flex-col items-center gap-2">
      <svg
        className="h-6 w-6 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </svg>
      <span className="text-xs font-medium text-blue-600 select-none">
        Drop event to this day
      </span>
    </div>
  </div>
);
