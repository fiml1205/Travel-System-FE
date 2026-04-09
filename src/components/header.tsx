'use client';

import { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { usePathname } from "next/navigation";
import { useSearchParams } from 'next/navigation'
import { BASE_URL, API_BASE_URL } from '@/utilities/config';
import { useUser } from '@/contexts/UserContext';
import { getNoti, markAllNotiRead } from '@/app/api/notification';
import Link from 'next/link';
import Image from 'next/image';
import { AlignJustify, Bell, ChevronDown, Heart, LogOut, Search, User, X, Newspaper, ScrollText, LockKeyhole, ListCheck } from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import { Button } from './ui/button';
import { listCity, rangePrice } from '@/utilities/constant';
import { useAuthModal } from '@/contexts/AuthModalContext';
import ChangePasswordModal from './ChangePasswordModal';

import Combobox from "./combobox";



export default function Header() {
  const userInfor = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // header
  const { openModal } = useAuthModal();
  const [showMenu, setShowMenu] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showNoti, setShowNoti] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const avatarTailRef = useRef<HTMLDivElement>(null);
  const notiRef = useRef<HTMLDivElement>(null);
  const notiTailRef = useRef<HTMLDivElement>(null);

  // search tour
  const [listCityRebuild, setListCityRebuild] = useState<any>()
  const [city, setCity] = useState<any>();
  const [listPriceRebuild, setListPriceRebuild] = useState<any>()
  const [price, setPrice] = useState<any>();
  const [keyword, setKeyword] = useState('');

  // change pwd
  const [showChangePassword, setShowChangePassword] = useState(false);

  // handle notification
  const [notifications, setNotifications] = useState<any[]>([]);
  const [pageNoti, setPageNoti] = useState(1);
  const [hasMoreNoti, setHasMoreNoti] = useState(true);
  const [loadingNoti, setLoadingNoti] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const LIMIT = 10;

  const fetchNotifications = async (page = 1) => {
    setLoadingNoti(true);
    try {
      const res = await getNoti({ page, limit: LIMIT });
      if (res?.data) {
        setNotifications(page === 1 ? res.data.listNoti : [...notifications, ...res.data.listNoti]);
        setHasMoreNoti(res.data.listNoti.length === LIMIT);
        setUnreadCount(res.data.unread ?? 0);
        setPageNoti(page);
      }
    } catch (error) {
      setHasMoreNoti(false);
    } finally {
      setLoadingNoti(false);
    }
  };

  const FuncMarkAllNotiRead = async () => {
    await markAllNotiRead();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setShowMenu(false);
  }, [pathname]);

  useEffect(() => {
    // Lấy giá trị từ query
    const cityParam = searchParams.get('city');
    const priceParam = searchParams.get('price');
    const keywordParam = searchParams.get('keyword');
    setCity(cityParam ? Number(cityParam) : undefined);
    setPrice(priceParam ? Number(priceParam) : undefined);
    setKeyword(keywordParam ? String(keywordParam) : '');
  }, [searchParams]);

  useEffect(() => {
    // get notification
    if (userInfor) {
      fetchNotifications(1);
    }

    // handle select input search
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
    const cityOptions = listCity.map(item => ({
      value: item._id,
      label: item.name,
    }));
    setListCityRebuild(cityOptions);

    // handle click outside element
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

  const handleLoadMoreNoti = () => {
    if (loadingNoti || !hasMoreNoti) return;
    fetchNotifications(pageNoti + 1);
  };

  // logout
  const handleLogout = () => {
    Cookies.remove('SSToken');
    window.location.href = '/';
  };

  // functions search
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

    router.push(`${BASE_URL}/tim-kiem?${queryParams.toString()}`);
  };

  return (
    <>
      {/* header */}
      <header className="flex justify-between px-3 xl:px-16 py-3">
        <div className="flex items-center gap-5">
          <Link href='/'>
            <Image src="/images/logo-site.png" alt="logo-site" width={200} height={45} />
          </Link>
        </div>
        <div className="flex gap-2 items-center">
          <ModeToggle />
          {/* Notification */}
          {userInfor &&
            <div
              ref={notiRef}
              className="relative bg-slate-200 rounded-full w-9 h-9 flex justify-center items-center cursor-pointer dark:bg-[black] dark:border dark:border-[white]"
              onClick={async () => {
                setShowNoti(!showNoti)
                if (!showNoti) {
                  await FuncMarkAllNotiRead();
                  setNotifications(notifications => notifications.map(n => ({ ...n, isRead: true })));
                  setUnreadCount(0);
                }
              }}
            >
              <Bell className="w-5 h-5 select-none" />
              {
                unreadCount > 0 &&
                <span className="absolute -top-2 -right-1 w-5 h-5 rounded-full bg-default-color text-white text-xs flex justify-center items-center">{unreadCount}</span>
              }
              {showNoti && (
                <div
                  ref={notiTailRef}
                  className="absolute min-w-80 w-full right-0 top-12 max-h-screen overflow-y-scroll z-10 bg-white border-t border-slate-200 shadow-md scrollbar-custom dark:bg-[black] dark:border-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col gap-3 p-4 group max-h-[600px]">
                    <p className='font-semibold text-xl border-b pb-0.5'>Thông báo</p>
                    {notifications.length > 0 ? (
                      notifications.map((noti, index) => (
                        <Link key={noti._id || index} href={'/cong-ty/quan-ly-dat-tour'}>
                          <div className={`flex gap-3`}>
                            <div className="w-11 h-11 flex items-center justify-center bg-slate-200 rounded-full">
                              {noti.avatarUser ?
                                (<>
                                  <img src={`${API_BASE_URL}${noti.avatarUser}`} alt="avatar" className='rounded-full w-full h-full' />
                                </>) : <User className="w-8 h-8" />
                              }

                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{noti.projectName}</p>
                              <p className="text-gray-600 leading-5 text-sm">{noti.message}</p>
                              <div className="flex justify-between mt-2 text-sm text-gray-600">
                                <span>{new Date(noti.createdAt).toLocaleString('vi-VN')}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm italic text-gray-500">Không có thông báo nào</p>
                    )}
                    {hasMoreNoti && (
                      <Button onClick={handleLoadMoreNoti} disabled={loadingNoti}>
                        {loadingNoti ? "Đang tải..." : "Xem thêm"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          }
          {/* User area */}
          {userInfor ? (
            <div ref={avatarRef} className="md:flex h-9 gap-2 cursor-pointer items-center relative hidden" onClick={() => setShowAvatar(!showAvatar)}>
              {userInfor.avatar ? (
                <img src={`${API_BASE_URL}${userInfor.avatar}`} alt="avatar" className="rounded-full w-9 h-9 object-cover" />
              ) : (
                <div className="bg-slate-200 rounded-full w-9 h-9 flex justify-center items-center">
                  <User className="w-5 h-5" />
                </div>
              )}
              <span className="font-semibold max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis">{userInfor.userName}</span>
              <ChevronDown className="w-4 h-4" />
              {showAvatar && (
                <div ref={avatarTailRef} className="absolute top-14 right-0 w-52 bg-background border border-slate-200 p-3 rounded-xl shadow-lg text-sm z-10" onClick={(e) => e.stopPropagation()}>
                  {userInfor.type == 0 &&
                    <>
                      <Link href="/admin/tours" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2 dark:hover:bg-gray-800">
                        <Newspaper className="w-5 h-5" />
                        <span>Quản lý tour</span>
                      </Link>
                      <Link href="/admin/users" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2 dark:hover:bg-gray-800">
                        <Newspaper className="w-5 h-5" />
                        <span>Quản lý user</span>
                      </Link>
                    </>
                  }
                  {userInfor.type == 2 &&
                    <>
                      <Link href="/cong-ty/dang-tin" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2 dark:hover:bg-gray-800">
                        <Newspaper className="w-5 h-5" />
                        <span>Đăng tin</span>
                      </Link>
                      <Link href="/cong-ty/quan-ly-tour" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2 dark:hover:bg-gray-800">
                        <ScrollText className="w-5 h-5" />
                        <span>Quản lý tour</span>
                      </Link>
                      <Link href="/cong-ty/quan-ly-dat-tour" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2 dark:hover:bg-gray-800">
                        <ListCheck className="w-5 h-5" />
                        <span>Quản lý đặt tour</span>
                      </Link>
                    </>
                  }
                  {userInfor.type != 0 &&
                    <>
                      <Link href="/tai-khoan/cap-nhat" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2 dark:hover:bg-gray-800">
                        <User className="w-5 h-5" />
                        <span>Hồ sơ cá nhân</span>
                      </Link>
                      <Link href="/tai-khoan/yeu-thich" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2 dark:hover:bg-gray-800">
                        <Heart className="w-5 h-5 text-default-color" />
                        <span>Danh sách yêu thích</span>
                      </Link>
                    </>
                  }
                  <div className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2 dark:hover:bg-gray-800" onClick={() => setShowChangePassword(true)}>

                    <LockKeyhole className="w-5 h-5" />
                    <span>Đổi mật khẩu</span>
                  </div>
                  <div className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2 dark:hover:bg-gray-800 cursor-pointer" onClick={handleLogout}>
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
        <div className={`absolute top-0 left-0 w-full h-full z-20 bg-white p-4 dark:bg-[black] transition-transform duration-700 ${showMenu ? 'translate-x-0' : '-translate-x-full'}`}>
          <X className="absolute top-3 right-3" onClick={() => setShowMenu(false)} />
          <div className="mt-10 flex flex-col gap-3">
            {userInfor ? (
              <>
                {userInfor.type == 0 &&
                  <>
                    <Link href="/admin/tours" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2">
                      <Newspaper className="w-5 h-5" />
                      <span>Quản lý tour</span>
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2">
                      <Newspaper className="w-5 h-5" />
                      <span>Quản lý user</span>
                    </Link>
                  </>
                }
                {userInfor.type == 2 &&
                  <>
                    <Link href="/cong-ty/dang-tin" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2">
                      <Newspaper className="w-5 h-5" />
                      <span>Đăng tin</span>
                    </Link>
                    <Link href="/cong-ty/quan-ly-tour" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2">
                      <ScrollText className="w-5 h-5" />
                      <span>Quản lý tour</span>
                    </Link>
                    <Link href="/cong-ty/quan-ly-dat-tour" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2">
                      <ListCheck className="w-5 h-5" />
                      <span>Quản lý đặt tour</span>
                    </Link>
                  </>
                }
                {userInfor.type != 0 &&
                  <>
                    <Link href="/tai-khoan/cap-nhat" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2">
                      <User className="w-5 h-5" />
                      <span>Hồ sơ cá nhân</span>
                    </Link>
                    <Link href="/tai-khoan/yeu-thich" className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2">
                      <Heart className="w-5 h-5 text-default-color" />
                      <span>Danh sách yêu thích</span>
                    </Link>
                  </>
                }
                <div className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2" onClick={() => setShowChangePassword(true)}>
                  <LockKeyhole className="w-5 h-5" />
                  <span>Đổi mật khẩu</span>
                </div>
                <div className="flex items-center gap-4 py-2 hover:bg-slate-200 rounded pl-2 cursor-pointer" onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </div></>
            ) : (
              <>
                <Button variant="outline" className="w-full" onClick={() => { openModal(2); setShowMenu(false); }}>Đăng ký</Button>
                <Button className="w-full" onClick={() => { openModal(1); setShowMenu(false); }}>Đăng nhập</Button>
              </>
            )
            }
          </div>
        </div>
      </header>
      {/* Banner */}
      {!(userInfor && userInfor.type == 0) &&
        <div className="bg-[url('/images/banner.png')] w-full h-96 bg-cover bg-bottom px-5 py-12 xl:py-20 flex flex-col items-center gap-5">
          <div className="relative w-full max-w-xl bg-white rounded-lg">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <input
                type="text"
                placeholder="Bạn muốn đi đâu?"
                className="h-12 w-full rounded-xl pl-4 dark:bg-slate-200 dark:text-[black]"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </form>
            <Search className="absolute top-3 right-3 text-slate-500" />
          </div>
          <div className="w-full max-w-xl flex flex-col gap-4 lg:gap-0 lg:flex-row">
            <Combobox listData={listCityRebuild} placeholder={'Điểm xuất phát'} borderRadius={2} handleFunction={selectCity} value={city} />
            <Combobox listData={listPriceRebuild} placeholder={'Mức giá'} borderRadius={1} handleFunction={selectPrice} value={price} />
            <Button className="lg:rounded-l-none h-12 font-semibold" onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </div>
        </div>
      }

      {/* component change pwd */}
      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        type={1}
        account={''}
      />
    </>
  );
}
