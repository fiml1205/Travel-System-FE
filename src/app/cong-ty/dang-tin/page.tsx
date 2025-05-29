'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Plus, Trash } from 'lucide-react';
import BlockImage360 from '@/components/create-news/BlockImage360';
import { createTour } from '@/app/api/handle-tour'
import { rangePrice } from '@/utilities/constant';
import RichTextEditor from '@/components/RichTextEditor';

interface TourStep {
    day: string;
    content: string;
}

export default function NewProjectPage() {
    const [projectId, setProjectId] = useState<Number>(0);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [price, setPrice] = useState<number | null>(null);
    const [slots, setSlots] = useState(30);
    const [tourSteps, setTourSteps] = useState<TourStep[]>([]);
    const [blockImage360, setBlockImage360] = useState<boolean>(false)
    const [scenes, setScenes] = useState<any[]>([]);
    const userInfor = useUser()

    useEffect(() => {
        if (!userInfor) {
            window.location.href = '/'
        }
        const getTime = Date.now();
        setProjectId(getTime)
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
        const data = {
            projectId,
            userId: userInfor.userId,
            title,
            description,
            departureDate,
            price,
            tourSteps,
            scenes,
        };
        // console.log(data)
        // return
        try {
            await createTour(data);
            alert('✅ Tour đã được đăng!');
        } catch (error: any) {
            alert(error.message)
        }

    };

    return (
        <div className="mx-auto space-y-6 flex flex-col w-80vw">
            <h1 className="text-2xl font-bold mt-6 text-center">📝 Đăng tour du lịch mới</h1>
            {/* block detail tour */}
            <div className='w-full space-y-6 flex flex-col'>
                <div>
                    <p className='mb-2.5 font-semibold'>Tiêu đề tour</p>
                    <input className='border-solid border rounded-xs p-1.5 w-full' placeholder="Tiêu đề tour" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                    <p className='mb-2.5 font-semibold'>Giới thiệu chung</p>
                    <textarea className="mt-2 p-1.5 border-solid border rounded-xs w-full" placeholder="Giới thiệu chung" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="flex gap-6">
                    <div>
                        <span className='font-semibold'>Khởi hành: </span>
                        <input className='border-solid border rounded-xs p-1.5' placeholder="Ngày khởi hành" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
                    </div>
                    <div>
                        <span className='font-semibold'>Giá: </span>
                        <select
                            className="border-solid border rounded-xs p-1.5"
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
                            {/* <textarea
                                className="mt-2 p-1.5 border-solid border rounded-xs"
                                placeholder="Mô tả chi tiết"
                                value={step.content}
                                onChange={(e) => updateStep(i, 'content', e.target.value)}
                            >
                            </textarea> */}
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

            <div>
                <h2 className="text-lg font-semibold">🌐 Quản lý ảnh 360°</h2>
                <BlockImage360 projectId={projectId} onScenesChange={setScenes} />
            </div>

            <Button onClick={handleSubmit} className="w-full mt-6 bg-green-600 hover:bg-green-700">Đăng tour</Button>
        </div>
    );
}
