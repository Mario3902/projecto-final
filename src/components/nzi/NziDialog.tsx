import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface NziDialogProps {
  message: string | null;
  onDismiss?: () => void;
}

const NziDialog: React.FC<NziDialogProps> = ({ message, onDismiss }) => {
  const [displayed, setDisplayed] = useState('');
  const [visible, setVisible] = useState(false);

  // Typewriter effect
  useEffect(() => {
    if (!message) {
      setVisible(false);
      setDisplayed('');
      return;
    }
    setVisible(true);
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < message.length) {
        setDisplayed(message.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [message]);

  if (!visible || !message) return null;

  return (
    <div
      className="nzi-dialog absolute bottom-full mb-3 right-0 max-w-[220px] min-w-[140px] animate-fade-in"
      style={{ zIndex: 100 }}
    >
      {/* Bubble */}
      <div className="bg-white text-[#0e1710] rounded-2xl rounded-br-sm px-4 py-3 shadow-xl relative">
        <p className="text-[13px] font-semibold leading-snug">{displayed}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute -top-2 -right-2 w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        )}
      </div>
      {/* Tail pointing down-right toward character */}
      <div
        className="absolute bottom-0 right-5 w-0 h-0"
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '0px solid transparent',
          borderTop: '10px solid white',
          transform: 'translateY(100%)',
        }}
      />
    </div>
  );
};

export default NziDialog;
