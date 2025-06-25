'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { API_BASE_URL, BASE_URL } from '@/utilities/config';

interface Project {
    projectId: number;
    title: string;
    price: number;
    departureDate: string;
    userId: string;
    isLock: Boolean
}

export default function ProjectManagementPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [searchParams, setSearchParams] = useState({
        projectId: '',
        title: '',
        isLock: ''
    });

    const fetchProjects = async () => {
        const token = Cookies.get('SSToken');
        const query = new URLSearchParams();
        query.set('page', page.toString());
        query.set('limit', limit.toString());
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value) query.set(key, value);
        });
        const res = await fetch(
            `${API_BASE_URL}/api/admin/projects?${query.toString()}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        const data = await res.json();
        if (data.success) {
            setProjects(data.projects);
            setTotal(data.totalCount);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [page]);

    const handleDelete = async (projectId: number) => {
        const token = Cookies.get('SSToken');
        if (!confirm('Bạn có chắc chắn muốn xoá tour này?')) return;
        await fetch(`${API_BASE_URL}/api/admin/project/${projectId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchProjects();
    };

    const toggleLockProject = async (projectId: number) => {
        const token = Cookies.get('SSToken');
        try {
            await fetch(`${API_BASE_URL}/api/admin/project/${projectId}/lock`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProjects(); // reload lại danh sách
        } catch (err) {
            alert('Lỗi khi khoá/mở tour');
            console.error(err);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">
                Quản lý tour / Tổng số <span className="text-blue-600">({total})</span> tour
            </h1>

            <div className="mb-4 flex gap-3 flex-wrap">
                <input
                    type="text"
                    placeholder="ID tour"
                    value={searchParams.projectId}
                    onChange={(e) =>
                        setSearchParams((prev) => ({ ...prev, projectId: e.target.value }))
                    }
                    className="border px-3 py-2 rounded w-2xs"
                />
                <input
                    type="text"
                    placeholder="Tên tour"
                    value={searchParams.title}
                    onChange={(e) =>
                        setSearchParams((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="border px-3 py-2 rounded w-3xl"
                />
                <select
                    value={searchParams.isLock}
                    onChange={(e) =>
                        setSearchParams((prev) => ({ ...prev, isLock: e.target.value }))
                    }
                    className="border px-3 py-2 rounded w-2xs"
                >
                    <option value="">Tình trạng</option>
                    <option value="true">Đã khoá</option>
                    <option value="false">Chưa khoá</option>
                </select>

                <div className="md:col-span-3">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                        onClick={() => {
                            setPage(1);
                            fetchProjects();
                        }}
                    >
                        Tìm kiếm
                    </button>
                </div>
            </div>

            <table className="w-full border text-sm">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border px-2 py-1">ID</th>
                        <th className="border px-2 py-1">Tiêu đề</th>
                        <th className="border px-2 py-1">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map((p) => (
                        <tr key={p.projectId}>
                            <td className="border px-2 text-center">{p.projectId}</td>
                            <td className="border px-2"><a href={`${BASE_URL}/tour/${p.projectId}`} target='_blank'>{p.title}</a></td>
                            <td className="border px-2 flex gap-2">
                                <button className="">Sửa</button>
                                <button
                                    onClick={() => toggleLockProject(p.projectId)}
                                    className={p.isLock ? 'text-yellow-600' : 'text-green-600'}
                                >
                                    {p.isLock ? 'Mở khoá' : 'Khoá'}
                                </button>
                                <button onClick={() => handleDelete(p.projectId)} className="text-red-600">Xoá</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-4 flex gap-4 items-center">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Trang trước
                </button>
                <span>
                    Trang {page} / {Math.ceil(total / limit)}
                </span>
                <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.ceil(total / limit)}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Trang sau
                </button>
            </div>
        </div>
    );
}
