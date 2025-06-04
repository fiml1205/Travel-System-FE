'use client';

import { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';
import { AlignJustify, Bell, BookOpenText, ChevronDown, Gem, Headset, Heart, LogOut, Search, Smartphone, Trash2, User, X } from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import { Button } from './ui/button';
import { listCity, listDistrict } from '@/utilities/constant';
import { useUser } from '@/contexts/UserContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { getNoti } from '@/app/api/notification';

export default function Header() {
  const userInfor = useUser();
  const { openModal } = useAuthModal();

  const [listCityRebuild, setListCityRebuild] = useState<any>();
  const [listDistrictRebuild, setListDistrictRebuild] = useState<any>();
  const [showMenu, setShowMenu] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showNoti, setShowNoti] = useState(false);

  const avatarRef = useRef<HTMLDivElement>(null);
  const avatarTailRef = useRef<HTMLDivElement>(null);
  const notiRef = useRef<HTMLDivElement>(null);
  const notiTailRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if(userInfor) {
      const fetchNotifications = async () => {
        try {
          const res = await getNoti();
          setNotifications(res?.data.listNoti || []);
        } catch (error) {
          console.error('Lỗi lấy thông báo:', error);
        }
      };
  
      fetchNotifications();

    }
  }, []);

  useEffect(() => {
    const cityOptions = listCity.map(item => ({
      value: item._id,
      label: item.name,
    }));
    setListCityRebuild(cityOptions);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        avatarRef.current &&
        avatarTailRef.current &&
        !avatarRef.current.contains(event.target as Node) &&
        !avatarTailRef.current.contains(event.target as Node)
      ) {
        setShowAvatar(false);
      }
      if (
        notiRef.current &&
        notiTailRef.current &&
        !notiRef.current.contains(event.target as Node) &&
        !notiTailRef.current.contains(event.target as Node)
      ) {
        setShowNoti(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    Cookies.remove('SSToken');
    window.location.href = '/';
  };

  return (
    <>
      <header className="flex justify-between px-3 xl:px-16 py-3">
        <div className="flex items-center gap-5">
          <Link href='/'>
            <Image src="/images/logo-site.png" alt="logo-site" width={200} height={45} />
          </Link>
          <div className="flex gap-4">
            <Link href='/' className="text-xl text-default-color p-1 hover:border hover:border-default-color">BLOG</Link>
            <Link href='/' className="text-xl text-default-color p-1 hover:border hover:border-default-color">About Us</Link>
            <Link href='/' className="text-xl text-default-color p-1 hover:border hover:border-default-color">Contact</Link>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <ModeToggle />

          {/* Notification */}
          <div
            ref={notiRef}
            className="relative bg-slate-200 rounded-full w-9 h-9 flex justify-center items-center cursor-pointer"
            onClick={() => setShowNoti(!showNoti)}
          >
            <Bell className="w-5 h-5 select-none" />
            <span className="absolute -top-2 -right-1 w-5 h-5 rounded-full bg-default-color text-white text-xs flex justify-center items-center">{notifications.length}</span>

            {showNoti && (
              <div
                ref={notiTailRef}
                className="absolute min-w-80 w-full right-0 top-12 max-h-screen overflow-y-scroll z-10 bg-white border-t border-slate-200 shadow-md scrollbar-custom"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3 border-b flex justify-between">
                  <p className="text-default-color cursor-pointer">Đọc tất cả</p>
                  <p className="text-default-color cursor-pointer">Xóa tất cả</p>
                </div>
                <div className="flex flex-col gap-3 p-4 group">
                  {notifications.length > 0 ? (
                    notifications.map((noti, index) => (
                      <div key={noti._id || index} className="flex gap-3">
                        <div className="w-11 h-11 flex items-center justify-center bg-slate-200 rounded-full">
                          <User className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-color-dark">{noti.projectName}</p>
                          <p className="text-gray-600 leading-5 text-sm">{noti.message}</p>
                          <div className="flex justify-between mt-2 text-sm text-gray-600">
                            <span>{new Date(noti.createdAt).toLocaleString('vi-VN')}</span>
                            <Trash2 className="w-4 h-4 xl:hidden group-hover:block text-color-dark cursor-pointer" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm italic text-gray-500">Không có thông báo nào</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User area */}
          {userInfor ? (
            <div ref={avatarRef} className="md:flex h-9 gap-2 cursor-pointer items-center relative hidden" onClick={() => setShowAvatar(!showAvatar)}>
              {userInfor.avatar ? (
                <img src={userInfor.avatar} alt="avatar" className="rounded-full w-9 h-9 object-cover" />
              ) : (
                <div className="bg-slate-200 rounded-full w-9 h-9 flex justify-center items-center">
                  <User className="w-5 h-5" />
                </div>
              )}
              <span className="font-semibold">{userInfor.userName}</span>
              <ChevronDown className="w-4 h-4" />

              {showAvatar && (
                <div ref={avatarTailRef} className="absolute top-14 right-0 w-52 bg-background border border-slate-200 p-3 rounded-xl shadow-lg text-sm z-10" onClick={(e) => e.stopPropagation()}>
                  <Link href="/tai-khoan" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2">
                    <User className="w-5 h-5" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                  <Link href="/cong-ty/danh-sach-tour" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2">
                    <User className="w-5 h-5" />
                    <span>Danh sách tour</span>
                  </Link>
                  <Link href="/tai-khoan/yeu-thich" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2">
                    <Heart className="w-5 h-5 text-default-color" />
                    <span>Danh sách yêu thích</span>
                  </Link>
                  <div className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2 cursor-pointer" onClick={handleLogout}>
                    <LogOut className="w-5 h-5" />
                    <span>Đăng xuất</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden xl:flex gap-4 ml-2">
              <Button className="font-semibold h-10 text-base w-28" onClick={() => openModal(1)}>Đăng nhập</Button>
              <Button className="font-semibold h-10 text-base w-28 bg-white text-default-color border border-default-color" onClick={() => openModal(2)}>Đăng ký</Button>
            </div>
          )}

          <AlignJustify className="w-5 h-5 cursor-pointer xl:hidden" onClick={() => setShowMenu(!showMenu)} />
        </div>

        {/* Slide Menu Mobile */}
        <div className={`absolute top-0 left-0 w-full h-full z-20 bg-white p-4 transition-transform duration-700 ${showMenu ? 'translate-x-0' : '-translate-x-full'}`}>
          <X className="absolute top-3 right-3" onClick={() => setShowMenu(false)} />
          <div className="mt-10 flex flex-col gap-3">
            <Button variant="outline" className="w-full" onClick={() => { openModal(2); setShowMenu(false); }}>Đăng ký</Button>
            <Button className="w-full" onClick={() => { openModal(1); setShowMenu(false); }}>Đăng nhập</Button>
          </div>
          <div className="mt-6 border-t pt-4">
            <Link href="/blog" className="flex items-center gap-4 py-2">
              <BookOpenText />
              <span>Blog</span>
            </Link>
            <Link href="/diamond-companies" className="flex items-center gap-4 py-2">
              <Gem />
              <span>Doanh nghiệp tiêu biểu</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-[url('/images/banner.png')] w-full h-96 bg-cover bg-bottom px-5 py-12 xl:py-20 flex flex-col items-center gap-5">
        <div className="relative w-full max-w-xl bg-white rounded-lg">
          <input type="text" placeholder="Nhập từ khóa tìm kiếm..." className="h-12 w-full rounded-xl pl-4" />
          <Search className="absolute top-3 right-3 text-slate-500" />
        </div>
      </div>
    </>
  );
}
