interface SceneFrameProps {
  images: string[];
  priority?: boolean;
}

/** Still photographs with a slow crossfade and a gentle drift. */
export function SceneFrame({ images, priority = false }: SceneFrameProps) {
  const cross = images.length > 1;
  return (
    <div className={`scene-stack${cross ? ' scene-stack--cross' : ''}`}>
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          className={index === 0 ? 'scene-photo' : 'scene-photo scene-photo--alt'}
          decoding="async"
          fetchPriority={priority && index === 0 ? 'high' : 'auto'}
          loading={priority && index === 0 ? 'eager' : 'lazy'}
        />
      ))}
    </div>
  );
}
