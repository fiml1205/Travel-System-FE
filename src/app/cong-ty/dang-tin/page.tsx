'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Plus, Trash } from 'lucide-react';
import BlockImage360 from '@/components/create-news/BlockImage360';
import { createTour } from '@/app/api/handle-tour'
import { rangePrice } from '@/utilities/constant';
import RichTextEditor from '@/components/RichTextEditor';
import { listCity } from '@/utilities/constant'
import Combobox from '@/components/combobox';
import { BASE_URL } from '@/utilities/config';

interface TourStep {
    day: string;
    content: string;
}

export default function NewProjectPage() {
    const userInfor = useUser()
    const [projectId, setProjectId] = useState<Number>(0);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [price, setPrice] = useState<number | null>(null);
    const [tourSteps, setTourSteps] = useState<TourStep[]>([]);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [sale, setSale] = useState<string | null>(null);
    const [scenes, setScenes] = useState<any[]>([]);
    const [listCityRebuild, setListCityRebuild] = useState<any>()
    const [departureCity, setDepartureCity] = useState<number | null>(null);

    useEffect(() => {
        if (!userInfor || userInfor.type == 1) {
            window.location.href = '/'
        }
        const getTime = Date.now();
        setProjectId(getTime)

        const arrayListCityRebuild = listCity.map(item => ({
            value: item._id,
            label: item.name
        }))
        setListCityRebuild(arrayListCityRebuild)
    }, [])

    const addStep = () => {
        setTourSteps([...tourSteps, { day: '', content: '' }]);
    };

    const updateStep = (i: number, field: keyof TourStep, value: string) => {
        const updated = [...tourSteps];
        updated[i][field] = value;
        setTourSteps(updated);
    };

    const removeStep = (i: number) => {
        setTourSteps(tourSteps.filter((_, idx) => idx !== i));
    };

    const handleSubmit = async () => {
        let coverImageUrl = '';

        if (coverImage) {
            const formData = new FormData();
            formData.append('file', coverImage);
            formData.append('projectId', String(projectId));

            const res = await fetch('/api/upload-project-image-cover', {
                method: 'POST',
                body: formData,
            });

            const result = await res.json();
            if (!res.ok) {
                alert(result.error || 'Lỗi upload ảnh');
                return;
            }

            coverImageUrl = result.url;
        }
        if (!title || !description || !coverImage || !departureDate || !price || !selectedCity) {
            alert('Bạn cần điền đầy đủ thông tin có dấu *')
            return
        }

        const data = {
            projectId,
            userId: userInfor.userId,
            title,
            description,
            departureCity: selectedCity,
            coverImage: coverImageUrl,
            departureDate,
            price,
            sale,
            tourSteps,
            scenes,
        };

        try {
            await createTour(data);
            alert('✅ Tour đã được đăng!');
            window.location.href = `${BASE_URL}/cong-ty/danh-sach-tour`
        } catch (error: any) {
            alert(error.message)
        }

    };
    const [selectedCity, setSelectedCity] = useState<any>(null);

    const selectCity = (cityID: Number) => {
        setSelectedCity(cityID)
    }

    return (
        <div className="mx-auto space-y-6 flex flex-col w-80vw">
            <h1 className="text-2xl font-bold mt-6 text-center">📝 Đăng tour du lịch mới</h1>
            {/* block detail tour */}
            <div className='w-full space-y-6 flex flex-col'>
                <div>
                    <p className='mb-2.5 font-semibold'>Tiêu đề tour <span className='text-red-600'>*</span></p>
                    <input className='border-solid border rounded-xs p-1.5 w-full' placeholder="Tiêu đề tour" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                    <p className='mb-2.5 font-semibold'>Giới thiệu chung <span className='text-red-600'>*</span></p>
                    <textarea className="mt-2 p-1.5 border-solid border rounded-xs w-full" placeholder="Giới thiệu chung" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div>
                    <p className="mb-2.5 font-semibold">Ảnh đại diện tour <span className='text-red-600'>*</span></p>
                    <input
                        className='border-solid border border-gray-400 rounded-sm pl-1.5'
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                    />
                    {coverImage && (
                        <img
                            src={URL.createObjectURL(coverImage)}
                            alt="Ảnh đại diện"
                            className="mt-2 max-h-48 rounded border"
                        />
                    )}
                </div>

                <div className="flex gap-6">
                    {/* Thành phố */}
                    <div>
                        <span className="font-semibold">Điểm khởi hành: <span className='text-red-600'>*</span></span>
                        <Combobox listData={listCityRebuild} placeholder={'tỉnh thành'} borderRadius={2} handleFunction={selectCity} />
                    </div>
                    <div>
                        <span className='font-semibold'>Ngày khởi hành: <span className='text-red-600'>*</span></span>
                        <input className='border-solid border rounded-xs p-1.5 ml-1.5' placeholder="Ngày khởi hành" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
                    </div>
                    <div>
                        <span className='font-semibold'>Giá: <span className='text-red-600'>*</span></span>
                        <select
                            className="border-solid border rounded-xs p-1.5 ml-1.5"
                            value={price ?? ''}
                            onChange={(e) => setPrice(Number(e.target.value))}
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
                        value={sale ?? ''}
                        onChange={(e) => setSale(e.target.value)}
                    />
                </div>

                <div>
                    <h2 className="text-lg font-semibold">🧭 Lịch trình tour</h2>
                    {tourSteps.map((step, i) => (
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
                    <Button onClick={addStep} className="mt-3" variant="secondary"><Plus className="mr-2" /> Thêm ngày</Button>
                </div>
            </div>
            {/* block image 360 */}
            <div>
                <h2 className="text-lg font-semibold">🌐 Quản lý ảnh 360°</h2>
                <BlockImage360 projectId={projectId} onScenesChange={setScenes} />
            </div>

            <Button onClick={handleSubmit} className="w-full mt-6 mb-6">Đăng tour</Button>
        </div>
    );
}