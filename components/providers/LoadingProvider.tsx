"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { FullScreenLoader } from "@/components/ui/LogoLoader";

interface LoadingContextType {
  setGlobalLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ setGlobalLoading: setIsLoading }}>
      {children}
      {isLoading && <FullScreenLoader />}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error("useLoading must be used within LoadingProvider");
  return context;
};
