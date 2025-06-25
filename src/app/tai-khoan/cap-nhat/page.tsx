'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { updateInfor, updateAvatar } from '@/app/api/user';
import { Button } from '@/components/ui/button';\
import { API_BASE_URL } from '@/utilities/config';

export default function UpdateUserPage() {
    const router = useRouter();
    const userInfor = useUser();

    const [user, setUser] = useState<any>(null);
    const [form, setForm] = useState({
        userName: '',
        email: '',
        phone: '',
        address: '',
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    useEffect(() => {
        if (userInfor) {
            setForm({
                userName: userInfor.userName || '',
                email: userInfor.email || '',
                phone: userInfor.phone || '',
                address: userInfor.address || '',
            });
            setAvatarPreview(userInfor.avatar || null);
        } else {
            window.location.href = '/'
        }
    }, []);

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const res = await updateInfor(form)
            if (res.success) {
                alert('✅ Cập nhật thành công!');
                router.refresh();
            } else {
                alert(res.message || 'Lỗi cập nhật');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi server');
        }
    };

    function getAvatarSrc(preview?: string | null): string {
        if (!preview) return '/default-avatar.png';
        if (preview.startsWith('blob:')) return preview;
        return `${API_BASE_URL}${preview}`;
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleUploadAvatar = async () => {
        if (!avatarFile) return alert('Vui lòng chọn ảnh');

        const formData = new FormData();
        formData.append('avatar', avatarFile);

        try {
            const data = await updateAvatar(formData);

            if (data.success) {
                alert('✅ Upload avatar thành công');
                setAvatarPreview(data.avatar);
                const updatedUser = { ...user, avatar: data.avatar };
                setUser(updatedUser);
                localStorage.setItem('userInfor', JSON.stringify(updatedUser));
            } else {
                alert(data.message || 'Lỗi khi upload avatar');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi server khi upload avatar');
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto py-6">
            <h1 className="text-xl font-bold mb-4">Cập nhật thông tin cá nhân</h1>

            {/* Ảnh avatar */}
            <div className="mb-6 text-center">
                <img
                    src={getAvatarSrc(avatarPreview)}
                    alt="avatar"
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-2 border"
                />
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
                <button
                    className="mt-2 px-4 py-1 bg-blue-600 text-white rounded"
                    onClick={handleUploadAvatar}
                >
                    Đổi avatar
                </button>
            </div>

            {/* Form thông tin */}
            <div className="space-y-4">
                <input
                    name="userName"
                    value={form.userName}
                    onChange={handleChange}
                    placeholder="Họ tên"
                    className="w-full p-2 border rounded"
                />
                <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full p-2 border rounded"
                />
                <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Số điện thoại"
                    className="w-full p-2 border rounded"
                />
                <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Địa chỉ (ví dụ: 123 Nguyễn Văn Cừ, Q.5, TP.HCM)"
                    className="w-full p-2 border rounded"
                />
            </div>

            <Button
                onClick={handleSubmit}
                className="mt-6 w-full py-2"
            >
                Lưu thay đổi
            </Button>
        </div>
    );
}
