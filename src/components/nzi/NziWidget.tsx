import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useNzi } from '@/context/NziContext';
import NziCharacter from './NziCharacter';
import NziDialog from './NziDialog';
import { Mic, MicOff, Loader2, Send } from 'lucide-react';
import { SpeechRecognition as CapSpeech } from '@capacitor-community/speech-recognition';
import { speak, stopSpeech } from '@/lib/tts';

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

const API_BASE = import.meta.env.VITE_PROXY_URL || `http://${window.location.hostname}:3001`;

const isCapacitor = typeof window !== 'undefined' && !!(window as any).Capacitor;

const WebSpeechAPI =
  typeof window !== 'undefined'
    ? (window.SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null)
    : null;

// ── TTS via unified wrapper (native on Capacitor, speechSynthesis on web) ──

// ── Component ────────────────────────────────────────────────────────────────

const NziWidget: React.FC<NziWidgetProps> = ({ className = '' }) => {
  const { expression, message, hideMessage, showMessage, setExpression } = useNzi();
  const location = useLocation();
  const prevPath = useRef<string>('');

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [isThinking, setIsThinking]   = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput]     = useState('');
  const recRef   = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Route greetings
  useEffect(() => {
    const path = location.pathname;
    if (path === prevPath.current) return;
    prevPath.current = path;
    const greeting = ROUTE_GREETINGS[path];
    if (greeting) {
      const t = setTimeout(() => {
        showMessage(greeting.msg, greeting.exp, 4000);
        speak(greeting.msg);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [location.pathname, showMessage]);

  // Cleanup TTS on unmount
  useEffect(() => () => { stopSpeech(); }, []);

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
      showMessage(reply, 'excited', 10000);
      setIsSpeaking(true);
      speak(reply, () => setIsSpeaking(false));
    } catch {
      showMessage('Sem conexão com a IA. Verifica se o servidor está ligado!', 'hint', 5000);
    } finally {
      setIsThinking(false);
      setExpression('idle');
    }
  }, [showMessage, setExpression]);

  // ── STT: Capacitor native ────────────────────────────────────────────────

  const startCapacitorListening = useCallback(async () => {
    try {
      const perm = await CapSpeech.requestPermissions();
      if (perm.speechRecognition !== 'granted') {
        showMessage('Permissão de microfone negada 😔', 'hint', 3000);
        return;
      }

      await stopSpeech();
      setIsListening(true);
      showMessage('A ouvir... fala comigo! 🎙️', 'excited', 0);

      const result = await CapSpeech.start({
        language: 'pt-PT',
        maxResults: 1,
        popup: false,
        partialResults: false,
      });

      setIsListening(false);
      const transcript = result.matches?.[0];
      if (transcript) {
        askAI(transcript);
      } else {
        showMessage('Não ouvi bem, tenta de novo! 🎙️', 'hint', 3000);
      }
    } catch {
      setIsListening(false);
      showMessage('Erro ao aceder ao microfone 😔', 'hint', 3000);
    }
  }, [askAI, showMessage]);

  const stopCapacitorListening = useCallback(async () => {
    try { await CapSpeech.stop(); } catch {}
    setIsListening(false);
  }, []);

  // ── STT: Web browser ─────────────────────────────────────────────────────

  const startWebListening = useCallback(() => {
    if (!WebSpeechAPI || isListening) return;

    stopSpeech();
    const rec = new WebSpeechAPI();
    recRef.current = rec;
    rec.lang = 'pt-PT';
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart  = () => { setIsListening(true); showMessage('A ouvir... fala comigo! 🎙️', 'excited', 0); };
    rec.onresult = (e: any) => { setIsListening(false); askAI(e.results[0][0].transcript); };
    rec.onerror  = () => { setIsListening(false); showMessage('Não ouvi bem, tenta de novo! 🎙️', 'hint', 3000); };
    rec.onend    = () => setIsListening(false);

    try { rec.start(); } catch { setIsListening(false); }
  }, [isListening, askAI, showMessage]);

  // ── Unified mic button handler ────────────────────────────────────────────

  const handleMicPress = useCallback(() => {
    if (isThinking) return;

    if (isListening) {
      isCapacitor ? stopCapacitorListening() : (recRef.current?.stop?.(), setIsListening(false));
      return;
    }

    if (isCapacitor) {
      startCapacitorListening();
    } else if (WebSpeechAPI) {
      startWebListening();
    } else {
      setShowTextInput(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isThinking, isListening, startCapacitorListening, stopCapacitorListening, startWebListening]);

  const submitText = useCallback(() => {
    const msg = textInput.trim();
    if (!msg) return;
    setShowTextInput(false);
    setTextInput('');
    askAI(msg);
  }, [textInput, askAI]);

  const handleNziClick = () => {
    if (isListening) { handleMicPress(); return; }
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

  const micBg     = isListening ? '#ef4444' : isThinking ? '#365A08' : '#1B1D24';
  const micBorder = isListening ? '#ef4444' : isSpeaking  ? '#72EB3A' : isThinking ? '#5D9D0B' : '#365A08';

  return (
    <div
      className={`fixed bottom-24 right-4 z-50 flex flex-col items-end select-none ${className}`}
      style={{ pointerEvents: 'none' }}
    >
      {/* Text input fallback */}
      {showTextInput && (
        <div style={{ pointerEvents: 'auto', marginBottom: 8, display: 'flex', gap: 6 }}>
          <input
            ref={inputRef}
            type="text"
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') submitText();
              if (e.key === 'Escape') setShowTextInput(false);
            }}
            placeholder="Escreve a tua pergunta..."
            style={{
              width: 200, background: '#1B1D24', border: '1.5px solid #365A08',
              borderRadius: 12, color: '#fff', fontSize: 13, padding: '6px 10px', outline: 'none',
            }}
          />
          <button
            onClick={submitText}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: '#365A08', border: '2px solid #72EB3A',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <Send size={14} color="#72EB3A" />
          </button>
        </div>
      )}

      <div className="relative" style={{ pointerEvents: 'auto' }}>
        <NziDialog message={message} onDismiss={hideMessage} />
        <NziCharacter
          expression={isListening ? 'excited' : isThinking ? 'thinking' : isSpeaking ? 'waving' : expression}
          size={72}
          onClick={handleNziClick}
        />

        {/* Mic button */}
        <button
          onClick={handleMicPress}
          disabled={isThinking}
          style={{
            position: 'absolute', bottom: -4, left: -4,
            width: 32, height: 32, borderRadius: '50%',
            background: micBg, border: `2px solid ${micBorder}`,
            cursor: isThinking ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isListening ? '0 0 0 4px #ef444440' : isSpeaking ? '0 0 0 4px #72EB3A30' : '0 2px 8px #00000060',
            transition: 'all 0.2s',
            animation: isListening ? 'nzi-pulse 1s ease-in-out infinite' : isSpeaking ? 'nzi-speak 1.2s ease-in-out infinite' : 'none',
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
        @keyframes nzi-speak {
          0%, 100% { box-shadow: 0 0 0 4px #72EB3A30; }
          50%       { box-shadow: 0 0 0 8px #72EB3A15; }
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
