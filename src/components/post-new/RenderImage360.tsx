'use client';

import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface SimpleCubeViewerProps {
  imagePaths: string[];
}

export default function RenderImage360({ imagePaths }: SimpleCubeViewerProps) {
  const textures = imagePaths.map((path) => useLoader(THREE.TextureLoader, path));

  return (
    <div className="w-full h-[400px] border rounded">
      <Canvas camera={{ fov: 60, position: [0, 0, 3] }}>
        <ambientLight />
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={true} />
        <mesh scale={[-1, 1, 1]}>
          <boxGeometry args={[10, 10, 10]} />
          {textures.map((texture, i) => (
            <meshBasicMaterial
              key={i}
              attach={`material-${i}`}
              map={texture}
              side={THREE.BackSide}
            />
          ))}
        </mesh>
      </Canvas>
    </div>
  );
}
