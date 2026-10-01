import { useRef } from 'react';

interface StudioObjectProps {
  src: string;
  priority?: boolean;
}

/** A 3D product still that floats and tilts with the pointer. */
export function StudioObject({ src, priority = false }: StudioObjectProps) {
  const rig = useRef<HTMLDivElement>(null);

  const tilt = (clientX: number, clientY: number, current: HTMLDivElement) => {
    const box = current.getBoundingClientRect();
    const x = (clientX - box.left) / box.width - 0.5;
    const y = (clientY - box.top) / box.height - 0.5;
    rig.current?.style.setProperty('--tilt-y', `${(x * 18).toFixed(2)}deg`);
    rig.current?.style.setProperty('--tilt-x', `${(-y * 14).toFixed(2)}deg`);
  };

  return (
    <div
      className="studio-object"
      onPointerMove={(event) => tilt(event.clientX, event.clientY, event.currentTarget)}
      onPointerLeave={() => {
        rig.current?.style.setProperty('--tilt-x', '6deg');
        rig.current?.style.setProperty('--tilt-y', '-10deg');
      }}
    >
      <div className="studio-object__float">
        <div className="studio-object__rig" ref={rig}>
          <img
            src={src}
            alt=""
            draggable={false}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            loading={priority ? 'eager' : 'lazy'}
          />
        </div>
      </div>
    </div>
  );
}
