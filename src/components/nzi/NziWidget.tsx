import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useNzi } from '@/context/NziContext';
import NziCharacter from './NziCharacter';
import NziDialog from './NziDialog';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface NziWidgetProps {
  className?: string;
}

const ROUTE_GREETINGS: Record<string, { msg: string; exp: Parameters<ReturnType<typeof useNzi>['showMessage']>[1] }> = {
  '/dashboard/quizzes':      { msg: "Hora de testar os teus conhecimentos! 🎯", exp: 'excited' },
  '/dashboard/skill-tree':   { msg: "Cada nível desbloqueado é uma vitória! 🌳", exp: 'determined' },
  '/dashboard/leagues':      { msg: "Sobe na liga e mostra do que és capaz! 🏆", exp: 'excited' },
  '/dashboard/flashcards':   { msg: "Revisão espaçada — o segredo da memória de longo prazo! 🃏", exp: 'hint' },
  '/dashboard/mindmap':      { msg: "Visualiza as conexões entre os tópicos! 🕸️", exp: 'thinking' },
  '/dashboard/story':        { msg: "Uma nova aventura começa aqui! 📖", exp: 'waving' },
  '/dashboard/performance':  { msg: "Olha para o teu progresso — estás a crescer! 📈", exp: 'celebrate' },
};

const API_BASE = 'http://localhost:3001';

function getBestPtVoice(): SpeechSynthesisVoice | null {
  const vs = window.speechSynthesis?.getVoices() ?? [];
  const rank = [
    (v: SpeechSynthesisVoice) => /francisca|helia/i.test(v.name) && v.lang === 'pt-PT',
    (v: SpeechSynthesisVoice) => /natural|neural/i.test(v.name) && v.lang === 'pt-PT',
    (v: SpeechSynthesisVoice) => v.lang === 'pt-PT',
    (v: SpeechSynthesisVoice) => /natural|neural/i.test(v.name) && v.lang.startsWith('pt'),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('pt'),
  ];
  for (const fn of rank) { const f = vs.find(fn); if (f) return f; }
  return null;
}

function speak(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'pt-PT';
  utt.rate = 0.88;
  utt.pitch = 1.05;
  utt.volume = 1;
  const v = getBestPtVoice();
  if (v) utt.voice = v;
  window.speechSynthesis.speak(utt);
}

// Ensure voices are loaded
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? (window.SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null)
    : null;

const NziWidget: React.FC<NziWidgetProps> = ({ className = '' }) => {
  const { expression, message, hideMessage, showMessage, setExpression } = useNzi();
  const location = useLocation();
  const prevPath = useRef<string>('');

  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const recRef = useRef<any>(null);

  // Route greetings
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

  const askAI = useCallback(async (transcript: string) => {
    setIsThinking(true);
    setExpression('thinking');
    showMessage('A pensar...', 'thinking', 0);

    try {
      const res = await fetch(`${API_BASE}/api/nzila-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: transcript }),
      });
      const data = await res.json();
      const reply: string = data.reply ?? data.response ?? 'Não consegui obter resposta agora. Tenta novamente!';
      showMessage(reply, 'excited', 8000);
      speak(reply);
    } catch {
      const err = 'Sem conexão com a IA. Verifica se o servidor está ligado!';
      showMessage(err, 'hint', 5000);
    } finally {
      setIsThinking(false);
      setExpression('idle');
    }
  }, [showMessage, setExpression]);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      showMessage('O teu navegador não suporta reconhecimento de voz 😔', 'hint', 4000);
      return;
    }
    if (isListening || isThinking) return;

    window.speechSynthesis?.cancel();
    const rec = new SpeechRecognitionAPI();
    recRef.current = rec;
    rec.lang = 'pt-PT';
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      showMessage('A ouvir... fala comigo! 🎙️', 'excited', 0);
    };

    rec.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript;
      setIsListening(false);
      askAI(transcript);
    };

    rec.onerror = () => {
      setIsListening(false);
      showMessage('Não ouvi bem, tenta de novo! 🎙️', 'hint', 3000);
    };

    rec.onend = () => setIsListening(false);

    try {
      rec.start();
    } catch {
      setIsListening(false);
    }
  }, [isListening, isThinking, askAI, showMessage]);

  const stopListening = useCallback(() => {
    try { recRef.current?.stop(); } catch {}
    setIsListening(false);
  }, []);

  const handleNziClick = () => {
    if (isListening) { stopListening(); return; }
    if (isThinking) return;
    if (message && message !== 'A ouvir... fala comigo! 🎙️' && message !== 'A pensar...') {
      hideMessage();
    } else {
      const tips = [
        'Estás a ir bem! Continua a estudar! 📚',
        'Lembra-te: cada pergunta é uma oportunidade de aprender!',
        'Toca no microfone para falar comigo! 🎙️',
        'Sou o Nzi, o teu guia de aprendizagem!',
        'Hoje é um bom dia para aprender algo novo! 🌟',
      ];
      showMessage(tips[Math.floor(Math.random() * tips.length)], 'hint', 4000);
    }
  };

  const micBtnBg = isListening ? '#ef4444' : isThinking ? '#365A08' : '#1B1D24';
  const micBtnBorder = isListening ? '#ef4444' : isThinking ? '#5D9D0B' : '#365A08';

  return (
    <div
      className={`fixed bottom-24 right-4 z-50 flex flex-col items-end select-none ${className}`}
      style={{ pointerEvents: 'none' }}
    >
      <div className="relative" style={{ pointerEvents: 'auto' }}>
        <NziDialog message={message} onDismiss={hideMessage} />
        <NziCharacter
          expression={isListening ? 'excited' : isThinking ? 'thinking' : expression}
          size={72}
          onClick={handleNziClick}
        />

        {/* Mic button */}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isThinking}
          style={{
            position: 'absolute',
            bottom: -4,
            left: -4,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: micBtnBg,
            border: `2px solid ${micBtnBorder}`,
            cursor: isThinking ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isListening ? '0 0 0 4px #ef444440' : '0 2px 8px #00000060',
            transition: 'all 0.2s',
            animation: isListening ? 'nzi-pulse 1s ease-in-out infinite' : 'none',
          }}
          title={isListening ? 'Parar' : 'Falar com o Nzi'}
        >
          {isThinking
            ? <Loader2 size={14} color="#72EB3A" style={{ animation: 'spin 1s linear infinite' }} />
            : isListening
            ? <MicOff size={14} color="#fff" />
            : <Mic size={14} color="#72EB3A" />}
        </button>
      </div>

      <style>{`
        @keyframes nzi-pulse {
          0%, 100% { box-shadow: 0 0 0 4px #ef444440; }
          50%       { box-shadow: 0 0 0 8px #ef444420; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default NziWidget;
