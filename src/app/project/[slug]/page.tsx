"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { CornerRightDown, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import CubeViewer from '@/components/vr/CubeViewer';
import CubeScene from '@/components/vr/CubeScene';
import SceneAudio from '@/components/vr/SceneAudio';
import * as THREE from "three";
import { preloadCubeTextures } from "@/hooks/usePreloadTextures";

const projects = [
    { id: 1, slug: "shanghai-china", title: "Dự án Du Lịch", description: "Chi tiết về dự án du lịch." },
    { id: 2, slug: "du-an-cong-nghiep", title: "Dự án Công Nghiệp", description: "Chi tiết về dự án công nghiệp." },
];

export default function ProjectDetail() {
    const [sceneId, setSceneId] = useState("scene_1747992165");
    const [textures, setTextures] = useState<THREE.Texture[]>([]);
    const [nextTextures, setNextTextures] = useState<THREE.Texture[] | null>(null);
    const params = useParams();
    const slug = params?.slug as string;

    const project = projects.find((p) => p.slug === slug);

    if (!project) {
        return <div className="text-white text-center">❌ Không tìm thấy dự án</div>;
    }

    const projectId = 1

    const fakeSceneMap: Record<string, {
        id: string;
        preview: string;
        audio: string;
        hotspots: {
            position: [number, number, number];
            targetSceneId: string;
            label: string;
            imageUrl: string;
        }[];
    }> = {
        scene_1747992165: {
            id: 'scene_1747992165',
            preview: '/projects/1/scene_1747992165/original.jpg',
            audio: '/projects/1/scene_1747992165/scene_1747992165.mp3',
            hotspots: [
                {
                    position: [4.86, 0.9074435149692504, -5],
                    targetSceneId: 'scene_1747992398',
                    label: 'Lối vào chính',
                    imageUrl: '/projects/1/scene_1747992398/original.jpg',
                },
                {
                    position: [-6, 0, 0],
                    targetSceneId: 'scene_1747993729',
                    label: 'Phòng họp',
                    imageUrl: '/projects/1/scene_1747993729/original.jpg',
                },
            ],
        },
        scene_1747992398: {
            id: 'scene_1747992398',
            preview: '/projects/1/scene_1747992398/original.jpg',
            audio: '/projects/1/scene_1747992398/scene_1747992398.mp3',
            hotspots: [
                {
                    position: [-6, 0, 0],
                    targetSceneId: 'scene_1747992165',
                    label: 'Quay lại',
                    imageUrl: '/projects/1/scene_1747992165/original.jpg',
                },
            ],
        },
        scene_1747993729: {
            id: 'scene_1747993729',
            preview: '/projects/1/scene_1747993729/original.jpg',
            audio: '/projects/1/scene_1747993729/scene_1747993729.mp3',
            hotspots: [
                {
                    position: [6, 0, 0],
                    targetSceneId: 'scene_1747992165',
                    label: 'Quay lại',
                    imageUrl: '/projects/1/scene_1747992165/original.jpg',
                },
            ],
        },
    };


    // Load scene đầu tiên
    useEffect(() => {
        preloadCubeTextures(sceneId, projectId).then(setTextures);
    }, [sceneId]);

    const sceneData = fakeSceneMap[sceneId];

    return (
        <>
            <div className="w-3/4 mx-auto pt-4">
                <h1 className=" text-default-color text-2xl pb-4">Tour du lịch Trung Quốc 5 ngày 4 đêm Thượng Hải - Tô Châu - Phúc Đán</h1>
                <div>
                    <main className="h-80vh flex items-center justify-center bg-gray-900">
                        <CubeViewer overlay={<SceneAudio audioUrl={sceneData.audio} />}>
                            <CubeScene
                                textures={textures}
                                hotspots={sceneData.hotspots}
                                onPreloadScene={(nextId) => {
                                    preloadCubeTextures(nextId, projectId).then((loaded) => {
                                        setNextTextures(loaded); // preload sẵn ảnh
                                    });
                                }}
                                onRequestTransition={(nextId) => {
                                    if (nextTextures) {
                                        setTextures(nextTextures); // đổi ảnh sau animation
                                        setNextTextures(null);
                                    }
                                    setSceneId(nextId); // đổi scene
                                }}
                            />
                        </CubeViewer>
                    </main>
                </div>
                {/* detail tour */}
                <div className="flex gap-5 mt-5">
                    <div className="detail_tour w-7/10">
                        <p className="text-xl font-bold mb-2">Lịch trình tour</p>
                        <div className="tour_step">
                            <div className="step_header flex justify-between mb-2">
                                <p className="step_name font-bold text-gray-500">Ngày 1: Thượng Hải</p>
                                <CornerRightDown className="w-5 text-gray-500" />
                            </div>
                            <div className="step_detail">
                                Tối: Đón quý khách tại sân bay Nội Bài, làm thủ tục cho quý khách bay đi Nhật Bản trên chuyến bay VJ938 HAN-KIX lúc 01:40.

                                Quý khách dùng bữa sáng trên máy bay của hãng hàng không VIETJET AIR và nghỉ đêm trên máy bay.
                            </div>
                        </div>
                        <div className="tour_step">
                            <div className="step_header flex justify-between mb-2">
                                <p className="step_name font-bold text-gray-500">Ngày 1: Thượng Hải</p>
                                <CornerRightDown className="w-5 text-gray-500" />
                            </div>
                            <div className="step_detail">
                                Tối: Đón quý khách tại sân bay Nội Bài, làm thủ tục cho quý khách bay đi Nhật Bản trên chuyến bay VJ938 HAN-KIX lúc 01:40.

                                Quý khách dùng bữa sáng trên máy bay của hãng hàng không VIETJET AIR và nghỉ đêm trên máy bay.
                            </div>
                        </div>
                        <div className="tour_step">
                            <div className="step_header flex justify-between mb-2">
                                <p className="step_name font-bold text-gray-500">Ngày 1: Thượng Hải</p>
                                <CornerRightDown className="w-5 text-gray-500" />
                            </div>
                            <div className="step_detail">
                                Tối: Đón quý khách tại sân bay Nội Bài, làm thủ tục cho quý khách bay đi Nhật Bản trên chuyến bay VJ938 HAN-KIX lúc 01:40.

                                Quý khách dùng bữa sáng trên máy bay của hãng hàng không VIETJET AIR và nghỉ đêm trên máy bay.
                            </div>
                        </div>
                    </div>
                    <div className="book_tour">
                        <p className="text-xl font-bold mb-2">Đặt tour</p>
                        <div className="flex flex-col gap-4">
                            <span>Ngày khởi hành: <span className="font-bold">19/03/2025</span></span>
                            <div className="flex justify-between">
                                <span>Ngày khác</span>
                                <CalendarDays className="cursor-pointer" />
                            </div>
                            <span>Số chỗ còn: <span className="font-bold">27 chỗ</span></span>
                            <div className="price">
                                <div>
                                    Nguời lớn: 31.990.000đ
                                </div>
                                <div>
                                    Nguời lớn: 31.990.000đ
                                </div>
                                <div>
                                    Nguời lớn: 31.990.000đ
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span>Tổng giá tour</span>
                                <span className="text-default-color">31.990.000đ</span>
                            </div>
                            <div className="flex justify-between">
                                <Button>Tư vấn</Button>
                                <Button>Đặt tour</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}