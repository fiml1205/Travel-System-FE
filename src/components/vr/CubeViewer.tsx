'use client';

import { Canvas } from '@react-three/fiber';
import { ReactNode } from 'react';

interface CubeViewerProps {
  children: ReactNode;
  overlay?: ReactNode;
}

export default function CubeViewer({ children, overlay }: CubeViewerProps) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <Canvas
        camera={{ fov: 60, position: [0, 0, 3] }}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
      >
        {children}
      </Canvas>
      <div
        id="hotspot-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      {overlay && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            zIndex: 2,
            pointerEvents: 'auto',
          }}
        >
          {overlay}
        </div>
      )}
    </div>

  );
}
