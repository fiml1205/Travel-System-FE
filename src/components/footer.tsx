import Link from "next/link"
import Image from "next/image"
import { Button } from "./ui/button"
import { Facebook, Twitter, Youtube, Download } from 'lucide-react'
export default function Footer() {
    return (
        <div className="bg-slate-200 pb-10 bg-color-dark">
            <div className="m-auto px-7 py-3 pt-10 w-full xl:w-1200px">
                <Image src="/images/logo-site.png" alt="logo-site" width={200} height={45} />
                <div className="mt-4 flex flex-col lg:flex-row gap-4 md:gap-7 lg:gap-7 xl:gap-28">
                    <div className="flex flex-col gap-4 md:flex-row md:gap-12 lg:gap-7 xl:gap-28">
                        <div className="flex flex-col gap-2 ml-1">
                            <span className="font-semibold">Công ty cổ phần chuyển đổi số SnowMoon</span>
                            <span className="text-13px">Tổng đài chăm sóc: 1900 1310</span>
                            <span className="text-13px">Email: hotro@snowmoon.vn</span>
                            <span className="text-13px">Văn phòng Hà Nội: Tầng 11, Tòa Peakview, 36 Hoàng Cầu, Đống Đa</span>
                            <div className="flex gap-1 mt-2">
                                <Image src='/images/bo-cong-thuong.webp' alt="bo-cong-thuong" width={160} height={60} className="mr-2"/>
                                <Image src='/images/bo-cong-thuong2.webp' alt="bo-cong-thuong" width={160} height={60} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="font-semibold">Chính sách & Quy định</span>
                            <Link href="/" className="text-13px">Điều khoản và điều kiện</Link>
                            <Link href="/" className="text-13px">Quy định về thanh toán</Link>
                            <Link href="/" className="text-13px">Chính sách bảo mật thông tin</Link>
                            <Link href="/" className="text-13px">Quy chế hoạt động</Link>
                            <Link href="/" className="text-13px">Chương trình khách hàng thân thiết</Link>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row lg:flex-col gap-6 lg:items-center lg:justify-center">
                        <div className="flex gap-4 items-center">
                            <span className="font-semibold">Tải app VR360</span>
                            <Image src="/images/qr_download_app.webp" alt="qr_download_app" width={100} height={100} className="hidden xl:block" />
                            <Button className="xl:hidden gap-2">
                                <Download />
                                <span>mysport</span>
                            </Button>
                        </div>
                        <div className="flex gap-7 items-center">
                            <span className="font-semibold">Kết nối với VR360</span>
                            <div className="flex gap-4">
                                <Link href="/" className="bg-default-color rounded-full p-2">
                                    <Facebook className="text-slate-50 w-6 h-6" />
                                </Link>
                                <Link href="/" className="bg-default-color rounded-full p-2">
                                    <Twitter className="text-slate-50 w-6 h-6" />
                                </Link>
                                <Link href="/" className="bg-default-color rounded-full p-2">
                                    <Youtube className="text-slate-50 w-6 h-6" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}