'use client';

import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';

interface Hotspot {
  position: [number, number, number];
  label: string;
  targetSceneId: string;
}

interface Scene {
  id: string;
  name?: string;
  original: string;
  cubePaths: string[];
  hotspots: Hotspot[];
  audio?: string;
  isFirst?: boolean;
}

interface BlockImage360Props {
  projectId: any;
  onScenesChange?: (scenes: Scene[]) => void;
  initialScenes?: Scene[];
}

function ClickHandler({ onAdd, enabled }: { onAdd: (pos: [number, number, number]) => void; enabled: boolean }) {
  const { camera, gl, scene } = useThree();

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const intersects = raycaster.intersectObject(scene, true);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        console.log('📍 Vị trí hotspot:', point);
        onAdd([point.x, point.y, point.z]);
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => {
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [enabled, camera, gl, scene]);

  return null;
}

function HotspotMarker({ position, label }: { position: [number, number, number]; label: string }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshBasicMaterial color="red" />
      </mesh>
      {label && (
        <Html position={[0, -0.6, 0]} center distanceFactor={1.5} zIndexRange={[10, 0]}>
          <div className="bg-black bg-opacity-70 text-white px-4 py-1 rounded text-8xl font-semibold whitespace-nowrap">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function BlockImage360({ projectId, onScenesChange, initialScenes = [] }: BlockImage360Props) {
  const [showTargetList, setShowTargetList] = useState<number | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialScenes && initialScenes.length > 0) {
      setScenes(initialScenes);
      setCurrentSceneIndex(0);
    }
  }, [initialScenes]);

  useEffect(() => {
    if (onScenesChange) onScenesChange(scenes);
  }, [scenes, onScenesChange]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('projectId', projectId);

    setLoading(true);
    const res = await fetch('/api/demo-image360', {
      method: 'POST',
      body: formData,
    });
    setLoading(false);

    if (res.ok) {
      const data = await res.json();
      const newScene: Scene = {
        id: data.sceneId,
        original: data.original,
        cubePaths: data.paths,
        hotspots: [],
      };
      setScenes((prev) => [...prev, newScene]);
      setCurrentSceneIndex(scenes.length);
    }
  };

  const handleAddHotspot = (pos: [number, number, number]) => {
    if (currentSceneIndex === null) return;
    const updatedScenes = [...scenes];
    updatedScenes[currentSceneIndex].hotspots.push({ position: pos, label: '', targetSceneId: '' });
    setScenes(updatedScenes);
    setAdding(false);
  };

  const updateHotspot = (index: number, field: 'label' | 'targetSceneId', value: string) => {
    if (currentSceneIndex === null) return;
    const updatedScenes = [...scenes];
    updatedScenes[currentSceneIndex].hotspots[index][field] = value;
    setScenes(updatedScenes);
  };

  const deleteScene = async (index: number) => {
    const sceneToDelete = scenes[index];

    try {
      await fetch('/api/delete-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, sceneId: sceneToDelete.id }),
      });
    } catch (err) {
      console.warn('❌ Không thể xoá folder ảnh:', err);
    }

    const updatedScenes = scenes
      .map((scene) => ({
        ...scene,
        hotspots: scene.hotspots.map((hs) =>
          hs.targetSceneId === sceneToDelete.id ? { ...hs, targetSceneId: '' } : hs
        ),
      }))
      .filter((_, i) => i !== index); ((_: any, i: any) => i !== index);
    setScenes(updatedScenes);
    if (updatedScenes.length === 0) {
      setCurrentSceneIndex(null);
    } else if (currentSceneIndex === index) {
      setCurrentSceneIndex(0);
    } else if (currentSceneIndex !== null && currentSceneIndex > index) {
      setCurrentSceneIndex(currentSceneIndex - 1);
    }
  };

  const deleteHotspot = (index: number) => {
    if (currentSceneIndex === null) return;
    const updatedScenes = [...scenes];
    updatedScenes[currentSceneIndex].hotspots.splice(index, 1);
    setScenes(updatedScenes);
  };

  const setFirstScene = (index: number) => {
    const updated = scenes.map((scene, i) => ({
      ...scene,
      isFirst: i === index,
    }));
    setScenes(updated);
  };

  const currentScene = currentSceneIndex !== null ? scenes[currentSceneIndex] : null;

  return (
    <div className="space-y-4">
      <input type="file" accept="image/*" className='border-solid border border-gray-400 rounded-sm pl-1.5' onChange={handleUpload} />
      {loading && <p className="text-blue-600 mt-2">Đang xử lý ảnh...</p>}
      {scenes.length > 0 && (
        <div className="flex gap-2 overflow-x-auto border p-2 rounded">
          {scenes.map((scene, idx) => (
            <div key={scene.id} className="w-32">
              <div className='relative'>
                <img
                  src={scene.original}
                  onClick={() => setCurrentSceneIndex(idx)}
                  className={`w-32 h-20 object-cover cursor-pointer rounded ${currentSceneIndex === idx ? 'border-blue-600 border-3' : 'border-transparent'
                    }`}
                />
                <button
                  onClick={() => {
                    if (window.confirm('Bạn có chắc muốn xoá ảnh này và toàn bộ hotspot?')) {
                      deleteScene(idx);
                    }
                  }}
                  className="absolute top-0 right-0 bg-red-600 text-white rounded px-1"
                >
                  ✕
                </button>

              </div>
              <div className='flex flex-col'>

                <input
                  className="text-xs mt-1 p-1 border rounded"
                  placeholder="Tên ảnh"
                  value={scene.name ?? ''}
                  onChange={(e) => {
                    const updated = [...scenes];
                    updated[idx].name = e.target.value;
                    setScenes(updated);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
                <button
                  onClick={() => setFirstScene(idx)}
                  className={`text-xs mt-1 px-2 py-0.5 rounded ${currentSceneIndex === idx && scenes[idx].isFirst
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200'
                    }`}
                >
                  {scenes[idx].isFirst ? 'Ảnh đầu tiên' : 'Chọn làm đầu tiên'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* render image */}
      {currentScene && (
        <div className="relative border rounded h-[600px] w-80vw">
          <Canvas camera={{ fov: 60, position: [0, 0, 3] }}>
            <ambientLight />
            <OrbitControls enablePan={false} enableZoom={false} enableRotate={true} makeDefault />
            <mesh scale={[-1, 1, 1]}>
              <boxGeometry args={[10, 10, 10]} />
              {currentScene.cubePaths.map((path, i) => (
                <meshBasicMaterial
                  key={i}
                  attach={`material-${i}`}
                  map={new THREE.TextureLoader().load(path)}
                  side={THREE.BackSide}
                />
              ))}
            </mesh>
            {currentScene.hotspots.map((hs, idx) => (
              <HotspotMarker key={idx} position={hs.position} label={hs.label} />
            ))}
            <ClickHandler onAdd={handleAddHotspot} enabled={adding} />
          </Canvas>
          <button
            onClick={() => setAdding(true)}
            className="absolute bottom-2 left-2 px-3 py-1 bg-blue-600 text-white rounded"
          >
            {adding ? 'Chọn điểm...' : '➕ Thêm Hotspot'}
          </button>
        </div>
      )}

      {/* render audio */}
      {currentScene && (
        <div className="mt-4">
          <label className="font-semibold">🎵 Audio cho ảnh:</label>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || currentSceneIndex === null) return;
              const formData = new FormData();
              formData.append('audio', file);
              formData.append('projectId', projectId);
              formData.append('sceneId', scenes[currentSceneIndex].id);
              const res = await fetch('/api/upload-audio', { method: 'POST', body: formData });
              const data = await res.json();
              const updated = [...scenes];
              updated[currentSceneIndex].audio = data.audio;
              setScenes(updated);
              if (audioInputRef.current) {
                audioInputRef.current.value = '';
              }
            }}
            className="block mt-1"
          />
          {currentScene.audio && (
            <>
              <audio
                controls
                src={`${currentScene.audio}?v=${Date.now()}`}
                className="mt-2 w-full" />
              <button
                onClick={async () => {
                  if (!window.confirm('Bạn có chắc muốn xoá file audio này?')) return;
                  await fetch('/api/delete-audio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ projectId, sceneId: currentScene.id }),
                  });
                  const updated = [...scenes];
                  updated[currentSceneIndex].audio = undefined;
                  setScenes(updated);
                }}
                className="mt-2 text-red-600 hover:underline text-sm"
              >
                🗑️ Xoá audio
              </button>
            </>
          )}
        </div>
      )}

      {/* render hotspot detail */}
      {currentScene && (
        <div className="w-[300px] border rounded p-3 space-y-4">
          <h3 className="font-bold mb-2">🧩 Danh sách Hotspot</h3>
          {currentScene.hotspots.map((hs, idx) => (
            <div key={idx} className="border p-2 rounded space-y-1">
              <div className="text-xs text-gray-500">
                📍 [{hs.position.map((v) => v.toFixed(2)).join(', ')}]
              </div>
              <input
                placeholder="Label"
                value={hs.label}
                onChange={(e) => updateHotspot(idx, 'label', e.target.value)}
                className="w-full border p-1"
              />
              <input
                placeholder="Target Scene ID"
                value={hs.targetSceneId}
                readOnly
                onClick={() => setShowTargetList(idx)}
                className="w-full border p-1 cursor-pointer bg-white"
              />
              {showTargetList === idx && (
                <div className="flex gap-2 mt-1 overflow-x-auto">
                  {scenes.filter((_, sidx) => sidx !== currentSceneIndex).map((s, sidx) => (
                    <img
                      key={s.id}
                      src={s.original}
                      className={`w-16 h-12 object-cover cursor-pointer rounded hover:border-blue-500 ${hs.targetSceneId === s.id ? 'border-blue-600 border-3' : 'border-transparent'}`}
                      onClick={() => {
                        updateHotspot(idx, 'targetSceneId', s.id);
                        setShowTargetList(null);
                      }}
                    />
                  ))}
                </div>
              )}
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn xoá hotspot này?')) {
                    deleteHotspot(idx);
                  }
                }}
                className="text-red-600 text-sm hover:underline mt-1"
              >
                🗑️ Xoá Hotspot
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
