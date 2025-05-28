'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useRef } from 'react';

interface CubeHotspotEditorProps {
    imagePaths: string[];
    onAddHotspot: (position: [number, number, number]) => void;
    enabled: boolean;
}

function ClickHandler({ onAddHotspot, enabled }: { onAddHotspot: (p: [number, number, number]) => void; enabled: boolean }) {
    const { camera, gl, scene } = useThree();

    const handleClick = (event: MouseEvent) => {
        const rect = gl.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(x, y);
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(scene, true);
        if (intersects.length > 0) {
            const point = intersects[0].point;
            onAddHotspot([point.x, point.y, point.z]);
        }
    };

    return (
        <primitive
            object={new THREE.Group()}
            attach="object"
            onPointerDown={(e: any) => handleClick(e.nativeEvent)}
        />
    );
}

export default function Hotspot({ imagePaths, onAddHotspot, enabled }: CubeHotspotEditorProps) {
    const textures = imagePaths.map((path) => new THREE.TextureLoader().load(path));

    return (
        <div className="w-full h-[400px] border rounded">
            <Canvas camera={{ fov: 60, position: [0, 0, 3] }}>
                <ambientLight />
                <OrbitControls enablePan={false} enableZoom={false} />
                <mesh scale={[-1, 1, 1]}>
                    <boxGeometry args={[10, 10, 10]} />
                    {textures.map((texture, i) => (
                        <meshBasicMaterial key={i} attach={`material-${i}`} map={texture} side={THREE.BackSide} />
                    ))}
                </mesh>
                <ClickHandler onAddHotspot={onAddHotspot} enabled={enabled} />
            </Canvas>
        </div>
    );
}
