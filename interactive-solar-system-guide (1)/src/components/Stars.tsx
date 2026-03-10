import { useMemo, useEffect, useState } from "react";

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  delay: number;
}

export default function Stars() {
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [counter, setCounter] = useState(0);

  const stars = useMemo(() => {
    return Array.from({ length: 400 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      animDelay: Math.random() * 5,
      animDuration: Math.random() * 3 + 2,
      isBright: Math.random() < 0.08,
      color: Math.random() < 0.1 ? "#aaccff" : Math.random() < 0.05 ? "#ffddaa" : "#ffffff",
    }));
  }, []);

  const nebulas = useMemo(() => [
    { x: 15, y: 20, w: 300, h: 200, color: "rgba(100, 50, 180, 0.12)", delay: 0 },
    { x: 70, y: 60, w: 350, h: 250, color: "rgba(30, 80, 180, 0.1)", delay: 8 },
    { x: 40, y: 75, w: 280, h: 180, color: "rgba(180, 50, 100, 0.08)", delay: 16 },
    { x: 80, y: 15, w: 250, h: 200, color: "rgba(50, 150, 120, 0.07)", delay: 12 },
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.4) {
        const newStar: ShootingStar = {
          id: counter,
          x: Math.random() * 80,
          y: Math.random() * 40,
          delay: 0,
        };
        setShootingStars(prev => [...prev.slice(-3), newStar]);
        setCounter(c => c + 1);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [counter]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Nebulas */}
      {nebulas.map((n, i) => (
        <div
          key={`nebula-${i}`}
          className="nebula absolute rounded-full"
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            width: `${n.w}px`,
            height: `${n.h}px`,
            background: `radial-gradient(ellipse, ${n.color}, transparent 70%)`,
            animationDelay: `${n.delay}s`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute rounded-full ${star.isBright ? "animate-twinkle" : "animate-pulse"}`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.animDelay}s`,
            animationDuration: `${star.animDuration}s`,
            backgroundColor: star.color,
            boxShadow: star.isBright ? `0 0 ${star.size * 3}px ${star.color}` : "none",
          }}
        />
      ))}

      {/* Shooting stars */}
      {shootingStars.map((s) => (
        <div
          key={s.id}
          className="shooting-star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
          }}
        />
      ))}
    </div>
  );
}
