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

export default function listTour() {
    const userInfor = useUser();
    const [listProject, setListProject] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (userInfor && userInfor.type == 2) {
            const ListProject = async () => {
                try {
                    const res = await getListProjectOwn();
                    setListProject(res?.data.listProject);
                } catch (error) {
                    console.error('Lỗi lấy thông báo:', error);
                } finally {
                    setIsLoading(false);
                }
            };

            ListProject();
        } else {
            window.location.href = '/'
        }
    }, []);

    return (
        <div className="relative">
            <div className="w-3/4 p-8 mx-auto mb-5 flex flex-col gap-6 xl:max-w-1200px">
                <h1 className='text-center font-semibold text-2xl m-3'>Danh sách tour đã tạo</h1>
                {isLoading ? (
                    <p>Đang tải kết quả...</p>
                ) : listProject.length === 0 ? (
                    <p>Không tìm thấy tour nào phù hợp.</p>
                ) : (
                    <div className="w-full">
                        <div className='w-full'>
                            <div className="flex flex-col items-center justify-between gap-10 md:flex-row flex-wrap">
                                {listProject && listProject.map((project: any) => {
                                    const images = project.scenes.map((scene: any) => `${API_BASE_URL}${scene.originalImage}`);
                                    return (
                                        <div key={project._id} className="flex flex-col gap-2 rounded-lg overflow-hidden shadow-lg w-full max-w-[400px] shadow-color-dark h-[360]">
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
