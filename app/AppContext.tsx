import React, { createContext, useContext, useState, ReactNode } from "react";

// Типове на данните в контекста
interface AppContextType {
  basename: string;
  setBasename: (basename: string) => void;
}

// Създаване на контекста
const AppContext = createContext<AppContextType | undefined>(undefined);

// Hook за използване на контекста
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

// Провайдър компонент
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [basename, setBasename] = useState<string>("");

  return (
    <AppContext.Provider value={{ basename, setBasename }}>
      {children}
    </AppContext.Provider>
  );
};
