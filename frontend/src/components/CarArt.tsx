import type { Vehicle } from '../types';

const PALETTES = [
  ['#1f5c47', '#dcebe3'], ['#c4562b', '#fae6dc'], ['#2f4b7c', '#dfe7f5'],
  ['#7a5c2e', '#f1e6d0'], ['#4a3f6b', '#e6e1f2'], ['#8a2f3d', '#f5dfe2'],
];

/** Stable pick so the same make always gets the same colour. */
function paletteFor(make: string) {
  const hash = [...make].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  return PALETTES[hash % PALETTES.length];
}

type Shape = 'sedan' | 'suv' | 'truck';
const shapeFor = (category: string): Shape => {
  const c = category.toLowerCase();
  if (c.includes('suv') || c.includes('crossover') || c.includes('van')) return 'suv';
  if (c.includes('truck') || c.includes('pickup')) return 'truck';
  return 'sedan';
};

const BODIES: Record<Shape, string> = {
  sedan: 'M30 98 L40 80 Q46 72 62 68 L96 52 Q108 46 128 46 L168 46 Q184 48 194 60 L214 70 Q236 72 244 84 L250 98 Z',
  suv: 'M30 98 L36 74 Q40 62 56 58 L84 46 Q96 40 114 40 L192 40 Q208 42 216 56 L236 62 Q250 66 252 84 L252 98 Z',
  truck: 'M30 98 L34 72 L60 66 L88 48 Q96 42 112 42 L146 42 L150 70 L252 70 L254 98 Z',
};

/** Decorative side-view illustration; keeps the grid lively without needing photo assets. */
export function CarArt({ vehicle }: { vehicle: Pick<Vehicle, 'make' | 'category'> }) {
  const [body, tint] = paletteFor(vehicle.make);
  const shape = shapeFor(vehicle.category);
  return (
    <svg viewBox="0 0 280 130" role="img" aria-label={`${vehicle.make} illustration`} className="h-full w-full" style={{ background: tint }}>
      <ellipse cx="140" cy="112" rx="108" ry="6" fill="#14201b" opacity=".12" />
      <path d={BODIES[shape]} fill={body} />
      <path d={shape === 'truck' ? 'M92 52 L108 46 L142 46 L144 68 L82 68 Z' : 'M100 56 L112 49 L190 49 Q198 50 204 60 L208 68 L90 68 Z'} fill={tint} opacity=".85" />
      {[84, 208].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="98" r="17" fill="#14201b" />
          <circle cx={cx} cy="98" r="8" fill="#e4dfd2" />
        </g>
      ))}
    </svg>
  );
}
