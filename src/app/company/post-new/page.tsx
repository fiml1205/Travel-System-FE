'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Plus, Trash } from 'lucide-react';
import BlockImage360 from '@/components/post-new/BlockImage360';

interface TourStep {
    day: string;
    description: string;
}

export default function NewProjectPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [price, setPrice] = useState('');
    const [slots, setSlots] = useState(30);
    const [tourSteps, setTourSteps] = useState<TourStep[]>([]);
    const [blockImage360, setBlockImage360] = useState<boolean>(false)
    const [scenes, setScenes] = useState<any[]>([]); // sẽ dùng để lưu sceneId, audio, ảnh cube, hotspot
    const userInfor = useUser()

    const addStep = () => {
        setTourSteps([...tourSteps, { day: '', description: '' }]);
    };

    const updateStep = (i: number, field: keyof TourStep, value: string) => {
        const updated = [...tourSteps];
        updated[i][field] = value;
        setTourSteps(updated);
    };

    const removeStep = (i: number) => {
        setTourSteps(tourSteps.filter((_, idx) => idx !== i));
    };

    const handleSubmit = () => {
        const data = {
            title,
            description,
            departureDate,
            price,
            slots,
            tourSteps,
            scenes,
        };
        console.log('Submit project:', data);
        // Gửi về API lưu vào DB
    };

    return (
        <div className="mx-auto p-6 space-y-6 flex flex-col items-center">
            <h1 className="text-2xl font-bold">📝 Đăng tour du lịch mới</h1>
            <input placeholder="Tiêu đề tour" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Mô tả tổng quan" value={description} onChange={(e) => setDescription(e.target.value)} />

            <div className="flex gap-4">
                <input placeholder="Ngày khởi hành" type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
                <input placeholder="Giá tour (VND)" value={price} onChange={(e) => setPrice(e.target.value)} />
                <input placeholder="Số chỗ" type="number" value={slots} onChange={(e) => setSlots(Number(e.target.value))} />
            </div>

            <div>
                <h2 className="text-lg font-semibold">🧭 Lịch trình tour</h2>
                {tourSteps.map((step, i) => (
                    <div key={i} className="border p-3 rounded mt-2">
                        <div className="flex justify-between items-center">
                            <input
                                placeholder={`Ngày ${i + 1}`}
                                value={step.day}
                                onChange={(e) => updateStep(i, 'day', e.target.value)}
                            />
                            <Trash className="text-red-500 cursor-pointer" onClick={() => removeStep(i)} />
                        </div>
                        <textarea
                            className="mt-2"
                            placeholder="Mô tả chi tiết"
                            value={step.description}
                            onChange={(e) => updateStep(i, 'description', e.target.value)}
                        />
                    </div>
                ))}
                <Button onClick={addStep} className="mt-3" variant="secondary"><Plus className="mr-2" /> Thêm ngày</Button>
            </div>

            <div>
                <h2 className="text-lg font-semibold">🌐 Quản lý ảnh 360°</h2>
                <Button variant="outline">Cấu hình ảnh 360°</Button>
                <BlockImage360 userId={userInfor.userId} />
            </div>

            <Button onClick={handleSubmit} className="w-full mt-6 bg-green-600 hover:bg-green-700">Đăng tour</Button>
        </div>
    );
}
