import { useRef } from 'react';

/** Project diorama: mentoring room and a glass of trà đá, turning in 3D. */
export function Diorama() {
  const world = useRef<HTMLDivElement>(null);

  const tilt = (clientX: number, clientY: number, current: HTMLDivElement) => {
    const box = current.getBoundingClientRect();
    const x = (clientX - box.left) / box.width - 0.5;
    const y = (clientY - box.top) / box.height - 0.5;
    world.current?.style.setProperty('--tilt-y', `${(x * 16).toFixed(2)}deg`);
    world.current?.style.setProperty('--tilt-x', `${(-y * 10).toFixed(2)}deg`);
  };

  return (
    <div
      className="diorama"
      onPointerMove={(event) => tilt(event.clientX, event.clientY, event.currentTarget)}
      onPointerLeave={() => {
        world.current?.style.setProperty('--tilt-x', '4deg');
        world.current?.style.setProperty('--tilt-y', '-8deg');
      }}
    >
      <div className="diorama__world" ref={world}>
        <div className="diorama__spin">
          <img className="diorama__back" src="/media/circle-3d.jpg" alt="" draggable={false} />
          <img className="diorama__front" src="/media/glass-3d.jpg" alt="" draggable={false} />
        </div>
      </div>
    </div>
  );
}
