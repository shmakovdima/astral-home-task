"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastContextType = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const useToastContext = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }

  return useMemo(() => context, [context]);
};

type Props = {
  children: React.ReactNode;
};

export const ToastProvider = ({ children }: Props) => {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((newMessage: string) => {
    setMessage(newMessage);

    setTimeout(() => {
      setMessage(null);
    }, 3000);
  }, []);

  const contextValue = useMemo(
    () => ({
      showToast,
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {message ? (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-[9999]">
          {message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
};
