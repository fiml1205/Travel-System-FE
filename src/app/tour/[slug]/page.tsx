'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CornerRightDown, CornerRightUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CubeViewer from '@/components/vr/CubeViewer';
import CubeScene from '@/components/vr/CubeScene';
import SceneAudio from '@/components/vr/SceneAudio';
import { preloadCubeTextures } from '@/hooks/usePreloadTextures';
import * as THREE from 'three';

export default function ProjectDetail() {
    const [project, setProject] = useState<any>(null);
    const [sceneId, setSceneId] = useState<string | null>(null);
    const [textures, setTextures] = useState<THREE.Texture[]>([]);
    const [nextTextures, setNextTextures] = useState<THREE.Texture[] | null>(null);
    const [expandedSteps, setExpandedSteps] = useState<number[]>([]);

    const params = useParams();
    const projectId: any = params?.slug;

    useEffect(() => {
        if (!projectId) return;
        const fetchProject = async () => {
            const res = await fetch(`http://localhost:8000/api/project/${projectId}`);
            const data = await res.json();
            setProject(data);

            const firstScene = data.scenes.find((s: any) => s.isFirst) || data.scenes[0];
            if (firstScene) {
                setSceneId(firstScene.id);
                preloadCubeTextures(firstScene.id, projectId).then(setTextures);
            }
        };
        fetchProject();
    }, [projectId]);

    console.log(project)

    const currentScene = project?.scenes.find((s: any) => s.id === sceneId);

    if (!project) {
        return <div className="text-center text-white py-10">Đang tải dữ liệu tour...</div>;
    }

    const toggleStep = (index: number) => {
        setExpandedSteps(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    return (
        <div className="w-3/4 mx-auto pt-4">
            <h1 className="text-default-color text-2xl pb-4">{project.title}</h1>
            {project.scenes.length > 0
                ?
                <>
                    <main className="h-80vh flex items-center justify-center bg-gray-900">
                        <CubeViewer overlay={<SceneAudio audioUrl={currentScene.audio ? currentScene.audio : 'http://localhost:3000/audios/scene-audio.mp3'} />}>
                            <CubeScene
                                projectId={projectId}
                                textures={textures}
                                hotspots={currentScene.hotspots}
                                onPreloadScene={(nextId) => {
                                    preloadCubeTextures(nextId, projectId).then(setNextTextures);
                                }}
                                onRequestTransition={(nextId) => {
                                    if (nextTextures) {
                                        setTextures(nextTextures);
                                        setNextTextures(null);
                                    }
                                    setSceneId(nextId);
                                }}
                            />
                        </CubeViewer>
                    </main>
                    {/* list image 360 */}
                    <p className='mt-6 font-semibold'>Danh sách ảnh 360°</p>
                    <div className="flex gap-4 overflow-x-auto py-2">
                        {project.scenes.map((scene: any) => (
                            <div key={scene.id} className="flex flex-col items-center cursor-pointer"
                                onClick={() => {
                                    preloadCubeTextures(scene.id, projectId).then((loaded) => {
                                        setTextures(loaded);
                                        setSceneId(scene.id);
                                    });
                                }}
                            >
                                <img
                                    src={scene.original}
                                    alt={scene.name || 'Ảnh 360'}
                                    className={`w-28 h-16 object-cover rounded-md border-3 ${scene.id === sceneId ? 'border-blue-500' : 'border-transparent'}`}
                                />
                                <span className="text-sm text-center mt-1">{scene.name || ''}</span>
                            </div>
                        ))}
                    </div>
                </>
                :
                null}

            <div className="flex gap-5 mt-5">
                <div className="detail_tour w-7/10">
                    <p className="text-xl font-bold mb-2">Lịch trình tour</p>
                    {project.tourSteps.map((step: any, index: number) => {
                        const isOpen = expandedSteps.includes(index);
                        return (
                            <div key={index} className="tour_step mb-4">
                                <div className="step_header flex justify-between mb-2 cursor-pointer" onClick={() => toggleStep(index)}>
                                    <p className="step_name font-bold text-gray-500">{step.day}</p>
                                    {isOpen
                                        ? <CornerRightUp className="w-5 text-gray-500" />
                                        : <CornerRightDown className="w-5 text-gray-500" />}
                                </div>
                                {isOpen && (
                                    <div className="step_detail" dangerouslySetInnerHTML={{ __html: step.content }} />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="book_tour">
                    <p className="text-xl font-bold mb-2">Đặt tour</p>
                    <div className="flex flex-col gap-4">
                        <span>
                            Ngày khởi hành: <span className="font-bold">{project.departureDate}</span>
                        </span>
                        <div className="flex justify-between">
                            <span>Tổng giá tour</span>
                            <span className="text-default-color">{project.price?.toLocaleString()} đ</span>
                        </div>
                        <div className="flex justify-between">
                            <Button>Tư vấn - Đặt tour</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
