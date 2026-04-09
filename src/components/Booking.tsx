import { useState } from "react";
import { useUser } from '@/contexts/UserContext';
import { createNoti } from '@/app/api/notification';

export default function Booking({ project, setIsBooking }: any) {
    const userInfor = useUser();
    const [name, setName] = useState(userInfor ? userInfor.userName : '');
    const [phone, setPhone] = useState(userInfor ? userInfor.phone : '');
    const [email, setEmail] = useState(userInfor ? userInfor.email : '');
    const [note, setNote] = useState('');
    const [error, setError] = useState(false);
    const handleBooking = async () => {
        if (!name || !phone) {
            setError(true);
            return
        }
        setError(false);
        // handle booking
        const message = `${name} vừa đăng ký tư vấn đặt tour. Liên hệ qua ${phone}"`;
        try {
            await createNoti({
                projectId: project.projectId,
                projectName: project.title,
                userIdTour: project.userId,
                userId: userInfor?.userId || '',
                name: name,
                phone: phone,
                email: email,
                note: note,
                message: message,
            });
            alert(`✅ Nhân viên sẽ liên hệ tư vấn cho bạn qua ${phone} sớm nhất có thể. Xin cảm ơn!`);
            setIsBooking(false)
        } catch (error) {
            console.error(error);
            alert('❌ Gửi thông báo thất bại. Vui lòng thử lại sau.');
        }
    }

    return (
        <div>

            <div className="layout">
                <div className="bg-white p-6 pt-4 rounded-lg md:w-full max-w-md dark:bg-[black] dark:border dark:boder-[gray] w-11/12">
                    <h2 className="text-[20px] font-semibold mb-3 text-center">Đặt tour</h2>
                    <span className="text-[gray]">Chúng tôi sẽ liên hệ tư vấn cho bạn ngay khi nhận được yêu cầu. Vui lòng cung cấp các thông tin dưới đây.</span>
                    <div className="flex flex-col gap-1 mt-3">
                        <label htmlFor="name">Họ và tên <span className="text-[red]">*</span></label>
                        <input type="text" id="name" className="h-[44] rounded-[4] pb-1.5 pt-1.5 pl-3 pr-3 border" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1 mt-3">
                        <label htmlFor="name">Số điện thoại <span className="text-[red]">*</span></label>
                        <input type="text" id="name" className="h-[44] rounded-[4] pb-1.5 pt-1.5 pl-3 pr-3 border" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1 mt-3">
                        <label htmlFor="name">Email</label>
                        <input type="text" id="name" className="h-[44] rounded-[4] pb-1.5 pt-1.5 pl-3 pr-3 border" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1 mt-3">
                        <label htmlFor="name">Ghi chú</label>
                        <input type="text" id="name" className="h-[44] rounded-[4] pb-1.5 pt-1.5 pl-3 pr-3 border" onChange={(e) => setNote(e.target.value)} />
                    </div>
                    {error && <p className="text-default-color mt-3">Bạn cần điền đầy đủ thông tin tên và số điện thoại</p>}
                    <div className="flex justify-center gap-10 mt-6">
                        <button onClick={() => setIsBooking(false)} className="px-4 py-2 rounded border cursor-pointer">Hủy</button>
                        <button
                            onClick={handleBooking}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                        >
                            Gửi yêu cầu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}