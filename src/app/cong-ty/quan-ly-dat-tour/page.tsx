// @ts-nocheck

'use client'

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getListProjectOwn } from '@/app/api/project';
import { getTourBookings } from '@/app/api/notification';
import { API_BASE_URL } from "@/utilities/config";

const TOUR_LIMIT = 10;
const BOOKING_LIMIT = 10;

export default function ManagerTourBookingPage() {
    const [managerTours, setManagerTours] = useState([]);
    const [tourPage, setTourPage] = useState(1);
    const [hasMoreTour, setHasMoreTour] = useState(true);
    const [loadingTour, setLoadingTour] = useState(false);

    const [openTour, setOpenTour] = useState<string | null>(null); // id tour đang xổ
    const [bookingsByTourId, setBookingsByTourId] = useState({});
    const [bookingPageByTourId, setBookingPageByTourId] = useState({});
    const [hasMoreBookingByTourId, setHasMoreBookingByTourId] = useState({});
    const [loadingBookingByTourId, setLoadingBookingByTourId] = useState({});

    const [updatingContact, setUpdatingContact] = useState({});

    // Load 10 tour quản lý mỗi lần
    const fetchManagerTours = async (pageNum = 1) => {
        setLoadingTour(true);
        try {
            const res = await getListProjectOwn({ page: pageNum, limit: TOUR_LIMIT });
            const newProject = res?.data.listProject;
            setManagerTours(prev => pageNum === 1 ? newProject : [...prev, ...newProject]);
            setHasMoreTour(newProject.length === TOUR_LIMIT);
        } finally {
            setLoadingTour(false);
        }
    };

    // Load booking của tour, page booking riêng cho từng tour
    const fetchTourBookings = async (projectId: any, pageNum = 1) => {
        setLoadingBookingByTourId(prev => ({ ...prev, [projectId]: true }));
        try {
            const res = await getTourBookings({ projectId, page: pageNum, limit: BOOKING_LIMIT });
            setBookingsByTourId(prev => ({
                ...prev,
                [projectId]: pageNum === 1 ? res.bookings : [...(prev[projectId] || []), ...res.bookings],
            }));
            setHasMoreBookingByTourId(prev => ({
                ...prev,
                [projectId]: res.bookings.length === BOOKING_LIMIT
            }));
            setBookingPageByTourId(prev => ({
                ...prev,
                [projectId]: pageNum
            }));
        } finally {
            setLoadingBookingByTourId(prev => ({ ...prev, [projectId]: false }));
        }
    };

    useEffect(() => {
        fetchManagerTours(1);
    }, []);

    // Accordion: khi xổ 1 tour thì load bookings nếu chưa có
    const handleOpenTour = (projectId: any) => {
        if (openTour === projectId) {
            setOpenTour(null);
        } else {
            setOpenTour(projectId);
            if (!bookingsByTourId[projectId]) {
                fetchTourBookings(projectId, 1);
            }
        }
    };

    const handleToggleContact = async (bookingId: any, currentStatus: any, projectId: any) => {
        setUpdatingContact(prev => ({ ...prev, [bookingId]: true }));
        try {
            await fetch(`${API_BASE_URL}/api/notification/toggleContact`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId, isContact: !currentStatus })
            });
            setBookingsByTourId(prev => ({
                ...prev,
                [projectId]: prev[projectId].map((b: any) =>
                    b._id === bookingId ? { ...b, isContact: !currentStatus } : b
                )
            }));
        } finally {
            setUpdatingContact(prev => ({ ...prev, [bookingId]: false }));
        }
    };

    return (
        <div className="w-full md:w-3/5 mx-auto p-4 sm:p-6">
            <h1 className="text-2xl font-bold mb-4">Danh sách đặt tour</h1>
            <div className="space-y-2">
                {managerTours.map((project, idx) => (
                    <div key={idx} className="border rounded-xl shadow">
                        <button
                            className="w-full flex items-center justify-between p-4 transition"
                            onClick={() => handleOpenTour(project.projectId)}
                        >
                            <div>
                                <span className="font-semibold">{project.title}</span>
                            </div>
                            {openTour === project.projectId ? <ChevronDown /> : <ChevronRight />}
                        </button>
                        {/* Xổ danh sách booking */}
                        {openTour === project.projectId && (
                            <div className="p-4 border-t bg-gray-50 animate-fade-in dark:bg-[black]">
                                {loadingBookingByTourId[project.projectId] && (
                                    <div>Đang tải...</div>
                                )}
                                {bookingsByTourId[project.projectId] && bookingsByTourId[project.projectId].length > 0 && (
                                    <div className="w-full overflow-x-auto">
                                        <table className="w-full text-sm mb-2 dark:bg-[black]">
                                            <thead>
                                                <tr className="bg-gray-200 dark:bg-[black]">
                                                    <th className="py-1 px-2 text-left md:w-[40px]">STT</th>
                                                    <th className="py-1 px-2 text-left md:w-[150px]">Tên</th>
                                                    <th className="py-1 px-2 text-left md:w-[120px]">Phone</th>
                                                    <th className="py-1 px-2 text-left truncate md:w-[200px]">Email</th>
                                                    <th className="py-1 px-2 text-left min-w-[200px]">Ghi chú</th>
                                                    <th className="py-1 px-2 text-left min-w-[120px] md:w-[120px]">Liên hệ?</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bookingsByTourId[project.projectId].map((b: any, i: any) => (
                                                    <tr key={b._id || i} className="odd:bg-white even:bg-gray-100 dark:bg-[black] dark:even:bg-gray-800">
                                                        <td className="py-1 px-2">{i + 1}</td>
                                                        <td className="py-1 px-2">{b.name}</td>
                                                        <td className="py-1 px-2">{b.phone}</td>
                                                        <td className="py-1 px-2">{b.email}</td>
                                                        <td className="py-1 px-2">{b.note}</td>
                                                        <td className="py-1 px-2">
                                                            <button
                                                                onClick={() => handleToggleContact(b._id, b.isContact, project.projectId)}
                                                                disabled={updatingContact[b._id]}
                                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs gap-1 transition-all 
                                                                    ${b.isContact
                                                                        ? 'bg-green-100 text-green-700 border border-green-400'
                                                                        : 'bg-gray-100 text-gray-500 border border-gray-300 hover:bg-green-200 hover:text-green-700'}
                                                                        `}
                                                                title={b.isContact ? "Click để chuyển thành Chưa liên hệ" : "Click để chuyển thành Đã liên hệ"}
                                                            >
                                                                {updatingContact[b._id] ? (
                                                                    <span>...</span>
                                                                ) : b.isContact ? (
                                                                    <>
                                                                        <span>✔</span>Đã liên hệ
                                                                    </>
                                                                ) : (
                                                                    <>Chưa liên hệ</>
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {hasMoreBookingByTourId[project.projectId] && (
                                            <div className="flex justify-center mt-6">
                                            <Button
                                                onClick={() =>
                                                    fetchTourBookings(
                                                        project.projectId,
                                                        (bookingPageByTourId[project.projectId] || 1) + 1
                                                    )
                                                }
                                                disabled={loadingBookingByTourId[project.projectId]}
                                            >
                                                {loadingBookingByTourId[project.projectId] ? "Đang tải..." : "Xem thêm"}
                                            </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {/* Không có booking */}
                                {bookingsByTourId[project.projectId] && bookingsByTourId[project.projectId].length === 0 && (
                                    <div className="text-gray-400">Chưa có lượt đặt tour nào</div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {/* Phân trang tour */}
            <div className="flex justify-center mt-6">
                {hasMoreTour && (
                    <Button onClick={() => {
                        fetchManagerTours(tourPage + 1);
                        setTourPage(tourPage + 1);
                    }} disabled={loadingTour}>
                        {loadingTour ? "Đang tải..." : "Xem thêm tour"}
                    </Button>
                )}
            </div>
        </div>
    );
}
