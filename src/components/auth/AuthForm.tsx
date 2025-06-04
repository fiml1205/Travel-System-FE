'use client';

import { useForm } from "react-hook-form";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import LoadingAnimate from '@/components/loadingAnimate'
import { loginApi, registerApi } from '@/app/api/authentication';
import { validatePhone, validateEmail, validateNoSqli, validatePassword } from "@/utilities/functions";
import { useState } from "react";

export default function AuthForm({
  mode = 1, // 1: login, 2: register
  userType = 1, // 1: customer, 2: company
  onSuccess,
}: {
  mode?: number;
  userType?: number;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

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
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="px-12 w-full flex flex-col">
        {/* Social buttons */}
        <div className="flex gap-4 items-center px-4 py-2 mb-3 rounded-lg border border-solid border-slate-400 cursor-pointer">
          <Image src='/images/facebook-logo.svg' alt="icon" width={26} height={26} />
          <p className="text-sm">Đăng {mode === 1 ? 'nhập' : 'ký'} bằng Facebook</p>
        </div>
        <div className="flex gap-4 items-center px-4 py-2 rounded-lg border border-solid border-slate-400 cursor-pointer">
          <Image src='/images/google-logo.png' alt="icon" width={26} height={26} />
          <p className="text-sm">Đăng {mode === 1 ? 'nhập' : 'ký'} bằng Google</p>
        </div>
        <p className="text-13px text-center mt-4 mb-1">Hoặc đăng {mode === 1 ? 'nhập' : 'ký'} bằng số điện thoại, email</p>

        <div className="flex flex-col gap-4 mb-4">
          <div>
            <label className="text-13px">Tài khoản</label>
            <input
              type="text"
              className="bg-slate-100 px-4 py-2 rounded-lg text-color-dark w-full"
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
              className="bg-slate-100 px-4 py-2 rounded-lg text-color-dark w-full"
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
                className="bg-slate-100 px-4 py-2 rounded-lg text-color-dark w-full"
                {...register("confirmPassword", {
                  required: "Bắt buộc nhập lại mật khẩu",
                  validate: validateConfirmPassword,
                })}
              />
              {errors.confirmPassword && <p className="text-default-color text-13px">{errors.confirmPassword.message as string}</p>}
            </div>
          )}

          {error && <p className="text-13px text-default-color">{error}</p>}
        </div>

        <div className="flex justify-center">
          <Button type="submit" className="m-auto">Đăng {mode === 1 ? 'nhập' : 'ký'}</Button>
        </div>
      </form>
      {loading && <LoadingAnimate />}
    </>
  );
}
