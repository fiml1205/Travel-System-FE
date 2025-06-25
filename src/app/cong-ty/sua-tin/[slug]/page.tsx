'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BlockImage360 from '@/components/create-news/BlockImage360';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { editTour } from '@/app/api/handle-tour';
import { Trash } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import { listCity, rangePrice } from '@/utilities/constant';
import Combobox from '@/components/combobox';
import { API_BASE_URL, BASE_URL } from '@/utilities/config';

interface TourStep {
  day: string;
  content: string;
}

export default function EditTourPage() {
  const params = useParams();
  const projectId: any = params?.slug;
  const userInfor = useUser();

  const [loading, setLoading] = useState(true);
  const [scenes, setScenes] = useState<any[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [listCityRebuild, setListCityRebuild] = useState<any[]>([]);

  const [tour, setTour] = useState({
    title: '',
    description: '',
    departureDate: '',
    price: 0,
    sale: '',
    departureCity: null,
    tourSteps: [] as TourStep[],
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${API_BASE_URL}/api/project/${projectId}`);
      const data = await res.json();

      setTour({
        title: data.title,
        description: data.description,
        departureDate: data.departureDate,
        price: data.price,
        sale: data.sale,
        departureCity: data.departureCity,
        tourSteps: data.tourSteps || [],
      });

      setScenes(data.scenes || []);
      setSelectedCity(data.departureCity);
      setLoading(false);
    };

    const arrayListCityRebuild = listCity.map(item => ({
      value: item._id,
      label: item.name,
    }));
    setListCityRebuild(arrayListCityRebuild);

    fetchData();
  }, [projectId]);

  const updateStep = (i: number, field: keyof TourStep, value: string) => {
    const updated = [...tour.tourSteps];
    updated[i][field] = value;
    setTour(t => ({ ...t, tourSteps: updated }));
  };

  const removeStep = (i: number) => {
    setTour(t => ({
      ...t,
      tourSteps: t.tourSteps.filter((_, idx) => idx !== i),
    }));
  };

  const addStep = () => {
    setTour(t => ({
      ...t,
      tourSteps: [...t.tourSteps, { day: '', content: '' }],
    }));
  };

  const handleUpdate = async () => {
    const body = {
      ...tour,
      departureCity: selectedCity,
      scenes,
    };

    await editTour(body, projectId);

    alert('✅ Cập nhật tour thành công');
    window.location.href = `${BASE_URL}/cong-ty/danh-sach-tour`;
  };

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;

  return (
    <div className="mx-auto space-y-6 flex flex-col w-80vw">
      <h1 className="text-2xl font-bold mt-6 text-center">📝 Chỉnh sửa tour du lịch</h1>
      <div className='w-full space-y-6 flex flex-col'>
        <div>
          <p className='mb-2.5 font-semibold'>Tiêu đề tour <span className='text-red-600'>*</span></p>
          <input className='border-solid border rounded-xs p-1.5 w-full' placeholder="Tiêu đề tour" value={tour.title} onChange={(e) => setTour(t => ({ ...t, title: e.target.value }))} />
        </div>
        <div>
          <p className='mb-2.5 font-semibold'>Giới thiệu chung <span className='text-red-600'>*</span></p>
          <textarea className="mt-2 p-1.5 border-solid border rounded-xs w-full" placeholder="Giới thiệu chung" value={tour.description} onChange={(e) => setTour(t => ({ ...t, description: e.target.value }))} />
        </div>

        <div className="flex gap-6">
          <div>
            <span className="font-semibold">Điểm khởi hành: <span className='text-red-600'>*</span></span>
            <Combobox listData={listCityRebuild} placeholder={'tỉnh thành'} borderRadius={2} handleFunction={setSelectedCity} />
          </div>
          <div>
            <span className='font-semibold'>Ngày khởi hành: <span className='text-red-600'>*</span></span>
            <input className='border-solid border rounded-xs p-1.5 ml-1.5' placeholder="Ngày khởi hành" value={tour.departureDate} onChange={(e) => setTour(t => ({ ...t, departureDate: e.target.value }))} />
          </div>
          <div>
            <span className='font-semibold'>Giá: <span className='text-red-600'>*</span></span>
            <select
              className="border-solid border rounded-xs p-1.5 ml-1.5"
              value={tour.price ?? ''}
              onChange={(e) => setTour(t => ({ ...t, price: Number(e.target.value) }))}
            >
              <option value="">Chọn mức giá</option>
              {rangePrice.map(option => (
                <option key={option.id} value={option.id}>{option.value}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className='font-semibold'>Ưu đãi:</span>
          <input
            className='border-solid border rounded-xs p-1.5 ml-1.5 min-w-[500]'
            placeholder="Nhập thông tin ưu đãi"
            value={tour.sale ?? ''}
            onChange={(e) => setTour(t => ({ ...t, sale: e.target.value }))}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold">🧭 Lịch trình tour</h2>
          {tour.tourSteps.map((step, i) => (
            <div key={i} className="border p-3 rounded mt-2">
              <div className="flex justify-between items-center">
                <input className='border-solid border rounded-xs p-1.5'
                  placeholder={`Ngày ${i + 1}`}
                  value={step.day}
                  onChange={(e) => updateStep(i, 'day', e.target.value)}
                />
                <Trash className="text-red-500 cursor-pointer" onClick={() => removeStep(i)} />
              </div>
              <RichTextEditor
                value={step.content}
                onChange={(val) => updateStep(i, 'content', val)}
                projectId={projectId}
              />
            </div>
          ))}
          <Button onClick={addStep} className="mt-3" variant="secondary">+ Thêm ngày</Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">🌐 Quản lý ảnh 360°</h2>
        <BlockImage360 projectId={projectId} onScenesChange={setScenes} initialScenes={scenes} />
      </div>

      <Button onClick={handleUpdate} className="w-full mt-6 mb-6">💾 Cập nhật tour</Button>
    </div>
  );
}
