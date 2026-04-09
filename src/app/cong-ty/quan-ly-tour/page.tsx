'use client'

import { useEffect, useState } from 'react';
import { getListProjectOwn } from '@/app/api/project';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import Link from "next/link";
import { Star, MapPinHouse, SquarePen } from "lucide-react"
import { rangePrice, listCity } from '@/utilities/constant';
import { useUser } from '@/contexts/UserContext';
import { API_BASE_URL, BASE_URL } from '@/utilities/config';
import { Button } from '@/components/ui/button';

export default function listTour() {
    const userInfor = useUser();
    const [listProject, setListProject] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const LIMIT = 9;

    const fetchProjects = async (pageNum = 1) => {
        setLoading(true);
        try {
            const res = await getListProjectOwn({ page: pageNum, limit: LIMIT });
            const newProject = res?.data.listProject;
            setListProject((prev: any) => pageNum == 1 ? newProject : [...prev, ...newProject]);
            setHasMore(newProject.length == LIMIT);
        } catch (error) {
            console.error('Lỗi lấy danh sách tour:', error);
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userInfor && userInfor.type == 2) {
            fetchProjects(1);
        } else {
            window.location.href = '/'
        }
    }, []);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            fetchProjects(nextPage);
            setPage(nextPage);
        }
    }

    return (
        <div className="relative">
            <div className="p-6 pt-8 pb-8 md:p-8 mx-auto mb-5 flex flex-col gap-12 xl:max-w-1200px w-full md:w-3/4">
                <h1 className='text-center font-semibold text-2xl m-3'>Danh sách tour đã tạo</h1>
                {isLoading ? (
                    <p>Đang tải kết quả...</p>
                ) : listProject.length === 0 ? (
                    <p>Không tìm thấy tour nào phù hợp.</p>
                ) : (
                    <div className="w-full">
                        <div className="flex flex-col items-center gap-10 md:flex-row flex-wrap">
                            {listProject && listProject.map((project: any, index: any) => {
                                const images = project.scenes.map((scene: any) => `${API_BASE_URL}${scene.originalImage}`);
                                return (
                                    <div key={index} className="flex flex-col w-full gap-2 rounded-lg overflow-hidden shadow-lg shadow-color-dark md:w-block-tour h-fit select-none border border-transparent hover:border-sky-300 dark:border-[gray]">
                                        <div className='relative'>
                                            <Swiper
                                                modules={[Navigation, Pagination]}
                                                spaceBetween={30}
                                                slidesPerView={1}
                                                loop={true}
                                                autoplay={{ delay: 3000 }}
                                                pagination={{ clickable: true }}
                                                navigation={true}
                                            >
                                                {(images.length > 0 ? images : [project.coverImage]).map((img: any, index: any) => (
                                                    <SwiperSlide key={index}>
                                                        <img
                                                            src={img || '/images/no-image.jpg'}
                                                            alt={`Slide ${index}`}
                                                            className="w-full h-40 object-cover"
                                                            width={30}
                                                            height={30}
                                                            loading="lazy"
                                                        />
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                            <div className='absolute top-0 right-0 z-10 p-1 m-1 rounded-[10] bg-[gray]'>
                                                <Link href={`${BASE_URL}/cong-ty/sua-tin/${project.projectId}`}>
                                                    <SquarePen className='text-amber-50' />
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="px-3 py-2 flex flex-col gap-2">
                                            <Link
                                                href={`/tour/${project.projectId}`}
                                                className="font-semibold line-clamp-2 overflow-hidden text-ellipsis cursor-pointer h-[48]"
                                            >
                                                {project.title}
                                            </Link>

                                            <div className="relative group flex gap-1 items-center">
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={20}
                                                        className={i < Math.round(project.vote?.average || 0) ? "text-yellow-400" : "text-gray-300"}
                                                    />
                                                ))}
                                                {/* Tooltip trượt lên khi hover */}
                                                <div className="absolute left-0 bottom-full mb-1 bg-black text-white text-xs px-2 py-1 rounded opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none whitespace-nowrap z-10">
                                                    {project.vote?.total || 0} lượt đánh giá
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <MapPinHouse size={20} />
                                                <p className="line-clamp-2 overflow-hidden text-ellipsis">
                                                    Địa điểm khởi hành: {listCity.find(item => item._id === project.departureCity)?.name || "Không xác định"}
                                                </p>
                                            </div>

                                            <p className="bg-sky-100 w-fit px-2 leading-6 text-sky-500 rounded-lg">Vừa được đặt 20 phút trước</p>

                                            <p className="flex justify-end text-lg text-default-color font-semibold">
                                                {(() => {
                                                    const match = rangePrice.find((p) => p.id === Number(project.price));
                                                    return match ? `Từ ${match.value}` : `Giá: ${project.price}đ`;
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-center mt-5">
                            {hasMore ?
                                <Button onClick={handleLoadMore} disabled={loading}>{loading ? 'Đang tải...' : 'Xem thêm'}</Button>
                                :
                                <p className="text-gray-400">Đã hiển thị tất cả tour</p>
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
