type Props = { name: string };

const GRADIENTS: readonly [string, string][] = [
  ["#d97a3d", "#5a2e0e"], // amber
  ["#3d8fd9", "#0e2f5a"], // azure
  ["#7d3dd9", "#2e0e5a"], // violet
  ["#d93d76", "#5a0e2e"], // rose
  ["#3dd9a3", "#0e5a3e"], // mint
  ["#d9c43d", "#5a4a0e"], // gold
];

function hashIndex(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h % GRADIENTS.length;
}

export function ProductPlaceholder({ name }: Props) {
  const [from, to] = GRADIENTS[hashIndex(name)];
  const letter = (name[0] ?? "?").toUpperCase();
  return (
    <div
      className="product-placeholder"
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
      aria-hidden
    >
      <span className="product-placeholder-letter">{letter}</span>
    </div>
  );
}
