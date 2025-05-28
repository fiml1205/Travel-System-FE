'use client'

import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import Link from "next/link";
import { Star, MapPinHouse } from "lucide-react"

export default function Home() {

  const images = [
    '/images/banner.png',
    '/images/banner.png',
    '/images/banner.png',
    '/images/banner.png',
    '/images/banner.png',
  ]
  // const images = [
  //   'https://cdn.tuoitre.vn/471584752817336320/2024/4/11/img9544-1712820860821905506907.jpeg',
  //   'https://image.tienphong.vn/600x315/Uploaded/2024/lce-ljvqj/2024_04_10/chuong-nhuoc-nam35-9763.jpg',
  //   'https://cdnphoto.dantri.com.vn/ys9_X-Vhyo_iHOeNFx3-26fYwGA=/thumb_w/1020/2024/03/06/chuong-nhuoc-nam-4-1709695278783.jpg',
  //   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdNcSiBD3bBLJZrBuzmvK297WCmpAlGV4pHQ&s',
  //   'https://image.voh.com.vn/voh/Image/2024/01/12/voh-tieu-su-chuong-nhuoc-nam-h8.jpg?t=o'
  // ]

  return (
    <>
      <div className="relative">
        <div className="w-3/4 p-8 mx-auto mb-5 flex flex-col gap-6 xl:max-w-1200px">
          <div className="w-full">
            <p className="font-semibold text-lg	mb-3">Địa điểm du lịch khu vực Hà Nội</p>
            <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
              <div className="flex flex-col gap-2 rounded-lg overflow-hidden shadow-lg w-full max-w-400px shadow-color-dark">
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
                    {images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <img src={img} alt={`Slide ${index}`} className="w-full h-40" width={30} height={30} loading="lazy" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                <div className="px-3 py-2 flex flex-col gap-2">
                  <Link href="/project/shanghai-china" className="font-semibold line-clamp-2 overflow-hidden text-ellipsis cursor-pointer">Tour du lịch Trung Quốc 5 ngày 4 đêm Thượng Hải - Tô Châu - Phúc Đán</Link>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (v, i) => (
                      <Star
                        key={i}
                        className={i < 4 ? "text-yellow-400" : "text-gray-300"}
                        size={20}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <MapPinHouse size={20} />
                    <p className="line-clamp-2 overflow-hidden text-ellipsis">Thuý Lĩnh Hoàng Mai, Hà Nội</p>
                  </div>
                  <p className="bg-sky-100 w-fit px-2 leading-6	text-sky-500 rounded-lg">Vừa được đặt 20 phút trước</p>
                  <p className="flex justify-end text-lg text-default-color font-semibold">Từ 1 - 5 triệu</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-lg overflow-hidden shadow-lg w-full max-w-400px shadow-color-dark">
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
                    {images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <img src={img} alt={`Slide ${index}`} className="w-full h-40" width={30} height={30} loading="lazy" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                <div className="px-3 py-2 flex flex-col gap-2">
                  <Link href="/project/shanghai-china" className="font-semibold line-clamp-2 overflow-hidden text-ellipsis cursor-pointer">Tour du lịch Trung Quốc 5 ngày 4 đêm Thượng Hải - Tô Châu - Phúc Đán</Link>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (v, i) => (
                      <Star
                        key={i}
                        className={i < 4 ? "text-yellow-400" : "text-gray-300"}
                        size={20}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <MapPinHouse size={20} />
                    <p className="line-clamp-2 overflow-hidden text-ellipsis">Thuý Lĩnh Hoàng Mai, Hà Nội</p>
                  </div>
                  <p className="bg-sky-100 w-fit px-2 leading-6	text-sky-500 rounded-lg">Vừa được đặt 20 phút trước</p>
                  <p className="flex justify-end text-lg text-default-color font-semibold">Từ 1 - 5 triệu</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-lg overflow-hidden shadow-lg w-full max-w-400px shadow-color-dark">
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
                    {images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <img src={img} alt={`Slide ${index}`} className="w-full h-40" width={30} height={30} loading="lazy" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                <div className="px-3 py-2 flex flex-col gap-2">
                  <p className="font-semibold line-clamp-2 overflow-hidden text-ellipsis cursor-pointer">Tour du lịch Trung Quốc 5 ngày 4 đêm Thượng Hải - Tô Châu - Phúc Đán</p>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (v, i) => (
                      <Star
                        key={i}
                        className={i < 4 ? "text-yellow-400" : "text-gray-300"}
                        size={20}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <MapPinHouse size={20} />
                    <p className="line-clamp-2 overflow-hidden text-ellipsis">Thuý Lĩnh Hoàng Mai, Hà Nội</p>
                  </div>
                  <p className="bg-sky-100 w-fit px-2 leading-6	text-sky-500 rounded-lg">Vừa được đặt 20 phút trước</p>
                  <p className="flex justify-end text-lg text-default-color font-semibold">Từ 1 - 5 triệu</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-5">
              <Link href='/' className="py-2 px-4 rounded-md bg-white text-default-color border boder-solid border-default-color hover:bg-default-color hover:text-white">Xem tất cả</Link>
            </div>
          </div>
          <div className="w-full">
            <p className="font-semibold text-lg	mb-3">Địa điểm du lịch khu vực Hồ Chí Minh</p>
            <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
              <div className="flex flex-col gap-2 rounded-lg overflow-hidden shadow-lg w-full max-w-400px shadow-color-dark">
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
                    {images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <img src={img} alt={`Slide ${index}`} className="w-full h-40" width={30} height={30} loading="lazy" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                <div className="px-3 py-2 flex flex-col gap-2">
                  <Link href="/project/shanghai-china" className="font-semibold line-clamp-2 overflow-hidden text-ellipsis cursor-pointer">Tour du lịch Trung Quốc 5 ngày 4 đêm Thượng Hải - Tô Châu - Phúc Đán</Link>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (v, i) => (
                      <Star
                        key={i}
                        className={i < 4 ? "text-yellow-400" : "text-gray-300"}
                        size={20}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <MapPinHouse size={20} />
                    <p className="line-clamp-2 overflow-hidden text-ellipsis">Thuý Lĩnh Hoàng Mai, Hà Nội</p>
                  </div>
                  <p className="bg-sky-100 w-fit px-2 leading-6	text-sky-500 rounded-lg">Vừa được đặt 20 phút trước</p>
                  <p className="flex justify-end text-lg text-default-color font-semibold">Từ 1 - 5 triệu</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-lg overflow-hidden shadow-lg w-full max-w-400px shadow-color-dark">
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
                    {images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <img src={img} alt={`Slide ${index}`} className="w-full h-40" width={30} height={30} loading="lazy" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                <div className="px-3 py-2 flex flex-col gap-2">
                  <Link href="/project/shanghai-china" className="font-semibold line-clamp-2 overflow-hidden text-ellipsis cursor-pointer">Tour du lịch Trung Quốc 5 ngày 4 đêm Thượng Hải - Tô Châu - Phúc Đán</Link>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (v, i) => (
                      <Star
                        key={i}
                        className={i < 4 ? "text-yellow-400" : "text-gray-300"}
                        size={20}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <MapPinHouse size={20} />
                    <p className="line-clamp-2 overflow-hidden text-ellipsis">Thuý Lĩnh Hoàng Mai, Hà Nội</p>
                  </div>
                  <p className="bg-sky-100 w-fit px-2 leading-6	text-sky-500 rounded-lg">Vừa được đặt 20 phút trước</p>
                  <p className="flex justify-end text-lg text-default-color font-semibold">Từ 1 - 5 triệu</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-lg overflow-hidden shadow-lg w-full max-w-400px shadow-color-dark">
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
                    {images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <img src={img} alt={`Slide ${index}`} className="w-full h-40" width={30} height={30} loading="lazy" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                <div className="px-3 py-2 flex flex-col gap-2">
                  <Link href="/project/shanghai-china" className="font-semibold line-clamp-2 overflow-hidden text-ellipsis cursor-pointer">Tour du lịch Trung Quốc 5 ngày 4 đêm Thượng Hải - Tô Châu - Phúc Đán</Link>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (v, i) => (
                      <Star
                        key={i}
                        className={i < 4 ? "text-yellow-400" : "text-gray-300"}
                        size={20}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <MapPinHouse size={20} />
                    <p className="line-clamp-2 overflow-hidden text-ellipsis">Thuý Lĩnh Hoàng Mai, Hà Nội</p>
                  </div>
                  <p className="bg-sky-100 w-fit px-2 leading-6	text-sky-500 rounded-lg">Vừa được đặt 20 phút trước</p>
                  <p className="flex justify-end text-lg text-default-color font-semibold">Từ 1 - 5 triệu</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-5">
              <Link href='/' className="py-2 px-4 rounded-md bg-white text-default-color border boder-solid border-default-color hover:bg-default-color hover:text-white">Xem tất cả</Link>
            </div>
          </div>
          <div className="w-full">
            <p className="font-semibold text-lg	mb-3">Địa điểm du lịch khu vực Đà Nẵng</p>
            <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
              <div className="flex flex-col gap-2 rounded-lg overflow-hidden shadow-lg w-full max-w-400px shadow-color-dark">
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
                    {images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <img src={img} alt={`Slide ${index}`} className="w-full h-40" width={30} height={30} loading="lazy" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                <div className="px-3 py-2 flex flex-col gap-2">
                  <Link href="/project/shanghai-china" className="font-semibold line-clamp-2 overflow-hidden text-ellipsis cursor-pointer">Tour du lịch Trung Quốc 5 ngày 4 đêm Thượng Hải - Tô Châu - Phúc Đán</Link>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (v, i) => (
                      <Star
                        key={i}
                        className={i < 4 ? "text-yellow-400" : "text-gray-300"}
                        size={20}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <MapPinHouse size={20} />
                    <p className="line-clamp-2 overflow-hidden text-ellipsis">Thuý Lĩnh Hoàng Mai, Hà Nội</p>
                  </div>
                  <p className="bg-sky-100 w-fit px-2 leading-6	text-sky-500 rounded-lg">Vừa được đặt 20 phút trước</p>
                  <p className="flex justify-end text-lg text-default-color font-semibold">Từ 1 - 5 triệu</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-lg overflow-hidden shadow-lg w-full max-w-400px shadow-color-dark">
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
                    {images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <img src={img} alt={`Slide ${index}`} className="w-full h-40" width={30} height={30} loading="lazy" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                <div className="px-3 py-2 flex flex-col gap-2">
                  <Link href="/project/shanghai-china" className="font-semibold line-clamp-2 overflow-hidden text-ellipsis cursor-pointer">Tour du lịch Trung Quốc 5 ngày 4 đêm Thượng Hải - Tô Châu - Phúc Đán</Link>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (v, i) => (
                      <Star
                        key={i}
                        className={i < 4 ? "text-yellow-400" : "text-gray-300"}
                        size={20}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <MapPinHouse size={20} />
                    <p className="line-clamp-2 overflow-hidden text-ellipsis">Thuý Lĩnh Hoàng Mai, Hà Nội</p>
                  </div>
                  <p className="bg-sky-100 w-fit px-2 leading-6	text-sky-500 rounded-lg">Vừa được đặt 20 phút trước</p>
                  <p className="flex justify-end text-lg text-default-color font-semibold">Từ 1 - 5 triệu</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-lg overflow-hidden shadow-lg w-full max-w-400px shadow-color-dark">
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
                    {images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <img src={img} alt={`Slide ${index}`} className="w-full h-40" width={30} height={30} loading="lazy" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                <div className="px-3 py-2 flex flex-col gap-2">
                  <Link href="/project/shanghai-china" className="font-semibold line-clamp-2 overflow-hidden text-ellipsis cursor-pointer">Tour du lịch Trung Quốc 5 ngày 4 đêm Thượng Hải - Tô Châu - Phúc Đán</Link>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (v, i) => (
                      <Star
                        key={i}
                        className={i < 4 ? "text-yellow-400" : "text-gray-300"}
                        size={20}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <MapPinHouse size={20} />
                    <p className="line-clamp-2 overflow-hidden text-ellipsis">Thuý Lĩnh Hoàng Mai, Hà Nội</p>
                  </div>
                  <p className="bg-sky-100 w-fit px-2 leading-6	text-sky-500 rounded-lg">Vừa được đặt 20 phút trước</p>
                  <p className="flex justify-end text-lg text-default-color font-semibold">Từ 1 - 5 triệu</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-5">
              <Link href='/' className="py-2 px-4 rounded-md bg-white text-default-color border boder-solid border-default-color hover:bg-default-color hover:text-white">Xem tất cả</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
