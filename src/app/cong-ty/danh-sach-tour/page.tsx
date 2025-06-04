'use client'

import { useEffect, useState } from 'react';
import { getListProjectOwn } from '@/app/api/project';
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import Link from "next/link";
import { Star, MapPinHouse } from "lucide-react"
import { rangePrice } from '@/utilities/constant';

export default function listTour() {

    const [listProject, setListProject] = useState<any>(null)
    useEffect(() => {
        const ListProject = async () => {
            try {
                const res = await getListProjectOwn();
                setListProject(res?.data.listProject);
            } catch (error) {
                console.error('Lỗi lấy thông báo:', error);
            }
        };

        ListProject();
    }, []);

    return (

        <>
            <h1 className='text-center font-semibold text-2xl m-3'>Danh sách tour đã tạo</h1>
            <div className="flex flex-wrap gap-6 justify-center">
                {listProject && listProject.map((project: any) => {
                    const images = project.scenes.map((scene) => scene.original); // Swiper images
                    const firstScene = project.scenes.find((scene) => scene.isFirst) || project.scenes[0];
                    return (
                        <div key={project._id} className="flex flex-col gap-2 rounded-lg overflow-hidden shadow-lg w-full max-w-[400px] shadow-color-dark">
                            <div>
                                <Swiper
                                    modules={[Navigation, Pagination]}
                                    spaceBetween={30}
                                    slidesPerView={1}
                                    loop={true}
                                    autoplay={{ delay: 3000 }}
                                    pagination={{ clickable: true }}
                                    navigation={true}
                                >
                                    {(images.length > 0 ? images : [project.coverImage]).map((img, index) => (
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
                            </div>
                            <div className="px-3 py-2 flex flex-col gap-2">
                                <Link
                                    href={`/cong-ty/sua-tin/${project.projectId}`}
                                    className="font-semibold line-clamp-2 overflow-hidden text-ellipsis cursor-pointer"
                                >
                                    {project.title}
                                </Link>

                                {/* Star rating giả lập */}
                                <div className="flex gap-1">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <Star
                                            key={i}
                                            className={i < 4 ? "text-yellow-400" : "text-gray-300"}
                                            size={20}
                                        />
                                    ))}
                                </div>

                                {/* Vị trí tạm thời */}
                                <div className="flex gap-2">
                                    <MapPinHouse size={20} />
                                    <p className="line-clamp-2 overflow-hidden text-ellipsis">Địa điểm khởi hành: không xác định</p>
                                </div>

                                {/* Gợi ý trạng thái đặt gần đây */}
                                <p className="bg-sky-100 w-fit px-2 leading-6 text-sky-500 rounded-lg">Vừa được đặt 20 phút trước</p>

                                {/* Giá tiền */}
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

        </>
    );
}
