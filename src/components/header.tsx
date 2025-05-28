"use client"

import { useState, useEffect, useRef } from "react";
import Cookies from 'js-cookie'
import { jwtDecode } from "jwt-decode";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import Combobox from "./combobox";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { AlignJustify, Bell, User, ChevronDown, BookOpenText, Gem, Search, X, Heart, LogOut, Smartphone, Headset, Trash2 } from "lucide-react";
import { listCity, listDistrict } from "@/utilities/constant"
import { validatePhone, validateEmail, validateNoSqli, validatePassword } from "@/utilities/functions";
import { loginApi, registerApi } from '@/app/api/authentication'
import LoadingAnimate from '@/components/loadingAnimate'
import { useUser } from '@/contexts/UserContext';

export default function Header() {
    // handle event
    const [loading, setLoading] = useState<boolean>(false)
    const [listCityRebuild, setListCityRebuild] = useState<any>()
    const [listDistrictRebuild, setListDistrictRebuild] = useState<any>()
    const [city, setCity] = useState<Number>()
    const [district, setDistrict] = useState<Number>()
    const [showPopupAuthen, setShowPopupAuthen] = useState<boolean>(false)
    // 1: login, 2: register
    const [stateAuthen, setStateAuthen] = useState<Number>(2)
    // 1: customer, 2: company
    const [typeUserAuthen, setTypeUserAuthen] = useState<Number>(1)
    const [notiErrorAuthen, setNotiErrorAuthen] = useState<any>()
    const [stateApiAuthen, setStateApiAuthen] = useState<boolean>(true)
    // handle data
    const userInfor = useUser()

    useEffect(() => {
        const arrayListCityRebuild = listCity.map(item => ({
            value: item._id,
            label: item.name
        }))
        setListCityRebuild(arrayListCityRebuild)
    }, []);

    const selectCity = (cityID: Number) => {
        const arrayListCityRebuild = listDistrict
            .filter(item => item.cit_parent == cityID)
            .map(item => ({
                value: item.cit_id,
                label: item.cit_name
            }))
        setListDistrictRebuild(arrayListCityRebuild)
        setCity(cityID)
    }

    const selectDistrict = (districtID: Number) => {
        setDistrict(districtID)
    }

    const [showMenu, setShowMenu] = useState(false)

    const handleShowMenu = () => {
        setShowMenu(!showMenu)
        if (!showMenu) {
            document.body.classList.add('no-scroll')
        } else {
            document.body.classList.remove('no-scroll')
        }
    };

    const [showAvatar, setShowAvatar] = useState(false)
    const [showNoti, setShowNoti] = useState(false)
    const avatarRef = useRef<HTMLDivElement>(null)
    const avatarTailRef = useRef<HTMLDivElement>(null)
    const notiRef = useRef<HTMLDivElement>(null)
    const notiTailRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                avatarRef.current &&
                avatarTailRef.current &&
                !avatarRef.current.contains(event.target as Node) &&
                !avatarTailRef.current.contains(event.target as Node)
            ) {
                setShowAvatar(false)
            }
            if (
                notiRef.current &&
                notiTailRef.current &&
                !notiRef.current.contains(event.target as Node) &&
                !notiTailRef.current.contains(event.target as Node)
            ) {
                setShowNoti(false)
            }
        }

        document.addEventListener('click', handleClickOutside)

        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [])

    const deleteNoti = () => {
        console.log('test')
    }

    const handleLogout = () => {
        Cookies.remove('SSToken')
        window.location.href = '/'
    }

    // handle form authen
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = async (data: any) => {
        setLoading(true)
        try {
            if (stateAuthen == 1) {
                await loginApi(data);
            } else {
                data.type = typeUserAuthen == 1 ? 1 : 2;
                await registerApi(data);
            }
        } catch (error: any) {
            setNotiErrorAuthen(error.message)
            setStateApiAuthen(false)
        } finally {
            setLoading(false);
        }
    };
    const validateAccount = (value: string) => {
        if ((validateEmail(value) || validatePhone(value)) && validateNoSqli(value)) {
            return true;
        }
        return "Tài khoản phải là email, số điện thoại hợp lệ và không có các kí tự cấm";
    };

    const validateConfirmPassword = (value: string) => {
        const password = watch("password");
        return value === password || "Mật khẩu nhập lại không khớp";
    };

    return (
        <>
            <header className="flex justify-between px-3 xl:px-16 py-3">
                <div className="flex items-center gap-5">
                    <Link href='/'>
                        <Image src="/images/logo-site.png" alt="logo-site" width={200} height={45} /></Link>
                    <div className="flex gap-4 boder">
                        <Link href='/' className="text-xl text-default-color p-1 hover:border hover:border-default-color">BLOG</Link>
                        <Link href='/' className="text-xl text-default-color p-1 hover:border hover:border-default-color">About Us</Link>
                        <Link href='/' className="text-xl text-default-color p-1 hover:border hover:border-default-color">Contact</Link>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    {/* dark mode */}
                    <ModeToggle />
                    {/* notification */}
                    <div ref={notiRef} className="relative bg-slate-200 rounded-full w-9 h-9 flex justify-center items-center cursor-pointer" onClick={() => setShowNoti(!showNoti)}>
                        <Bell className="w-5 h-5 select-none" />
                        <span className="absolute -top-2 -right-1 w-5 h-5 rounded-full bg-default-color text-white text-xs flex justify-center items-center">20</span>
                        {showNoti &&
                            <div ref={notiTailRef} className="absolute min-w-80 w-full right-0 top-12 max-h-screen overflow-y-scroll z-10 bg-white boder border-t boder-solid border-slate-200 shadow-md shadow-gray-600 scrollbar-custom" onClick={(event) => event.stopPropagation()}>
                                <div className="p-3 border-b border-solid border-slate-200 flex justify-between">
                                    <p className="text-default-color ">Đọc tất cả</p>
                                    <p className="text-default-color">Xóa tất cả</p>
                                </div>
                                <div className="flex flex-col gap-3 p-4 group">
                                    <div className="flex gap-3">
                                        <div className="w-11 h-11 flex items-center justify-center bg-slate-200 rounded-full">
                                            <User className="w-8 h-8" />
                                        </div>
                                        <div className="w-calc(100%-56px)">
                                            <p className="font-semibold text-color-dark">Du lịch Thượng Hải Trung Quốc</p>
                                            <p className="text-gray-600 leading-5 text-sm">Nguyễn Tú Mai đã đăng ký Du lịch Thượng Hải Trung Quốc. Liên hệ 0968221320 để trao đổi</p>
                                            <div className="flex justify-between items-center">
                                                <p className="text-gray-600 mt-2 text-sm">09-10-2024 10:30:03</p>
                                                <Trash2 className="w-4 h-4 xl:hidden group-hover:block text-color-dark" onClick={() => deleteNoti()} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                    {userInfor ? (
                        <div ref={avatarRef} className="md:flex h-9 gap-2 cursor-pointer items-center relative hidden select-none" onClick={() => setShowAvatar(!showAvatar)}>
                            {userInfor.avatar ? (
                                <img src={userInfor.avatar} alt="User avatar" width={36} height={36} className="rounded-full w-9 h-9 object-cover" />
                            ) : (
                                <div className="bg-slate-200 rounded-full w-9 h-9 flex justify-center items-center">
                                    <User className="w-5 h-5" />
                                </div>
                            )}
                            <span className="font-semibold">{userInfor.userName}</span>
                            <ChevronDown className="w-4 h-4" />
                            {showAvatar ? (
                                <div ref={avatarTailRef} className="absolute z-10 rounded-xl top-14 shadow-lg w-52 flex flex-col right-0 p-3 border border-solid border-slate-200 text-sm bg-background" onClick={(event) => event.stopPropagation()}>
                                    <div className="h-9 py-2 hover:bg-slate-200 rounded pl-2 dark:hover:bg-default-color">
                                        <Link href="/tai-khoan" className="flex gap-4 items-center">
                                            <User className="w-5 h-5" />
                                            <span className="">Hồ sơ cá nhân</span>
                                        </Link>
                                    </div>
                                    <div className="h-9 py-2 hover:bg-slate-200 rounded pl-2 dark:hover:bg-default-color">
                                        <Link href="/tai-khoan/yeu-thich" className="flex gap-4 items-center">
                                            <Heart className="w-5 h-5 text-default-color" />
                                            <span className="">Danh sách yêu thích</span>
                                        </Link>
                                    </div>
                                    <div className="h-9 py-2 hover:bg-slate-200 rounded pl-2 dark:hover:bg-default-color" onClick={() => handleLogout()}>
                                        <div className="flex gap-4 items-center">
                                            <LogOut className="w-5 h-5" />
                                            <span className="">Đăng xuất</span>
                                        </div>
                                    </div>
                                </div>
                            ) : null
                            }
                        </div>
                    ) : (
                        <div className="hidden xl:flex gap-4 ml-2">
                            <Button className="font-semibold h-10 text-base w-28" onClick={() => { setShowPopupAuthen(!showPopupAuthen); setStateAuthen(1) }}>Đăng nhập</Button>
                            <Button className="font-semibold h-10 text-base w-28 bg-white text-default-color border border-solid border-default-color" onClick={() => { setShowPopupAuthen(!showPopupAuthen); setStateAuthen(2) }}>Đăng ký</Button>
                        </div>
                    )}
                    <AlignJustify className="w-5 h-5 cursor-pointer xl:hidden" onClick={handleShowMenu} />
                </div>
                {/* block menu */}
                <div className={`absolute overflow-y-scroll top-0 left-0 p-4 z-20 w-full h-full bg-white bg-color-dark transform transition-transform duration-750 ease-in-out ${showMenu ? 'translate-x-0' : '-translate-x-full'}`}>
                    <X className="absolute top-3 right-3" onClick={handleShowMenu} />
                    <div className="bg-sky-100 p-4 flex flex-col justify-center items-center mt-8">
                        <span className="font-semibold text-color-dark">Muốn đặt sân thể thao - đăng nhập ngay</span>
                        <div className="w-full flex justify-center items-center gap-5 mt-6">
                            <Button className="font-semibold w-32 bg-white text-default-color border-default-color border-solid border rounded-lg" onClick={() => { setShowPopupAuthen(!showPopupAuthen); setStateAuthen(2); setShowMenu(false) }}>Đăng ký</Button>
                            <Button className="font-semibold w-32 rounded-lg" onClick={() => { setShowPopupAuthen(!showPopupAuthen); setStateAuthen(1); setShowMenu(false) }}>Đăng nhập</Button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 mt-3 border-b border-solid border-slate-300 pb-4">
                        <span className="text-gray-500 font-semibold">Khám phá</span>
                        <Link href='/blog' className="flex gap-4 items-center">
                            <BookOpenText />
                            <span className="">Blog</span>
                        </Link>
                        <Link href='/diamond-companies' className="flex gap-4 items-center">
                            <Gem />
                            <span className="">Doanh nghiệp tiêu biểu</span>
                        </Link>
                    </div>
                    <div className="flex flex-col gap-3 mt-3 border-b border-solid border-slate-300 pb-4">
                        <span className="text-gray-500 font-semibold">Tài khoản</span>
                        <Link href="/tai-khoan" className="flex gap-4 items-center">
                            <User />
                            <span className="">Hồ sơ cá nhân</span>
                        </Link>
                        <Link href="/tai-khoan/yeu-thich" className="flex gap-4 items-center">
                            <Heart />
                            <span className="">Danh sách yêu thích</span>
                        </Link>
                        <div className="flex gap-4 items-center">
                            <LogOut />
                            <span className="">Đăng xuất</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 mt-3 border-b border-solid border-slate-300 pb-4">
                        <span className="text-gray-500 font-semibold">Cài đặt</span>
                        <Link href="/help" className="flex gap-4 items-center">
                            <Headset />
                            <span className="">Trợ giúp</span>
                        </Link>
                        <Link href="/" className="flex gap-4 items-center">
                            <Smartphone />
                            <span className="">Tải ứng dụng</span>
                        </Link>
                    </div>
                </div>
            </header>
            <div className="bg-[url('/images/banner.png')] w-full h-96 md:h-400px bg-cover bg-no-repeat bg-bottom px-5 py-12 xl:py-20 flex items-center flex-col gap-5">
                <div className="relative w-full max-w-xl bg-white rounded-lg">
                    <input type="text" placeholder="Nhập từ khóa tìm kiếm..." className="h-12 rounded-xl w-full max-w-xl pl-4" />
                    <Search className="absolute top-3 right-3 text-slate-500" />
                </div>
                <div className="w-full max-w-xl flex flex-col gap-4 lg:gap-0 lg:flex-row select-none">
                    <Combobox listData={listCityRebuild} placeholder={'tỉnh thành'} borderRadius={2} handleFunction={selectCity} />
                    <Combobox listData={listDistrictRebuild} placeholder={'quận huyện'} borderRadius={1} handleFunction={selectDistrict} />
                    <Button className="lg:rounded-l-none h-12 font-semibold">Tìm kiếm</Button>
                </div>
            </div>
            {/* block login, register */}
            {showPopupAuthen ?
                <div className="layout">
                    <div className="max-w-400 h-fit relative flex flex-col justify-center items-center gap-3 bg-white rounded-md w-full pb-6 pt-4 bg-color-dark shadow-color-dark border-dark">
                        <X className="absolute top-4 right-4 cursor-pointer" onClick={() => setShowPopupAuthen(!showPopupAuthen)} />
                        <p className="text-lg font-semibold">{stateAuthen == 1 ? 'Đăng nhập' : `Đăng ký ${typeUserAuthen == 1 ? ' khách hàng' : 'công ty'}`}</p>
                        {stateAuthen != 1 ?
                            <div className="flex w-full">
                                <Button className={`w-1/2 h-10 border-t border-r shadow-none boder-solid border-slate-400 ${typeUserAuthen == 1 ? 'bg-white ' : 'bg-gray-200 hover:bg-white'} text-black rounded-none`} onClick={() => setTypeUserAuthen(1)}>Khách hàng</Button>
                                <Button className={`w-1/2 h-10 border-t border-r shadow-none boder-solid border-slate-400 ${typeUserAuthen == 1 ? 'bg-gray-200 hover:bg-white' : 'bg-white'} text-black rounded-none`} onClick={() => setTypeUserAuthen(2)}>Công ty</Button>
                            </div>
                            : null
                        }
                        <div className="px-12 w-full flex flex-col">
                            <div className="flex gap-4 items-center px-4 py-2 mb-3 rounded-lg border border-solid border-slate-400 cursor-pointer">
                                <Image src='/images/facebook-logo.svg' alt="icon" width={26} height={26} />
                                <p className="text-sm">Đăng {stateAuthen == 1 ? 'nhập' : 'ký'} bằng Facebook</p>
                            </div>
                            <div className="flex gap-4 items-center px-4 py-2 rounded-lg border border-solid border-slate-400 cursor-pointer">
                                <Image src='/images/google-logo.png' alt="icon" width={26} height={26} />
                                <p className="text-sm">Đăng {stateAuthen == 1 ? 'nhập' : 'ký'} bằng Google</p>
                            </div>
                            <p className="text-13px text-center mt-4 mb-1">Hoặc đăng {stateAuthen == 1 ? 'nhập' : 'ký'} bằng số điện thoại, email</p>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="flex flex-col gap-4 mb-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-13px" htmlFor="account">Tài khoản</label>
                                        <input type="text"
                                            placeholder="Nhập email hoặc số điện thoại"
                                            className="bg-slate-100 px-4 py-2 rounded-lg text-color-dark"
                                            id="account"
                                            {...register("account", { required: "Tài khoản không được để trống", validate: validateAccount })}
                                        />
                                        {errors.account?.message && <p className="text-default-color text-13px">{errors.account.message as string}</p>}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-13px" htmlFor="password">Mật khẩu</label>
                                        <input
                                            placeholder="Nhập mật khẩu"
                                            className="bg-slate-100 px-4 py-2 rounded-lg text-color-dark"
                                            id="password"
                                            type="password"
                                            {...register("password", {
                                                required: "Mật khẩu không được để trống",
                                                minLength: { value: 6, message: "Mật khẩu phải ít nhất 6 ký tự" },
                                                validate: validatePassword
                                            })}
                                        />
                                        {errors.password?.message && <p className="text-default-color text-13px">{errors.password.message as string}</p>}
                                    </div>
                                    {stateAuthen == 1 ? null :
                                        <div className="flex flex-col gap-1">
                                            <label className="text-13px" htmlFor="confirmPassword">Nhập lại mật khẩu</label>
                                            <input
                                                placeholder="Nhập lại mật khẩu"
                                                className="bg-slate-100 px-4 py-2 rounded-lg text-color-dark"
                                                id="confirmPassword"
                                                type="password"
                                                {...register("confirmPassword", {
                                                    required: "Nhập lại mật khẩu là bắt buộc",
                                                    validate: validateConfirmPassword
                                                })}
                                            />
                                            {errors.confirmPassword?.message && <p className="text-default-color text-13px">{errors.confirmPassword.message as string}</p>}
                                        </div>
                                    }
                                    {!stateApiAuthen ?
                                        <p className="text-13px text-default-color">{notiErrorAuthen}</p>
                                        : null
                                    }
                                </div>
                                <div className="flex justify-center">
                                    <Button className="m-auto" type="submit">Đăng {stateAuthen == 1 ? 'nhập' : 'ký'}</Button>
                                </div>
                                {stateAuthen == 1 ?
                                    <div className="text-center mt-3">
                                        <p className="text-sky-500 mb-2 cursor-pointer">Khôi phục mật khẩu</p>
                                        <div>
                                            <span>Chưa có tài khoản?</span>
                                            <span className="text-sky-500 ml-2 cursor-pointer" onClick={() => setStateAuthen(2)}>Đăng ký</span>
                                        </div>
                                    </div>
                                    : <div className="text-center mt-3">
                                        <span>Bạn đã có tài khoản?</span>
                                        <span className="text-sky-500 ml-2 cursor-pointer" onClick={() => setStateAuthen(1)}>Đăng nhập</span>
                                    </div>
                                }
                            </form>
                        </div>
                    </div>
                </div>
                : null
            }
            {/* loading animate */}
            {loading ? <LoadingAnimate /> : null}
        </>
    )
}