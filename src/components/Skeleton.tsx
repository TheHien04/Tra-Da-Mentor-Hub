interface SkeletonProps {
  count?: number;
  height?: number;
  width?: string;
  circle?: boolean;
}

export default function Skeleton({
  count = 1,
  height = 20,
  width = '100%',
  circle = false,
}: SkeletonProps) {
  return (
    <div>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`skeleton-line ${circle ? 'skeleton-line--circle' : ''}`}
          style={{
            width: circle ? height : width,
            height: `${height}px`,
            marginBottom: count > 1 && i < count - 1 ? '12px' : '0',
          }}
        />
      ))}
    </div>
  );
}
