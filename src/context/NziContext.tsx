import React, { createContext, useContext, useState, useCallback } from "react";

export type NziExpression = 'idle' | 'celebrate' | 'sad' | 'thinking' | 'hint' | 'determined' | 'sleep' | 'excited' | 'waving';

interface NziContextType {
  expression: NziExpression;
  message: string | null;
  setExpression: (exp: NziExpression) => void;
  showMessage: (text: string, exp?: NziExpression, duration?: number) => void;
  hideMessage: () => void;
  celebrate: (text?: string) => void;
  encourage: (text?: string) => void;
  giveHint: (text: string) => void;
  waveHello: (text?: string) => void;
  getExcited: (text?: string) => void;
}

const NziContext = createContext<NziContextType | undefined>(undefined);

export const NziProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expression, setExpressionState] = useState<NziExpression>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const setExpression = useCallback((exp: NziExpression) => {
    setExpressionState(exp);
  }, []);

  const showMessage = useCallback((text: string, exp?: NziExpression, duration = 4000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (exp) setExpressionState(exp);
    setMessage(text);
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setMessage(null);
        setExpressionState('idle');
      }, duration);
    }
  }, []);

  const hideMessage = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(null);
    setExpressionState('idle');
  }, []);

  const celebrate = useCallback((text?: string) => {
    showMessage(text || "Excelente! Continua assim! 🎉", 'celebrate', 3500);
  }, [showMessage]);

  const encourage = useCallback((text?: string) => {
    showMessage(text || "Não desistas! Cada erro é aprendizagem! 💪", 'sad', 3500);
  }, [showMessage]);

  const giveHint = useCallback((text: string) => {
    showMessage(text, 'hint', 5000);
  }, [showMessage]);

  const waveHello = useCallback((text?: string) => {
    showMessage(text || "Olá! Estou aqui para te ajudar! 👋", 'waving', 3500);
  }, [showMessage]);

  const getExcited = useCallback((text?: string) => {
    showMessage(text || "Incrível! Estás a arrasar! 🌟", 'excited', 3000);
  }, [showMessage]);

  return (
    <NziContext.Provider value={{ expression, message, setExpression, showMessage, hideMessage, celebrate, encourage, giveHint, waveHello, getExcited }}>
      {children}
    </NziContext.Provider>
  );
};

export const useNzi = () => {
  const ctx = useContext(NziContext);
  if (!ctx) throw new Error("useNzi must be used within NziProvider");
  return ctx;
};
