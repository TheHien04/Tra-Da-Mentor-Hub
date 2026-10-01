import { SceneFrame } from './SceneFrame';

interface PageSceneProps {
  images: string[];
  caption: string;
}

export function PageScene({ images, caption }: PageSceneProps) {
  return (
    <figure className="page-scene" data-reveal>
      <div className="page-scene__media" data-parallax>
        <SceneFrame images={images} />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
