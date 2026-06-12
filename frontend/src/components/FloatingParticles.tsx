import { useMemo } from 'react'

/**
 * Deterministic pseudo-random [0, 1) from an integer seed.
 * Same seed → same value every render, no re-randomisation on re-renders.
 */
function rand(seed: number): number {
  const x = Math.sin(seed * 9_301 + 49_297) * 233_280
  return x - Math.floor(x)
}

interface Particle {
  id: number
  size: number
  left: number
  duration: number
  delay: number
  opacity: number
  blur: number
  hue: number
}

export function FloatingParticles({ count = 26 }: { count?: number }) {
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: count }, (_, i) => {
      const r = (o: number) => rand(i * 13 + o)
      const size = 8 + r(1) * 22
      return {
        id:       i,
        size,
        left:     2  + r(2) * 93,
        duration: 16 + r(3) * 22,
        delay:    i < 6 ? r(4) * 4 : r(4) * 18,
        opacity:  0.18 + r(5) * 0.22,
        blur:     size * 0.32,
        hue:      235 + r(6) * 20,
      }
    }),
  [count])

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full air-particle"
          style={{
            width:           p.size,
            height:          p.size,
            left:            `${p.left}%`,
            bottom:          '-30px',
            opacity:         p.opacity,
            background:      `oklch(0.68 0.16 ${p.hue})`,
            filter:          `blur(${p.blur}px)`,
            animation:       `airFloat ${p.duration}s ${p.delay}s infinite ease-in-out`,
            willChange:      'transform, opacity',
          }}
        />
      ))}
    </div>
  )
}
