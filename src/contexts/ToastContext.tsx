import React, { createContext, useContext } from "react";

type ToastContextType = {
  showToast: (options: { title: string; description?: string; type?: "success" | "error" | "info" }) => void;
};

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToastContext = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const showToast = (options: { title: string; description?: string; type?: string }) => {
    console.log(`[TOAST] ${options.type ?? "info"}: ${options.title}`);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};