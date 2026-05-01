interface Point {
  value: number;
  date: string;
}

interface Props {
  data: Point[];
  width?: number;
  height?: number;
  color?: string;
}

export default function Sparkline({ data, width = 120, height = 36, color = '#60a5fa' }: Props) {
  if (data.length < 2) {
    return <span className="text-xs text-gray-500">Not enough data</span>;
  }

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * w;
    const y = pad + h - ((d.value - min) / range) * h;
    return `${x},${y}`;
  });

  const polyline = points.join(' ');
  const last = data.at(-1)!;
  const first = data[0];
  const trend = last.value >= first.value ? '#34d399' : '#f87171';
  const lineColor = data.length > 1 ? trend : color;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={polyline}
        fill="none"
        stroke={lineColor}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={points.at(-1)!.split(',')[0]}
        cy={points.at(-1)!.split(',')[1]}
        r="2"
        fill={lineColor}
      />
    </svg>
  );
}
