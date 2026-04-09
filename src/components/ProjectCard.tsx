import { motion } from "framer-motion";
import Link from "next/link";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { Star, MapPinHouse, CalendarDays } from "lucide-react";
import 'swiper/swiper-bundle.css';
import { timeAgo } from '@/utilities/functions';
import { API_BASE_URL } from "@/utilities/config";
import { rangePrice, listCity } from '@/utilities/constant';

export default function ProjectCard({
    project,
    index,
}: any) {
    const images = [project.coverImage, ...project.scenes?.map((scene: any) => `${API_BASE_URL}${scene.originalImage}`)];

    return (
        <motion.div
            key={project._id}
            className="flex flex-col w-full gap-2 rounded-lg overflow-hidden shadow-lg shadow-color-dark md:w-block-tour h-fit select-none border border-transparent hover:border-sky-300 dark:border-[gray]"
            initial={{ opacity: 0, x: 100 }} // ẩn và dịch sang phải
            whileInView={{ opacity: 1, x: 0 }} // hiện và về đúng vị trí
            viewport={{ once: true, amount: 0.2 }} // chỉ animate khi visible lần đầu
            transition={{ duration: 0.5, delay: index * 0.1 }} // delay cho từng card
        >
            <div>
                {images.length === 1 ? (
                    <img
                        src={images[0] || '/images/no-image.jpg'}
                        alt={`Slide ${index}`}
                        className="w-full h-40 object-cover"
                        loading="lazy"
                    />
                ) : (
                    <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={30}
                        slidesPerView={1}
                        loop={true}
                        autoplay={{ delay: 3000 }}
                        pagination={{ clickable: true }}
                        navigation={true}
                    >
                        {images.map((img: string, index: number) => (
                            <SwiperSlide key={index}>
                                <img
                                    src={img || '/images/no-image.jpg'}
                                    alt={`Slide ${index}`}
                                    className="w-full h-40 object-cover"
                                    loading="lazy"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}

            </div>
            <div className="px-3 py-2 flex flex-col gap-2 h-full">
                <Link
                    href={`/tour/${project.projectId}`}
                    className="font-semibold line-clamp-2 overflow-hidden text-ellipsis cursor-pointer h-[48]"
                >
                    {project.title}
                </Link>
                <div className="relative group flex gap-1 items-center w-fit">
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            size={20}
                            className={i < Math.round(project.vote?.average || 0) ? "text-yellow-400" : "text-gray-300"}
                        />
                    ))}
                    <div className="absolute left-0 bottom-full mb-1 bg-black text-white text-xs px-2 py-1 rounded opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none whitespace-nowrap z-10">
                        {project.vote?.total || 0} lượt đánh giá
                    </div>
                </div>
                <div className="flex gap-2">
                    <MapPinHouse size={20} />
                    <p className="line-clamp-2 overflow-hidden text-ellipsis">
                        Khởi hành: {listCity.find((item: any) => item._id === project.departureCity)?.name || "Không xác định"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <CalendarDays size={20} />
                    <p className="line-clamp-2 overflow-hidden text-ellipsis">
                        Ngày khởi hành: {project.departureDate}
                    </p>
                </div>
                <p className="bg-sky-100 w-fit px-2 leading-6 text-sky-500 rounded-lg h-[24px]">
                    {project.timeLastBook ? (
                        <span>Vừa được đặt {timeAgo(project.timeLastBook)}</span>
                    ) : (
                        <span>Đang chờ đặt chỗ</span>
                    )
                    }
                </p>
                <p className="flex justify-end text-lg text-default-color font-semibold mt-auto">
                    {(() => {
                        const match = rangePrice.find((p) => p.id === Number(project.price));
                        return match ? `Từ ${match.value}` : `Giá: ${project.price}đ`;
                    })()}
                </p>
            </div>
        </motion.div>
    );
}
