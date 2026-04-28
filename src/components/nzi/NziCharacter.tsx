import React from 'react';
import { NziExpression } from '@/context/NziContext';

interface NziSVGProps {
  expression: NziExpression;
  size?: number;
}

const NziSVG: React.FC<NziSVGProps> = ({ expression, size = 90 }) => {
  const isCelebrate = expression === 'celebrate';
  const isSad = expression === 'sad';
  const isThinking = expression === 'thinking';
  const isSleep = expression === 'sleep';
  const isDetermined = expression === 'determined';
  const isHint = expression === 'hint';
  const isExcited = expression === 'excited';
  const isWaving = expression === 'waving';

  return (
    <svg
      width={size}
      height={size * 1.22}
      viewBox="0 0 90 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body - green uniform */}
      <path d="M22 80 Q45 92 68 80 L65 102 Q45 110 25 102 Z" fill="#16a34a" />
      <ellipse cx="45" cy="102" rx="22" ry="8" fill="#0d1f14" />

      {/* Shirt collar */}
      <path d="M38 72 L45 80 L52 72" stroke="white" strokeWidth="1.5" fill="none" />

      {/* Arms — waving raises right arm */}
      <ellipse cx="16" cy="84" rx="5.5" ry="11" fill="#16a34a" transform="rotate(-18 16 84)" />
      {isWaving ? (
        <ellipse cx="76" cy="62" rx="5.5" ry="11" fill="#16a34a" transform="rotate(-60 76 62)" />
      ) : (
        <ellipse cx="74" cy="84" rx="5.5" ry="11" fill="#16a34a" transform="rotate(18 74 84)" />
      )}

      {/* Hands */}
      <circle cx="11" cy="94" r="5" fill="#7A5230" />
      {isWaving ? (
        <circle cx="82" cy="54" r="5" fill="#7A5230" />
      ) : (
        <circle cx="79" cy="94" r="5" fill="#7A5230" />
      )}

      {/* Neck */}
      <rect x="37" y="62" width="16" height="11" rx="5" fill="#7A5230" />

      {/* Head */}
      <circle cx="45" cy="40" r="32" fill="#7A5230" />

      {/* Afro hair */}
      <ellipse cx="45" cy="12" rx="30" ry="12" fill="#1a0800" />
      <ellipse cx="20" cy="24" rx="12" ry="14" fill="#1a0800" />
      <ellipse cx="70" cy="24" rx="12" ry="14" fill="#1a0800" />
      <ellipse cx="45" cy="18" rx="26" ry="10" fill="#1a0800" />

      {/* Ears */}
      <ellipse cx="14" cy="40" rx="6" ry="8" fill="#7A5230" />
      <ellipse cx="76" cy="40" rx="6" ry="8" fill="#7A5230" />
      <ellipse cx="14" cy="40" rx="3.5" ry="5" fill="#6B4420" />
      <ellipse cx="76" cy="40" rx="3.5" ry="5" fill="#6B4420" />

      {/* Eyes */}
      {isWaving && <text x="66" y="14" fontSize="14">👋</text>}
      {isExcited && (
        <>
          <text x="2" y="18" fontSize="14">⭐</text>
          <text x="68" y="14" fontSize="12">💥</text>
        </>
      )}
      {isSleep ? (
        <>
          <path d="M29 40 Q36 36 43 40" stroke="#1a0800" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M47 40 Q54 36 61 40" stroke="#1a0800" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (isCelebrate || isExcited) ? (
        <>
          <path d="M29 40 Q36 47 43 40" stroke="#1a0800" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M47 40 Q54 47 61 40" stroke="#1a0800" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="36" cy="40" r="6" fill="#1a0800" />
          <circle cx="54" cy="40" r="6" fill="#1a0800" />
          <circle cx="38" cy={isThinking ? 37 : 38} r="2" fill="white" />
          <circle cx="56" cy={isThinking ? 37 : 38} r="2" fill="white" />
        </>
      )}

      {/* Eyebrows */}
      {isDetermined && (
        <>
          <path d="M27 29 Q36 24 45 29" stroke="#1a0800" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M45 29 Q54 24 63 29" stroke="#1a0800" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {isSad && (
        <>
          <path d="M27 30 Q36 35 45 30" stroke="#1a0800" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M45 30 Q54 35 63 30" stroke="#1a0800" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {(expression === 'idle' || isHint || isThinking || isWaving) && (
        <>
          <path d="M27 29 Q36 26 45 29" stroke="#1a0800" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M45 29 Q54 26 63 29" stroke="#1a0800" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* Mouth */}
      {isCelebrate && (
        <path d="M30 56 Q45 67 60 56" stroke="#1a0800" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {isSad && (
        <path d="M30 61 Q45 54 60 61" stroke="#1a0800" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {(isThinking || isSleep) && (
        <path d="M37 59 L53 57" stroke="#1a0800" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      {(expression === 'idle' || isHint || isDetermined || isWaving || isExcited) && (
        <path d="M32 58 Q45 64 58 58" stroke="#1a0800" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}

      {/* Expression extras */}
      {isCelebrate && (
        <>
          <text x="2" y="18" fontSize="16">🌟</text>
          <text x="65" y="20" fontSize="12">✨</text>
        </>
      )}
      {isHint && <text x="62" y="16" fontSize="16">💡</text>}
      {isSleep && (
        <>
          <text x="60" y="26" fontSize="11" fill="#94a3b8" fontWeight="bold">z</text>
          <text x="66" y="19" fontSize="9" fill="#94a3b8" fontWeight="bold">z</text>
          <text x="70" y="14" fontSize="7" fill="#94a3b8" fontWeight="bold">z</text>
        </>
      )}
      {isThinking && <text x="62" y="18" fontSize="14">🤔</text>}

      {/* Nzila badge on shirt */}
      <circle cx="45" cy="88" r="5.5" fill="#0d1f14" stroke="#4ade80" strokeWidth="1" />
      <text x="42" y="92" fontSize="7" fill="#4ade80" fontWeight="bold">N</text>
    </svg>
  );
};

// Animation class based on expression
const getAnimClass = (expression: NziExpression) => {
  switch (expression) {
    case 'celebrate': return 'nzi-bounce';
    case 'excited':   return 'nzi-excited';
    case 'sad':       return 'nzi-shake';
    case 'thinking':  return 'nzi-wobble';
    case 'sleep':     return 'nzi-float';
    case 'waving':    return 'nzi-wave';
    default:          return 'nzi-float';
  }
};

interface NziCharacterProps {
  expression: NziExpression;
  size?: number;
  onClick?: () => void;
  className?: string;
}

const NziCharacter: React.FC<NziCharacterProps> = ({ expression, size = 90, onClick, className = '' }) => {
  return (
    <div
      className={`nzi-character ${getAnimClass(expression)} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', display: 'inline-block' }}
    >
      <NziSVG expression={expression} size={size} />
    </div>
  );
};

export default NziCharacter;
