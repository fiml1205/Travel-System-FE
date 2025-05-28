'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BlockImage360 from '@/components/post-new/BlockImage360';
import { Button } from '@/components/ui/button';

export default function EditTourPage() {
  const params = useParams();
  const projectId: any = params?.slug;
  const [loading, setLoading] = useState(true);
  const [scenes, setScenes] = useState([]);
  const [userId, setUserId] = useState('');
  const [tour, setTour] = useState({
    title: '',
    description: '',
    departureDate: '',
    price: 0,
    tourSteps: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`http://localhost:8000/api/project/${projectId}`);
      const data = await res.json();

      setTour({
        title: data.title,
        description: data.description,
        departureDate: data.departureDate,
        price: data.price,
        tourSteps: data.tourSteps || [],
      });

      setUserId(data.userId);
      setScenes(data.scenes || []);
      setLoading(false);
    };

    fetchData();
  }, [projectId]);

  const handleUpdate = async () => {
    const body = {
      ...tour,
      scenes,
    };

    await fetch(`/api/project/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    alert('✅ Cập nhật tour thành công');
  };

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Chỉnh sửa Tour</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className='select-none mb-2 '>Tên tour</p>
          <input
            value={tour.title}
            onChange={(e) => setTour((t) => ({ ...t, title: e.target.value }))}
            placeholder="Tên tour"
            className='w-full min-h-11 p-3'
          />
        </div>
        <div>
          <p className='select-none mb-2 '>Ngày khởi hành</p>
          <input
            value={tour.departureDate}
            onChange={(e) => setTour((t) => ({ ...t, departureDate: e.target.value }))}
            placeholder="Ngày khởi hành"
            className='w-full min-h-11 p-3'
          />
        </div>
        <div>
          <p className='select-none mb-2 '>Giá vé</p>
          <input
            type="number"
            value={tour.price}
            onChange={(e) => setTour((t) => ({ ...t, price: +e.target.value }))}
            placeholder="Giá vé"
            className='w-full min-h-11 p-3'
          />
        </div>
        <div>
          <p className='select-none mb-2 '>Mô tả</p>
          <textarea
            value={tour.description}
            onChange={(e) => setTour((t) => ({ ...t, description: e.target.value }))}
            placeholder="Mô tả"
            className='w-full min-h-11 p-3'
          />
        </div>
      </div>

      <div className="mt-6">
        <BlockImage360
          userId={userId}
          onScenesChange={setScenes}
          initialScenes={scenes}
        />
      </div>

      <div className="mt-6 text-right">
        <Button onClick={handleUpdate}>💾 Cập nhật tour</Button>
      </div>
    </div>
  );
}
