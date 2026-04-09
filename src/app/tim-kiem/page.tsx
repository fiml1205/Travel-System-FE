'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { API_BASE_URL } from '@/utilities/config';
import PaginationProjects from '@/components/PaginationProjects';
import ProjectCard from '@/components/ProjectCard';

interface ProjectData {
    projectId: number;
    title: string;
    description: string;
    coverImage: string;
    departureDate: string;
    price: number;
    sale?: string;
}

export default function SearchPage() {
    let searchParams = useSearchParams();
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const keyword = searchParams.get('keyword');
    const city = searchParams.get('city');
    const price = searchParams.get('price');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasPageChanged, setPageChanged] = useState(false);
    const LIMIT = 9

    const ref = useRef(null);

    useEffect(() => {
        if (!loading && ref.current && hasPageChanged) {
            ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [loading, page, hasPageChanged]);

    const fetchSearch = async (pageNum = 1) => {
        setLoading(true)
        const queryParams = new URLSearchParams();
        try {
            if (keyword) queryParams.set('keyword', keyword);
            if (city) queryParams.set('city', city);
            if (price) queryParams.set('price', price);
            queryParams.set('page', String(pageNum));
            queryParams.set('limit', String(LIMIT));

            const res = await fetch(`${API_BASE_URL}/api/project/search?${queryParams.toString()}`);
            const data = await res.json();
            setProjects(data.data.listProject || []);
            setTotalPages(Math.ceil(data.data.totalProject / LIMIT));
        } catch (err) {
            console.error("Lỗi tìm kiếm:", err);
        } finally {
            setIsLoading(false);
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchSearch(page);
    }, [searchParams, page]);


    return (
        <div className="relative">
            <div ref={ref} className="w-3/4 p-8 mx-auto mb-5 flex flex-col gap-6 xl:max-w-1200px">
                <h1 className="text-xl font-bold mb-4">🔍 Kết quả tìm kiếm</h1>
                {isLoading ? (
                    <p>Đang tải kết quả...</p>
                ) : projects.length === 0 ? (
                    <p>Không tìm thấy tour nào phù hợp.</p>
                ) : (
                    <div className="w-full">
                        <div className="flex flex-col items-center justify-between gap-10 md:flex-row flex-wrap">
                            {projects && projects.map((project: any, index: any) => {
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
