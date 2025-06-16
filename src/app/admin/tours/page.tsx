'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface Project {
    projectId: number;
    title: string;
    price: number;
    departureDate: string;
    userId: string;
}

export default function ProjectManagementPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');

    const fetchProjects = async () => {
        const token = Cookies.get('SSToken');
        const res = await fetch(
            `http://localhost:8000/api/admin/listProjects?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
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
        await fetch(`http://localhost:8000/api/admin/project/${projectId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchProjects();
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">
                Quản lý tour <span className="text-blue-600">({total})</span>
            </h1>

            <div className="mb-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Tìm theo tên, ngày đi, giá..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border px-3 py-2 rounded w-full max-w-md"
                />
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={() => {
                        setPage(1);
                        fetchProjects();
                    }}
                >
                    Tìm
                </button>
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
                            <td className="border px-2"><a href={`http://localhost:3000/tour/${p.projectId}`} target='_blank'>{p.title}</a></td>
                            <td className="border px-2 flex gap-2">
                                <button className="">
                                    Sửa
                                </button>
                                <button onClick={() => handleDelete(p.projectId)} className="text-red-600">
                                    Xoá
                                </button>
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
