import { useMemo } from 'react';

export default function Starfield() {
  const stars = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? 'var(--comet-violet)' : 'var(--aurora-teal)',
      opacity: Math.random() * 0.15 + 0.05,
      duration: `${Math.random() * 4 + 3}s`,
      delay: `${Math.random() * 5}s`,
    }));
  }, []);

  return (
    <div className="starfield">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            opacity: star.opacity,
            '--duration': star.duration,
            '--delay': star.delay,
          }}
        />
      ))}
    </div>
  );
}
