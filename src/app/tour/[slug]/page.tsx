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
import { rangePrice } from '@/utilities/constant';
import { useUser } from '@/contexts/UserContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { createNoti } from '@/app/api/notification';

export default function ProjectDetail() {
    const [project, setProject] = useState<any>(null);
    const [sceneId, setSceneId] = useState<string | null>(null);
    const [textures, setTextures] = useState<THREE.Texture[]>([]);
    const [nextTextures, setNextTextures] = useState<THREE.Texture[] | null>(null);
    const [expandedSteps, setExpandedSteps] = useState<number[]>([]);

    const params = useParams();
    const projectId: any = params?.slug;
    const userInfor = useUser();
    const { openModal } = useAuthModal();

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

    const handleBooking = async () => {
        if (!userInfor || !userInfor.userId) {
            openModal(1);
            return;
        }

        const contact = userInfor.phone || userInfor.email || 'thông tin liên hệ';
        const message = `👤 ${userInfor.fullName || userInfor.userName || 'Khách hàng'} vừa đăng ký tư vấn tour "${project.title}. Liên hệ qua ${contact}"`;

        try {
            await createNoti({
                projectId: projectId,        
                projectName: project.title,        
                userIdTour: project.userId,    
                userId: userInfor.userId,  
                message: message,
            });
            alert(`✅ Nhân viên sẽ liên hệ tư vấn cho bạn qua ${contact} sớm nhất có thể. Xin cảm ơn!`);
        } catch (error) {
            console.error(error);
            alert('❌ Gửi thông báo thất bại. Vui lòng thử lại sau.');
        }
    };

    return (
        <div className="w-3/4 mx-auto pt-4">
            <h1 className="text-default-color text-2xl pb-4">{project.title}</h1>
            <p className='pb-5'>{project.description}</p>
            <img src={project.coverImage} alt="project-image-cover" className='max-w-[800] max-h-[450] mb-5' />
            {project.scenes.length > 0
                ?
                <>
                    <h2 className='fancy-text font-semibold text-xl mb-2.5'>Trải nghiệm du lịch 360° <span className="inline-block animate-bounce">✨</span></h2>
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
                    <div className="flex gap-4 overflow-x-auto py-2 mb-4">
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
            <div className='flex justify-between items-start gap-8'>
                <div className='w-2/3'>
                    <div className="detail_tour">
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
                                        <div className="step_detail tiptap" dangerouslySetInnerHTML={{ __html: step.content }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="book_tour w-1/3 sticky top-4 mb-5">
                    <p className="text-xl font-bold mb-2">Đặt tour</p>
                    <div className="flex flex-col gap-4">
                        <span>
                            Ngày khởi hành: <span className="font-bold">{project.departureDate}</span>
                        </span>
                        <div className="flex">
                            <span>Tổng giá tour:</span>
                            <span className="text-default-color ml-1">{rangePrice.find(p => p.id === Number(project.price))?.value || 'Không xác định'} đ</span>
                        </div>
                        {project.sale ? <> <p>Ưu đãi: {project.sale}</p></> : null}
                        <div className="flex justify-center">
                            <Button className='cursor-pointer' onClick={handleBooking}>Tư vấn - Đặt tour</Button>
                        </div>
                    </div>
                </div>
            </div>



        </div>
    );
}
