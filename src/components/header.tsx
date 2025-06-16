'use client';

import { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';
import { AlignJustify, Bell, BookOpenText, ChevronDown, Gem, Headset, Heart, LogOut, Search, Smartphone, Trash2, User, X, Newspaper, ScrollText, LockKeyhole } from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import { Button } from './ui/button';
import { listCity, rangePrice } from '@/utilities/constant';
import { useUser } from '@/contexts/UserContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { getNoti } from '@/app/api/notification';
import { changePassword } from '@/app/api/user';
import Combobox from "./combobox";
import { useRouter } from 'next/navigation';

export default function Header() {
  const userInfor = useUser();
  const router = useRouter();
  const { openModal } = useAuthModal();
  const [showMenu, setShowMenu] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showNoti, setShowNoti] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const avatarTailRef = useRef<HTMLDivElement>(null);
  const notiRef = useRef<HTMLDivElement>(null);
  const notiTailRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [listCityRebuild, setListCityRebuild] = useState<any>()
  const [city, setCity] = useState<Number>()
  const [listPriceRebuild, setListPriceRebuild] = useState<any>()
  const [price, setPrice] = useState<Number>()
  const [keyword, setKeyword] = useState('');
  // chane pwd
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordOld, setPasswordOld] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (userInfor) {
      const fetchNotifications = async () => {
        try {
          const res = await getNoti();
          setNotifications(res?.data.listNoti || []);
        } catch (error) {
          console.error('Lỗi lấy thông báo:', error);
        }
      };

      fetchNotifications();

      const arrayListCityRebuild = listCity.map(item => ({
        value: item._id,
        label: item.name
      }))
      setListCityRebuild(arrayListCityRebuild)
      const arrayListPriceRebuild = rangePrice.map(item => ({
        value: item.id,
        label: item.value
      }))
      setListPriceRebuild(arrayListPriceRebuild)
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

  const selectCity = (cityID: Number) => {
    setCity(cityID)
  }

  const selectPrice = (price: Number) => {
    setPrice(price)
  }

  const handleSearch = () => {
    const queryParams = new URLSearchParams();

    if (keyword.trim()) queryParams.set('keyword', keyword.trim());
    if (city) queryParams.set('city', String(city));
    if (price) queryParams.set('price', String(price));

    router.push(`http://localhost:3000/tim-kiem?${queryParams.toString()}`);
  };

  const handleChangePassword = async () => {
    // ✅ Kiểm tra xác nhận mật khẩu
    if (!passwordOld) {
      setPasswordError('Vui lòng nhập mật khẩu cũ');
      return;
    }
    if (!passwordNew) {
      setPasswordError('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (!passwordConfirm) {
      setPasswordError('Vui lòng nhập lại mật khẩu mới để xác nhận');
      return;
    }
    if (passwordNew !== passwordConfirm) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }

    setPasswordError('');
    try {
      const res = await changePassword({ passwordOld, passwordNew, passwordConfirm })
      if (res.success) {
        alert('✅ Đổi mật khẩu thành công');
        setShowChangePassword(false);
        setPasswordOld('');
        setPasswordNew('');
        setPasswordConfirm('');
        setPasswordError('');
      } else {
        setPasswordError(res.message || 'Lỗi đổi mật khẩu');
      }
    } catch (err: any) {
      setPasswordError(err.message);
    }
  };

  return (
    <>
      <header className="flex justify-between px-3 xl:px-16 py-3">
        <div className="flex items-center gap-5">
          <Link href='/'>
            <Image src="/images/logo-site.png" alt="logo-site" width={200} height={45} />
          </Link>
          {/* <div className="flex gap-4">
            <Link href='/' className="text-xl text-default-color p-1 hover:border hover:border-default-color">BLOG</Link>
            <Link href='/' className="text-xl text-default-color p-1 hover:border hover:border-default-color">About Us</Link>
            <Link href='/' className="text-xl text-default-color p-1 hover:border hover:border-default-color">Contact</Link>
          </div> */}
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
                <div className="flex flex-col gap-3 p-4 group max-h-[600px]">
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
                <img src={`http://localhost:8000${userInfor.avatar}`} alt="avatar" className="rounded-full w-9 h-9 object-cover" />
              ) : (
                <div className="bg-slate-200 rounded-full w-9 h-9 flex justify-center items-center">
                  <User className="w-5 h-5" />
                </div>
              )}
              <span className="font-semibold">{userInfor.userName}</span>
              <ChevronDown className="w-4 h-4" />

              {showAvatar && (
                <div ref={avatarTailRef} className="absolute top-14 right-0 w-52 bg-background border border-slate-200 p-3 rounded-xl shadow-lg text-sm z-10" onClick={(e) => e.stopPropagation()}>
                  {userInfor.type == 2 &&
                    <>
                      <Link href="/cong-ty/dang-tin" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2">
                        <Newspaper className="w-5 h-5" />
                        <span>Đăng tin</span>
                      </Link>
                      <Link href="/cong-ty/danh-sach-tour" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2">
                        <ScrollText className="w-5 h-5" />
                        <span>Danh sách tour</span>
                      </Link>
                    </>
                  }
                  <Link href="/tai-khoan/cap-nhat" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2">
                    <User className="w-5 h-5" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                  <Link href="/tai-khoan/yeu-thich" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2">
                    <Heart className="w-5 h-5 text-default-color" />
                    <span>Danh sách yêu thích</span>
                  </Link>
                  <div className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2" onClick={() => setShowChangePassword(true)}>
                    <LockKeyhole className="w-5 h-5" />
                    <span>Đổi mật khẩu</span>
                  </div>
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
          {/* <div className="mt-6 border-t pt-4">
            <Link href="/blog" className="flex items-center gap-4 py-2">
              <BookOpenText />
              <span>Blog</span>
            </Link>
            <Link href="/diamond-companies" className="flex items-center gap-4 py-2">
              <Gem />
              <span>Doanh nghiệp tiêu biểu</span>
            </Link>
          </div> */}
        </div>
      </header>

      {/* Banner */}
      <div className="bg-[url('/images/banner.png')] w-full h-96 bg-cover bg-bottom px-5 py-12 xl:py-20 flex flex-col items-center gap-5">
        <div className="relative w-full max-w-xl bg-white rounded-lg">
          <input type="text" placeholder="Nhập từ khóa tìm kiếm..." className="h-12 w-full rounded-xl pl-4" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <Search className="absolute top-3 right-3 text-slate-500" />
        </div>
        <div className="w-full max-w-xl flex flex-col gap-4 lg:gap-0 lg:flex-row">
          <Combobox listData={listCityRebuild} placeholder={'Điểm xuất phát'} borderRadius={2} handleFunction={selectCity} />
          <Combobox listData={listPriceRebuild} placeholder={'Mức giá'} borderRadius={1} handleFunction={selectPrice} />
          <Button className="lg:rounded-l-none h-12 font-semibold" onClick={handleSearch}>
            Tìm kiếm
          </Button>
        </div>
      </div>
      {showChangePassword && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center layout">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
            <X
              className="absolute top-3 right-3 cursor-pointer"
              onClick={() => {
                setShowChangePassword(false);
                setPasswordOld('');
                setPasswordNew('');
                setPasswordConfirm('');
              }}
            />
            <h2 className="text-lg font-bold mb-4">Đổi mật khẩu</h2>

            <input
              type="password"
              placeholder="Mật khẩu cũ"
              className="w-full mb-3 p-2 border rounded"
              value={passwordOld}
              onChange={(e) => setPasswordOld(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              className="w-full mb-3 p-2 border rounded"
              value={passwordNew}
              onChange={(e) => setPasswordNew(e.target.value)}
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              className="w-full mb-4 p-2 border rounded"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
            {passwordError && (
              <p className="text-red-600 text-sm mb-2">{passwordError}</p>
            )}
            <Button className="w-full" onClick={handleChangePassword}>
              Cập nhật
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
