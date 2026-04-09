'use client';

import { useEffect, useState, useRef } from 'react';
import { getListProjectSave } from '@/app/api/project';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import { rangePrice, listCity } from '@/utilities/constant';
import { Star, MapPinHouse } from "lucide-react"
import Link from 'next/link';
import { API_BASE_URL } from '@/utilities/config';
import { Button } from '@/components/ui/button';
import PaginationProjects from '@/components/PaginationProjects';
import ProjectCard from '@/components/ProjectCard';

export default function FavoritePage() {
    const [listProject, setListProject] = useState<any>([]);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasPageChanged, setPageChanged] = useState(false);
    const LIMIT = 9

    const ref = useRef(null);

    useEffect(() => {
        if (!loading && ref.current && hasPageChanged) {
            ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [loading, page, hasPageChanged]);

    const fetchListProject = async (pageNum = 1) => {
        setLoading(true)
        try {
            const res = await getListProjectSave({ page: pageNum, limit: LIMIT });
            const newProject = res?.data.listProject;
            console.log(res.data)
            setListProject(newProject || []);
            setTotalPages(Math.ceil(res?.data.totalProject / LIMIT));
        } catch (err) {
            console.error("Lỗi tìm kiếm:", err);
        } finally {
            setIsLoading(false);
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchListProject(page);
    }, [page]);

    return (
        <div className="relative">
            <div className="p-6 pt-8 pb-8 md:p-8 mx-auto mb-5 flex flex-col gap-12 xl:max-w-1200px w-full md:w-3/4">
                <h1 className="text-xl font-bold mb-4">Danh sách tour yêu thích</h1>
                {isLoading ? (
                    <p>Đang tải kết quả...</p>
                ) : listProject.length === 0 ? (
                    <p>Không tìm thấy tour nào phù hợp.</p>
                ) : (
                    <div className="w-full">
                        <div className="flex flex-col items-center gap-10 md:flex-row flex-wrap select-none">
                            {listProject && listProject.map((project: any, index: any) => {
                                const images = project.scenes.map((scene: any) => `${API_BASE_URL}${scene.originalImage}`);
                                return (
                                    <ProjectCard
                                        key={project._id}
                                        project={project}
                                        index={index}
                                    />
                                );
                            })}
                        </div>
                        <PaginationProjects
                            totalPages={totalPages}
                            currentPage={page}
                            onChange={(p: any) => {
                                setPageChanged(true);
                                setPage(p);
                            }}
                            loading={loading}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
