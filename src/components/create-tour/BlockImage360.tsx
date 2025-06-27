'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/utilities/config';
import { Compass } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface Hotspot {
  pitch: number;
  yaw: number;
  label: string;
  targetSceneId: string;
  id?: string;
}

interface Scene {
  id: string;
  name?: string;
  original: string;
  originalImage: string;
  hotspots: Hotspot[];
  multiResConfig?: any;
  audio?: string;
  isFirst?: boolean;
}

interface BlockImage360Props {
  projectId: any;
  onScenesChange?: (scenes: Scene[]) => void;
  initialScenes?: Scene[];
}

export default function BlockImage360({ projectId, onScenesChange, initialScenes = [] }: BlockImage360Props) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number | null>(null);
  const [showTargetList, setShowTargetList] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [addingHotspot, setAddingHotspot] = useState(false);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const panoRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<any>(null);
  const [hotspotVersion, setHotspotVersion] = useState(0);
  const [hotspotLabels, setHotspotLabels] = useState<string[]>([]);

  useEffect(() => {
    if (!initialScenes || initialScenes.length === 0) return;

    if (initialScenes.every(s => !!s.multiResConfig)) {
      setScenes(initialScenes);
      setCurrentSceneIndex(0);
      return;
    }

    let cancelled = false;
    (async () => {
      const scenesWithConfig = await Promise.all(
        initialScenes.map(async (scene) => {
          if (scene.multiResConfig) return scene;
          try {
            const configUrl = `${API_BASE_URL}/tiles/${projectId}/${scene.id}/config.json`;
            const configRes = await fetch(configUrl);
            const configData = await configRes.json();
            configData.multiRes.basePath = `${API_BASE_URL}/tiles/${projectId}/${scene.id}/`;
            return { ...scene, multiResConfig: configData.multiRes };
          } catch (err) {
            console.error('Không thể load config cho scene', scene.id, err);
            return scene;
          }
        })
      );
      if (!cancelled) {
        setScenes(scenesWithConfig);
        setCurrentSceneIndex(0);
      }
    })();

    return () => { cancelled = true; };
  }, []);


  useEffect(() => {
    if (onScenesChange) onScenesChange(scenes);
  }, [scenes, onScenesChange]);

  useEffect(() => {
    if (currentScene) {
      setHotspotLabels(currentScene.hotspots.map(h => h.label || ""));
    }
  }, [currentSceneIndex, scenes]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('projectId', projectId);

    try {
      const res = await fetch(`${API_BASE_URL}/api/image/sliceImage360`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      const sceneId = data.data.sceneId;
      const blobURL = URL.createObjectURL(file);

      const configUrl = `${API_BASE_URL}/tiles/${projectId}/${sceneId}/config.json`;
      const configRes = await fetch(configUrl);
      let configData = await configRes.json();
      configData.multiRes.basePath = `${API_BASE_URL}/tiles/${projectId}/${sceneId}/`

      const newScene: Scene = {
        id: sceneId,
        original: blobURL,
        originalImage: `/tiles/${projectId}/${sceneId}/originalImage.jpg`,
        hotspots: [],
        multiResConfig: configData.multiRes,
      };

      setScenes((prev) => [...prev, newScene]);
      setCurrentSceneIndex(scenes.length);
    } catch (err) {
      console.error('❌ Upload failed:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!(window as any).pannellum || currentSceneIndex === null || !scenes[currentSceneIndex]) return;

    const current = scenes[currentSceneIndex];
    if (!panoRef.current) return;

    panoRef.current.innerHTML = '';
    if (!current.multiResConfig) return;

    viewerInstanceRef.current = (window as any).pannellum.viewer(panoRef.current, {
      type: 'multires',
      multiRes: current.multiResConfig,
      autoLoad: true,
      pitch: 0,
      yaw: 0,
      hotSpots: current.hotspots.map(hs => ({
        pitch: hs.pitch,
        yaw: hs.yaw,
        text: hs.label || '',
        sceneId: hs.targetSceneId,
        cssClass: 'custom-hotspot',
        createTooltipFunc: (hotSpotDiv: any) => {
          hotSpotDiv.innerHTML = '⬤';
          hotSpotDiv.style.color = 'red';
          hotSpotDiv.style.width = '30px';
          hotSpotDiv.style.height = '30px';
          hotSpotDiv.style.backgroundColor = 'red';
          hotSpotDiv.style.borderRadius = '50%';

          if (hs.label) {
            const labelDiv = document.createElement('div');
            labelDiv.innerText = hs.label;
            labelDiv.style.marginTop = '6px';
            labelDiv.style.width = 'fit-content';
            labelDiv.style.background = 'rgba(0,0,0,0.6)';
            labelDiv.style.color = 'white';
            labelDiv.style.fontSize = '12px';
            labelDiv.style.padding = '2px 6px';
            labelDiv.style.borderRadius = '4px';
            labelDiv.style.pointerEvents = 'none';
            labelDiv.style.transform = 'translateY(10px)';
            hotSpotDiv.appendChild(labelDiv);
          }
        }
      }))
    });
  }, [currentSceneIndex, hotspotVersion]);

  useEffect(() => {
    if (!addingHotspot || !viewerInstanceRef.current) return;

    const handleClick = () => {
      setTimeout(() => {
        const pitch = viewerInstanceRef.current.getPitch();
        const yaw = viewerInstanceRef.current.getYaw();

        const newHotspot = { pitch, yaw, label: '', targetSceneId: '' };
        const updatedScenes = [...scenes];
        updatedScenes[currentSceneIndex!].hotspots.push(newHotspot);
        setScenes(updatedScenes);
        if (onScenesChange) onScenesChange(updatedScenes);

        viewerInstanceRef.current.addHotSpot({
          pitch,
          yaw,
          cssClass: 'custom-hotspot',
          createTooltipFunc: (hotSpotDiv: any) => {
            hotSpotDiv.innerHTML = '⬤';
            hotSpotDiv.style.color = 'red';
            hotSpotDiv.style.width = '30px';
            hotSpotDiv.style.height = '30px';
            hotSpotDiv.style.backgroundColor = 'red';
            hotSpotDiv.style.borderRadius = '50%';
          }
        });

        setAddingHotspot(false);
      }, 50);
    };

    viewerInstanceRef.current.on('mousedown', handleClick);
    return () => viewerInstanceRef.current.off?.('mousedown', handleClick);
  }, [addingHotspot]);

  const updateHotspot = (index: number, field: 'label' | 'targetSceneId', value: string) => {
    if (currentSceneIndex === null) return;
    const updatedScenes = [...scenes];
    updatedScenes[currentSceneIndex].hotspots[index][field] = value;
    setScenes(updatedScenes);
    if (field == 'label') {
      setHotspotVersion(prev => prev + 1)
    }
  };

  const deleteHotspot = (index: number) => {
    if (currentSceneIndex === null) return;
    const updatedScenes = [...scenes];
    updatedScenes[currentSceneIndex].hotspots.splice(index, 1);
    setScenes(updatedScenes);
    setHotspotVersion(prev => prev + 1)
  };

  const deleteScene = async (index: number) => {
    const sceneToDelete = scenes[index];
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('sceneId', sceneToDelete.id);
    try {
      await fetch(`${API_BASE_URL}/api/image/deleteImage`, {
        method: 'POST',
        body: formData,
      });
    } catch (err) {
      console.warn('❌ Không thể xoá folder ảnh:', err);
    }

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

  const setFirstScene = (index: number) => {
    const updated = scenes.map((scene, i) => ({ ...scene, isFirst: i === index }));
    setScenes(updated);
  };

  const currentScene = currentSceneIndex !== null ? scenes[currentSceneIndex] : null;

  console.log(scenes)

  return (
    <div className="space-y-4">
      <input type="file" accept="image/*" className='border border-gray-400 rounded-sm pl-1.5' onChange={handleUpload} />
      {loading && <p className="text-blue-600 mt-2">Đang xử lý ảnh...</p>}

      {/* list scene */}
      {scenes.length > 0 && (
        <>
          {/* <Swiper
            modules={[Navigation]}
            spaceBetween={16}
            slidesPerView={8}
            navigation
            loop
            className="py-2"
          // style={{ padding: '0 40px' }}
          >
            {project.scenes.map((scene, index) => (
              <SwiperSlide key={index}>
                <div
                  className="flex flex-col items-center cursor-pointer select-none"
                  onClick={() => {
                    if (scene.id !== currentSceneId) {
                      setCurrentSceneId(scene.id);
                    }
                  }}
                >
                  <img
                    src={`${API_BASE_URL}${scene.originalImage}`}
                    alt={scene.name || 'Ảnh 360'}
                    className={`w-[120] h-[74] object-cover rounded-md border-2 ${scene.id === currentSceneId ? 'border-blue-500' : 'border-transparent'
                      }`}
                  />
                  <span className="text-sm text-center mt-1">{scene.name || ''}</span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper> */}
          <div className="flex gap-2 overflow-x-auto border p-2 rounded">
            <Swiper
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView={8}
              navigation
              loop
              className="py-2"
            >
              {scenes.map((scene, idx) => (
                <SwiperSlide key={idx}>
                  <div key={scene.id} className="w-32">
                    <div className='relative'>
                      <img
                        src={scene.original || `${API_BASE_URL}${scene.originalImage}`}
                        onClick={() => setCurrentSceneIndex(idx)}
                        className={`w-32 h-20 object-cover cursor-pointer rounded ${currentSceneIndex === idx ? 'border-blue-600 border-3' : 'border-transparent'}`}
                      />
                      <button
                        onClick={() => window.confirm('Xoá ảnh và hotspot?') && deleteScene(idx)}
                        className="absolute top-0 right-0 bg-red-600 text-white rounded px-1 opacity-80"
                      >✕</button>
                    </div>
                    <input
                      className="text-xs mt-1 p-1 border rounded w-full"
                      placeholder="Tên ảnh"
                      value={scene.name ?? ''}
                      onChange={(e) => {
                        const updated = [...scenes];
                        updated[idx].name = e.target.value;
                        setScenes(updated);
                      }}
                    />
                    <button
                      onClick={() => setFirstScene(idx)}
                      className={`text-xs mt-1 px-2 py-0.5 rounded ${scene.isFirst ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                    >{scene.isFirst ? 'Ảnh đầu tiên' : 'Chọn làm đầu tiên'}</button>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </>
      )}

      {/* render scene, hotspots, audio */}
      {currentScene && (
        <div className='flex justify-between gap-2.5'>
          {/* render scene */}
          <div className='w-4/5'>
            <div className="relative">
              <div ref={panoRef} className="w-full create-tour-viewer360 rounded border" />
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <Compass className="text-red-600 w-8 h-8 opacity-80" />
              </div>
              <Button
                onClick={() => setAddingHotspot(true)}
                className="absolute bottom-2 left-2 px-3 py-1 text-white bg-blue-600 rounded"
              >➕ Thêm Hotspot</Button>
            </div>
            <div className="text-blue-600 italic mt-1 flex items-center">
              👉 Xoay ảnh tới đúng vị trí bạn muốn đặt hotspot tại tâm ảnh <Compass className="text-red-600 w-6 h-6 opacity-80 ml-1 mr-1" /> , click nút thêm hotspot, sau đó click vào ảnh để xác nhận.
            </div>
          </div>
          {/* render hotspots, audio */}
          <div className='flex flex-col'>
            {/* hotspot details */}
            <div className="w-[300px] max-h-[600] border rounded p-3 space-y-4 overflow-auto">
              <h3 className="font-bold mb-2">🧩 Danh sách Hotspot</h3>
              {currentScene.hotspots.map((hs, idx) => (
                <div key={idx} className="border p-2 rounded space-y-1">
                  <div className="text-xs text-gray-500">
                    📍 Yaw: {hs.yaw.toFixed(2)}, Pitch: {hs.pitch.toFixed(2)}
                  </div>
                  <input
                    placeholder="Label"
                    value={hotspotLabels[idx] ?? ''}
                    onChange={e => {
                      const newLabels = [...hotspotLabels];
                      newLabels[idx] = e.target.value;
                      setHotspotLabels(newLabels);
                    }}
                    onBlur={e => {
                      if (hotspotLabels[idx] !== currentScene.hotspots[idx]?.label) {
                        updateHotspot(idx, 'label', hotspotLabels[idx]);
                      }
                    }}
                    className="w-full border p-1"
                  />
                  <input
                    placeholder="Target Scene ID"
                    value={scenes.find(s => s.id == hs.targetSceneId)?.name || hs.targetSceneId}
                    readOnly
                    onClick={() => setShowTargetList(idx)}
                    className="w-full border p-1 cursor-pointer bg-white"
                  />
                  {showTargetList === idx && (
                    <div className="flex gap-2 mt-1 overflow-x-auto">
                      {scenes.filter((_, sidx) => sidx !== currentSceneIndex).map((s) => (
                        <div key={s.id} className='flex flex-col items-center min-w-[60px] max-w-[60px] w-[60px] flex-shrink-0'>
                          <img
                            src={s.original || `${API_BASE_URL}${s.originalImage}`}
                            className={`w-full h-12 object-cover cursor-pointer rounded hover:border-blue-500 ${hs.targetSceneId === s.id ? 'border-blue-600 border-3' : 'border-transparent'}`}
                            onClick={() => {
                              updateHotspot(idx, 'targetSceneId', s.id);
                              setShowTargetList(null);
                            }}
                          />
                          <span>{s.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => window.confirm('Xoá hotspot?') && deleteHotspot(idx)}
                    className="text-red-600 text-sm hover:underline mt-1 cursor-pointer"
                  >🗑️ Xoá Hotspot</button>
                </div>
              ))}
            </div>
            {/* render audio */}
            <div className="mt-4 border rounded p-3 w-[300]">
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
                    className="mt-2 text-red-600 hover:underline text-sm text-center cursor-pointer"
                  >
                    🗑️ Xoá audio
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
