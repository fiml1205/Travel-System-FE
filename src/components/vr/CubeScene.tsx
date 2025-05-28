// CubeScene.tsx
'use client';

import { OrbitControls } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Hotspot {
  position: [number, number, number];
  imageUrl: string;
  targetSceneId: string;
  label?: string;
}

interface CubeSceneProps {
  textures: THREE.Texture[];
  hotspots?: Hotspot[];
  onRequestTransition?: (nextSceneId: string) => void;
  onPreloadScene?: (nextSceneId: string) => void;
}

export default function CubeScene({ textures, hotspots = [], onRequestTransition, onPreloadScene }: CubeSceneProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const [animating, setAnimating] = useState(false);
  const animationRef = useRef<{
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    startTime: number;
    duration: number;
    nextSceneId: string;
  } | null>(null);

  const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

  useFrame(() => {
    if (controlsRef.current) controlsRef.current.update();

    const anim = animationRef.current;
    if (anim) {
      const now = performance.now();
      const elapsed = now - anim.startTime;
      const t = Math.min(elapsed / anim.duration, 1);
      const eased = easeInOut(t);

      const pos = anim.fromPos.clone().lerp(anim.toPos, eased);
      const tgt = anim.fromTarget.clone().lerp(anim.toTarget, eased);

      camera.position.copy(pos);
      controlsRef.current.target.copy(tgt);
      controlsRef.current.update();

      if (t >= 1) {
        animationRef.current = null;
        setAnimating(false);

        // remove clicked class from all hotspots
        document.querySelectorAll('.hotspot.clicked').forEach((el) => {
          el.classList.remove('clicked');
        });

        requestAnimationFrame(() => {
          camera.position.set(0, 0, 4.9);
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
          onRequestTransition?.(anim.nextSceneId);
        });
      }
    }

    updateHotspotPositions(hotspots, camera);
  });

  useEffect(() => {
    const container = document.getElementById('hotspot-overlay');
    if (!container) return;

    Array.from(container.children).forEach((child) => {
      if (child instanceof HTMLElement && child.id.startsWith('hotspot-')) {
        container.removeChild(child);
      }
    });

    renderHotspotsDOM(hotspots, camera);
  }, [hotspots]);

  function updateHotspotPositions(hotspots: Hotspot[], camera: THREE.Camera) {
    const container = document.getElementById('hotspot-overlay');
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;

    hotspots.forEach((hotspot) => {
      const id = `hotspot-${hotspot.targetSceneId}`;
      const wrapper = document.getElementById(id) as HTMLDivElement | null;
      if (!wrapper) return;

      const worldPosition = new THREE.Vector3(...hotspot.position);
      const viewPosition = worldPosition.clone().applyMatrix4(camera.matrixWorldInverse);
      const projected = worldPosition.clone().project(camera);

      if (viewPosition.z > -0.1) {
        wrapper.style.display = 'none';
      } else {
        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;
        wrapper.style.left = `${x}px`;
        wrapper.style.top = `${y}px`;
        wrapper.style.display = 'flex';
      }
    });
  }

  function renderHotspotsDOM(hotspots: Hotspot[], camera: THREE.Camera) {
    const container = document.getElementById('hotspot-overlay');
    if (!container) return;

    hotspots.forEach((hotspot) => {
      const id = `hotspot-${hotspot.targetSceneId}`;
      let wrapper = document.getElementById(id) as HTMLDivElement | null;

      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id = id;
        wrapper.className = 'hotspot';
        wrapper.style.position = 'absolute';
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';
        wrapper.style.pointerEvents = 'none';

        const img = document.createElement('img');
        img.src = hotspot.imageUrl;
        img.style.width = '50px';
        img.style.height = '50px';
        img.style.borderRadius = '50%';
        img.style.pointerEvents = 'auto';
        img.style.cursor = 'pointer';

        img.addEventListener('mouseenter', () => {
          wrapper!.classList.add('hover');
        });
        img.addEventListener('mouseleave', () => {
          wrapper!.classList.remove('hover');
        });
        img.addEventListener('click', (ev) => {
          ev.stopPropagation();
          if (animating) return;
          wrapper!.classList.remove('hover');
          wrapper!.classList.add('clicked');

          const target = new THREE.Vector3(...hotspot.position);
          const toPos = target.clone().normalize().multiplyScalar(1.5);

          onPreloadScene?.(hotspot.targetSceneId);

          animationRef.current = {
            fromPos: camera.position.clone(),
            toPos,
            fromTarget: controlsRef.current.target.clone(),
            toTarget: target.clone(),
            startTime: performance.now(),
            duration: 1500,
            nextSceneId: hotspot.targetSceneId,
          };
          setAnimating(true);
        });

        wrapper.appendChild(img);

        if (hotspot.label) {
          const label = document.createElement('div');
          label.textContent = hotspot.label;
          label.style.marginBottom = '6px';
          label.style.color = '#fff';
          label.style.fontSize = '12px';
          label.style.fontWeight = 'bold';
          label.style.textShadow = '0 0 3px rgba(0,0,0,0.8)';
          label.style.pointerEvents = 'none';
          wrapper.appendChild(label);
        }

        container.appendChild(wrapper);
      }
    });
  }

  return (
    <>
      <ambientLight intensity={1} />
      <OrbitControls
        ref={controlsRef}
        enableZoom={!animating}
        enablePan={false}
        enableRotate={!animating}
        minDistance={1}
        maxDistance={5}
        zoomSpeed={1}
      />

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
    </>
  );
}
