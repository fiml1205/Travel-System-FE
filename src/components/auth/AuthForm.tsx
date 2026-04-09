'use client';

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import LoadingAnimate from '@/components/loadingAnimate'
import { loginApi, registerApi } from '@/app/api/user';
import { validatePhone, validateEmail, validateNoSqli, validatePassword } from "@/utilities/functions";
import { useState } from "react";
import { API_BASE_URL } from "@/utilities/config";
import ChangePasswordModal from "../ChangePasswordModal";

export default function AuthForm({
  mode = 1,
  userType = 1,
  closeModal,
  onSuccess,
  setMode,
}: {
  mode?: number;
  userType?: number;
  closeModal?: any;
  onSuccess?: () => void;
  setMode: (mode: number) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [step, setStep] = useState(1);
  const [accountValue, setAccountValue] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  const validateAccount = (value: string) =>
    (validateEmail(value) || validatePhone(value)) && validateNoSqli(value)
      ? true
      : "Tài khoản phải là email, số điện thoại hợp lệ và không chứa ký tự cấm";

  const validateConfirmPassword = (value: string) => {
    const password = watch("password");
    return value === password || "Mật khẩu nhập lại không khớp";
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 1) {
        await loginApi(data);
      } else {
        await registerApi({ ...data, type: userType });
      }
      onSuccess?.();
    } catch (err: any) {
      console.log(err)
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const onCheckAccount = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/checkAccountExist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: data.account }),
      });
      const dataRes = await res.json();
      if (dataRes.exists) {
        setAccountValue(data.account);
        setShowChangePassword(true)
        setStep(2);
      } else {
        setError("Tài khoản không tồn tại!");
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (mode === 3) {
    if (step === 1) {
      // Form nhập tài khoản
      return (
        <form onSubmit={handleSubmit(onCheckAccount)} className="px-12 w-full flex flex-col">
          <p className="text-13px text-center mt-4 mb-4 font-semibold">Quên mật khẩu</p>
          <div className="flex flex-col gap-4 mb-4">
            <div>
              <label className="text-13px">Tài khoản (email hoặc số điện thoại)</label>
              <input
                type="text"
                className="bg-slate-100 px-4 py-2 rounded-lg text-color-dark w-full mt-1 dark:border dark:border-[gray] dark:bg-[black]"
                {...register("account", {
                  required: "Không được để trống",
                  validate: validateAccount,
                })}
              />
              {errors.account && <p className="text-default-color text-13px">{errors.account.message as string}</p>}
            </div>
            {error && <p className="text-default-color">{error}</p>}
          </div>
          <div className="flex justify-center gap-4">
            <Button type="submit" className="m-auto">Tiếp tục</Button>
            <Button type="button" variant="outline" onClick={() => setMode(1)}>Quay lại</Button>
          </div>
          {loading && <LoadingAnimate />}
        </form>
      );
    }
    if (step === 2) {
      // Form đổi mật khẩu mới
      return (
        <ChangePasswordModal
          open={showChangePassword}
          onClose={() => setShowChangePassword(false)}
          type={2}
          account={accountValue}
          closeModal={closeModal}
        />
      );
    }
    if (step === 3) {
      // Thông báo thành công
      return (
        <div className="px-12 w-full flex flex-col items-center py-8">
          <p className="text-green-600 text-center mb-3 font-semibold">Đổi mật khẩu thành công! Vui lòng đăng nhập lại.</p>
          <Button onClick={() => setMode(1)}>Về trang đăng nhập</Button>
        </div>
      );
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="px-12 w-full flex flex-col">
        {/* Social buttons */}
        {/* <div className="flex gap-4 items-center px-4 py-2 mb-3 rounded-lg border border-solid border-slate-400 cursor-pointer">
          <Image src='/images/facebook-logo.svg' alt="icon" width={26} height={26} />
          <p className="text-sm">Đăng {mode === 1 ? 'nhập' : 'ký'} bằng Facebook</p>
        </div>
        <div className="flex gap-4 items-center px-4 py-2 rounded-lg border border-solid border-slate-400 cursor-pointer">
          <Image src='/images/google-logo.png' alt="icon" width={26} height={26} />
          <p className="text-sm">Đăng {mode === 1 ? 'nhập' : 'ký'} bằng Google</p>
        </div>
        <p className="text-13px text-center mt-4 mb-1">Hoặc đăng {mode === 1 ? 'nhập' : 'ký'} bằng số điện thoại, email</p> */}
        <p className="text-13px text-center mt-4 mb-1">Đăng {mode === 1 ? 'nhập' : 'ký'} bằng số điện thoại, email</p>
        <div className="flex flex-col gap-4 mb-4">
          <div>
            <label className="text-13px">Tài khoản</label>
            <input
              type="text"
              className="bg-slate-100 px-4 py-2 rounded-lg text-color-dark w-full mt-1 dark:border dark:border-[gray] dark:bg-[black]"
              {...register("account", {
                required: "Tài khoản không được để trống",
                validate: validateAccount,
              })}
            />
            {errors.account && <p className="text-default-color text-13px">{errors.account.message as string}</p>}
          </div>

          <div>
            <label className="text-13px">Mật khẩu</label>
            <input
              type="password"
              className="bg-slate-100 px-4 py-2 rounded-lg text-color-dark w-full mt-1 dark:border dark:border-[gray] dark:bg-[black]"
              {...register("password", {
                required: "Mật khẩu không được để trống",
                minLength: { value: 6, message: "Tối thiểu 6 ký tự" },
                validate: validatePassword,
              })}
            />
            {errors.password && <p className="text-default-color text-13px">{errors.password.message as string}</p>}
          </div>

          {mode === 2 && (
            <div>
              <label className="text-13px">Nhập lại mật khẩu</label>
              <input
                type="password"
                className="bg-slate-100 px-4 py-2 rounded-lg text-color-dark w-full mt-1 dark:border dark:border-[gray] dark:bg-[black]"
                {...register("confirmPassword", {
                  required: "Bắt buộc nhập lại mật khẩu",
                  validate: validateConfirmPassword,
                })}
              />
              {errors.confirmPassword && <p className="text-default-color text-13px">{errors.confirmPassword.message as string}</p>}
            </div>
          )}

          {error && <p className="text-default-color">{error}</p>}
        </div>
        <div className="text-center mt-2 text-sm mb-2">
          {mode === 1 && (
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => setMode(3)}
            >
              Quên mật khẩu?
            </span>
          )}
        </div>
        <div className="flex justify-center">
          <Button type="submit" className="m-auto">Đăng {mode === 1 ? 'nhập' : 'ký'}</Button>
        </div>
        <div className="text-center mt-4 text-sm">
          {mode === 1 ? (
            <>
              Chưa có tài khoản?{" "}
              <span
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() => setMode(2)}
              >
                Đăng ký
              </span>
            </>
          ) : (
            <>
              Đã có tài khoản?{" "}
              <span
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() => setMode(1)}
              >
                Đăng nhập
              </span>
            </>
          )}
        </div>
      </form>
      {loading && <LoadingAnimate />}
    </>
  );
}
