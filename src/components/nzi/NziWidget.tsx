import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNzi } from '@/context/NziContext';
import NziCharacter from './NziCharacter';
import NziDialog from './NziDialog';

interface NziWidgetProps {
  className?: string;
}

const ROUTE_GREETINGS: Record<string, { msg: string; exp: Parameters<ReturnType<typeof useNzi>['showMessage']>[1] }> = {
  '/dashboard':              { msg: "Bem-vindo ao teu painel! Pronto para aprender? 🌟", exp: 'waving' },
  '/dashboard/quizzes':      { msg: "Hora de testar os teus conhecimentos! 🎯", exp: 'excited' },
  '/dashboard/skill-tree':   { msg: "Cada nível desbloqueado é uma vitória! 🌳", exp: 'determined' },
  '/dashboard/leagues':      { msg: "Sobe na liga e mostra do que és capaz! 🏆", exp: 'excited' },
  '/dashboard/flashcards':   { msg: "Revisão espaçada — o segredo da memória de longo prazo! 🃏", exp: 'hint' },
  '/dashboard/mindmap':      { msg: "Visualiza as conexões entre os tópicos! 🕸️", exp: 'thinking' },
  '/dashboard/story':        { msg: "Uma nova aventura começa aqui! 📖", exp: 'waving' },
  '/dashboard/performance':  { msg: "Olha para o teu progresso — estás a crescer! 📈", exp: 'celebrate' },
};

// Floating Nzi widget — fixed bottom-right of screen
const NziWidget: React.FC<NziWidgetProps> = ({ className = '' }) => {
  const { expression, message, hideMessage, showMessage } = useNzi();
  const location = useLocation();
  const prevPath = useRef<string>('');

  useEffect(() => {
    const path = location.pathname;
    if (path === prevPath.current) return;
    prevPath.current = path;
    const greeting = ROUTE_GREETINGS[path];
    if (greeting) {
      const delay = setTimeout(() => showMessage(greeting.msg, greeting.exp, 4000), 800);
      return () => clearTimeout(delay);
    }
  }, [location.pathname, showMessage]);

  const handleClick = () => {
    if (message) {
      hideMessage();
    } else {
      const tips = [
        "Estás a ir bem! Continua a estudar! 📚",
        "Lembra-te: cada pergunta é uma oportunidade de aprender!",
        "Toca em mim quando precisares de ajuda! 😊",
        "Sou o Nzi, o teu guia de aprendizagem!",
        "Hoje é um bom dia para aprender algo novo! 🌟",
      ];
      showMessage(tips[Math.floor(Math.random() * tips.length)], 'hint', 4000);
    }
  };

  return (
    <div
      className={`fixed bottom-24 right-4 z-50 flex flex-col items-end select-none ${className}`}
      style={{ pointerEvents: 'none' }}
    >
      <div className="relative" style={{ pointerEvents: 'auto' }}>
        <NziDialog message={message} onDismiss={hideMessage} />
        <NziCharacter
          expression={expression}
          size={72}
          onClick={handleClick}
        />
      </div>
    </div>
  );
};

export default NziWidget;
