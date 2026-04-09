'use client';

import { X } from 'lucide-react';
import { Button } from './ui/button';
import { changePassword, changePasswordV2 } from '@/app/api/user';
import { useForm } from "react-hook-form";
import { validatePassword } from "@/utilities/functions";
import { useState } from 'react';

type FormValues = {
    passwordOld: string;
    passwordNew: string;
    passwordConfirm: string;
};

export default function ChangePasswordModal({ open, onClose, type, account, closeModal }: any) {
    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormValues>();
    const [errorApi, setErrorApi] = useState('')

    const onSubmit = async (data: FormValues) => {
        try {
            if (type == 1) {
                const res = await changePassword({
                    passwordOld: data.passwordOld,
                    passwordNew: data.passwordNew,
                    passwordConfirm: data.passwordConfirm,
                });
                if (res.success) {
                    alert('✅ Đổi mật khẩu thành công');
                    handleClose();
                } else {
                    setErrorApi(res.message || 'Lỗi đổi mật khẩu')
                }
            } else {
                const res = await changePasswordV2({
                    account: account,
                    passwordNew: data.passwordNew,
                });
                if (res.success) {
                    alert('✅ Đổi mật khẩu thành công');
                    handleClose();
                    closeModal();
                } else {
                    setErrorApi(res.message || 'Lỗi đổi mật khẩu')
                }
            }
        } catch (err: any) {
            setErrorApi(err.message || 'Đã có lỗi xảy ra');
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!open) return null;

    return (
        <div className="layout">
            <div className="bg-white p-6 rounded-xl w-11/12 md:w-full max-w-md relative dark:bg-[black] dark:border dark:border-[gray]" onClick={() => setErrorApi('')}>
                <X
                    className="absolute top-3 right-3 cursor-pointer"
                    onClick={() => {
                        handleClose();
                        if (type == 2) {
                            closeModal();
                        }
                    }}
                />
                <h2 className="text-lg font-bold mb-4">Đổi mật khẩu</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {type == 1 &&
                        <>
                            <input
                                type="password"
                                placeholder="Mật khẩu cũ"
                                className="w-full mb-3 p-2 border rounded"
                                {...register('passwordOld', { required: 'Vui lòng nhập mật khẩu cũ' })}
                            />
                            {errors.passwordOld && <p className="text-red-600 text-sm mb-2">{errors.passwordOld.message}</p>}
                        </>
                    }
                    <input
                        type="password"
                        placeholder="Mật khẩu mới"
                        className="w-full mb-3 p-2 border rounded"
                        {...register('passwordNew', {
                            required: 'Vui lòng nhập mật khẩu mới',
                            minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                            validate: value => validatePassword ? validatePassword(value) : true
                        })}
                    />
                    {errors.passwordNew && <p className="text-red-600 text-sm mb-2">{errors.passwordNew.message}</p>}

                    <input
                        type="password"
                        placeholder="Xác nhận mật khẩu mới"
                        className="w-full mb-4 p-2 border rounded"
                        {...register('passwordConfirm', {
                            required: 'Vui lòng nhập lại mật khẩu mới để xác nhận',
                            validate: value => value === watch('passwordNew') || 'Mật khẩu xác nhận không khớp'
                        })}
                    />
                    {errors.passwordConfirm && <p className="text-red-600 text-sm mb-2">{errors.passwordConfirm.message}</p>}

                    {errorApi && <p className="text-red-600 text-sm mb-2">{errorApi}</p>}


                    <Button className="w-full" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
