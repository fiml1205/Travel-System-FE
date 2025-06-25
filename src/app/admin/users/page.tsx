'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import Cookies from 'js-cookie';
import { API_BASE_URL, BASE_URL } from '@/utilities/config';

interface User {
  userId: number;
  account: string;
  userName: string;
  email: string;
  type: number;
  address: string;
  phone: string
}

export default function UserManagementPage() {
  const userInfor = useUser();
  const token = Cookies.get('SSToken')
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchParams, setSearchParams] = useState({
    userId: '',
    account: '',
    userName: '',
    email: '',
    phone: '',
    userType: ''
  });

  const fetchUsers = async () => {
    const query = new URLSearchParams();
    query.set('page', page.toString());
    query.set('limit', limit.toString());
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    const res = await fetch(`${API_BASE_URL}/api/admin/users?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setUsers(data.users);
    setTotal(data.totalCount);
  };

  useEffect(() => {
    if (!userInfor || userInfor.type != 0) {
      window.location.href = '/'
    }
    fetchUsers();
  }, [page]);

  const handleDelete = async (id: number) => {
    const token = Cookies.get('SSToken');
    if (!confirm('Bạn có chắc chắn muốn xoá người dùng này?')) return;

    try {
      await fetch(`${API_BASE_URL}/api/admin/user/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error('Lỗi xoá:', err);
      alert('Lỗi khi xoá user');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Quản lý người dùng / Tổng số: <span className="text-blue-600">({total})</span> user</h1>
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <input placeholder="User ID"
          className="border px-3 py-2 rounded"
          value={searchParams.userId}
          onChange={(e) => setSearchParams(prev => ({ ...prev, userId: e.target.value }))}
        />
        <input placeholder="Tài khoản"
          className="border px-3 py-2 rounded"
          value={searchParams.account}
          onChange={(e) => setSearchParams(prev => ({ ...prev, account: e.target.value }))}
        />
        <input placeholder="Tên người dùng"
          className="border px-3 py-2 rounded"
          value={searchParams.userName}
          onChange={(e) => setSearchParams(prev => ({ ...prev, userName: e.target.value }))}
        />
        <input placeholder="Email"
          className="border px-3 py-2 rounded"
          value={searchParams.email}
          onChange={(e) => setSearchParams(prev => ({ ...prev, email: e.target.value }))}
        />
        <input placeholder="Số điện thoại"
          className="border px-3 py-2 rounded"
          value={searchParams.phone}
          onChange={(e) => setSearchParams(prev => ({ ...prev, phone: e.target.value }))}
        />
        <select
          className="border px-3 py-2 rounded"
          value={searchParams.userType}
          onChange={(e) => setSearchParams(prev => ({ ...prev, userType: e.target.value }))}
        >
          <option value="">Loại người dùng</option>
          <option value="1">Khách</option>
          <option value="2">Công ty</option>
        </select>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
          onClick={() => {
            setPage(1);
            fetchUsers();
          }}
        >
          Tìm
        </button>
      </div>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Tài khoản</th>
            <th className="border px-2 py-1">Tên</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Phone</th>
            <th className="border px-2 py-1">Address</th>
            <th className="border px-2 py-1">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.userId}>
              <td className="border px-2 text-center">{user.userId}</td>
              <td className="border px-2 text-center">{user.account}</td>
              <td className="border px-2 text-center">{user.userName}</td>
              <td className="border px-2 text-center">{user.email}</td>
              <td className="border px-2 text-center">{user.phone}</td>
              <td className="border px-2 text-center">{user.address}</td>
              <td className="border px-2 flex gap-2 justify-center">
                <button onClick={() => setEditingUser(user)}>Sửa</button>
                <button onClick={() => handleDelete(user.userId)} className="text-red-600">Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Trang trước
        </button>
        <span>
          Trang {page} / {Math.ceil(total / limit)}
        </span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page >= Math.ceil(total / limit)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Trang sau
        </button>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 layout">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Sửa người dùng</h2>

            <input
              value={editingUser.userName || ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser, userName: e.target.value })
              }
              placeholder="Tên người dùng"
              className="w-full border mb-2 p-2 rounded"
            />

            <input
              value={editingUser.email || ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
              placeholder="Email"
              className="w-full border mb-2 p-2 rounded"
            />

            <input
              value={editingUser.phone || ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser, phone: e.target.value })
              }
              placeholder="Số điện thoại"
              className="w-full border mb-2 p-2 rounded"
            />

            <input
              value={editingUser.address || ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser, address: e.target.value })
              }
              placeholder="Địa chỉ"
              className="w-full border mb-2 p-2 rounded"
            />

            <div className="flex justify-end gap-3 mt-3">
              <button
                onClick={() => setEditingUser(null)}
                className="px-3 py-1 border rounded"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  const token = Cookies.get('SSToken');
                  await fetch(`${API_BASE_URL}/api/admin/user/${editingUser.userId}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(editingUser),
                  });
                  setEditingUser(null);
                  fetchUsers();
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
