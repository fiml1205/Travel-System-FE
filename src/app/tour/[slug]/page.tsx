'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { CornerRightDown, CornerRightUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { rangePrice, listCity } from '@/utilities/constant';
import { useUser } from '@/contexts/UserContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { getProject, getSaveStatus, handleSaveStatus, getListProject } from '@/app/api/project';
import PannellumViewer from '@/components/PannellumViewer';
import VoteStats from "@/components/VoteStats";
import CommentBox from "@/components/CommentBox";
import Booking from "@/components/Booking";
import { API_BASE_URL } from '@/utilities/config';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Star, MapPinHouse, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { timeAgo } from '@/utilities/functions';

// Interface cho cấu hình MultiRes của Pannellum
interface MultiResConfigPannellum {
  basePath: string;
  path: string;
  fallbackPath: string;
  extension: string;
  tileResolution: number;
  maxLevel: number;
  cubeResolution: number;
  hfov?: number;
  pitch?: number;
  yaw?: number;
  horizonPitch?: number;
  horizonRoll?: number;
}

// Interface cho dữ liệu Hotspot đã được xử lý cho Pannellum
interface PannellumHotspot {
  pitch: number;
  yaw: number;
  targetSceneId: string;
  label?: string;
  imageUrl?: string;
  cssClass?: string;
}

// Interface cho dữ liệu Scene
interface SceneData {
  id: string;
  name?: string;
  isFirst?: boolean;
  originalImage?: string;
  audio?: string;
  hotspots: PannellumHotspot[];
  tilesPath: string;
  hfov?: number;
  pitch?: number;
  yaw?: number;
}

interface VoteData {
  averageRating: number;
  totalVotes: number;
  userVote: any;
  votes: Array<{
    rating: number;
    count: number;
  }>;
}

// Interface cho Project Data
interface ProjectData {
  projectId: Number;
  title: string;
  description: string;
  coverImage: string;
  scenes: SceneData[];
  tourSteps: Array<{ day: string; content: string }>;
  departureDate: string;
  departureCity: number;
  price: string | number;
  sale?: string;
  userId: Number;
  vote?: VoteData
}

export default function ProjectDetail() {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [currentPannellumConfig, setCurrentPannellumConfig] = useState<MultiResConfigPannellum | null>(null);
  const [processedSceneData, setProcessedSceneData] = useState<SceneData | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [isLoadingSceneConfig, setIsLoadingSceneConfig] = useState(false);
  const [activeTab, setActiveTab] = useState<"comment" | "vote">("comment");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [sceneReady, setSceneReady] = useState<boolean>(false);
  const params = useParams();
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [listInvoldedProject, setListInvoldedProject] = useState([]);

  const projectIdFromParams: Number = Number(params?.slug);
  const userInfor = useUser();
  const { openModal } = useAuthModal();

  // get project detail and involded projects
  useEffect(() => {
    if (!projectIdFromParams) return;
    setIsLoadingProject(true);
    const fetchProjectData = async () => {
      try {
        getProject(projectIdFromParams)
          .then((data) => {
            if (data.project.isLock) {
              window.location.href = '/'
              return
            }
            const projectWithVote: ProjectData = {
              ...data.project,
              vote: data.vote,
            };
            setProject(projectWithVote);

            const firstScene = data.project.scenes.find((s: SceneData) => s.isFirst) || data.project.scenes[0];
            if (firstScene && firstScene.id !== currentSceneId) {
              setCurrentSceneId(firstScene.id);
            }

            const getListInvoldedProject = async () => {
              try {
                const res = await getListProject({ page: 1, limit: 6, query: { departureCity: data.project.departureCity, projectId: data.project.projectId, } })
                setListInvoldedProject(res?.data.listProject || []);
              } catch (error) {
              }
            }
            getListInvoldedProject();

          })
          .catch((error) => {
            console.error('Failed to fetch project:', error);
          });
      } catch (error) {
        console.error("❌ Failed to fetch project data:", error);
        setProject(null);
      } finally {
        setIsLoadingProject(false);
      }
    };

    fetchProjectData();

    if (userInfor) {
      const fetchSavedStatus = async () => {
        try {
          const res = await getSaveStatus(projectIdFromParams)
          if (res.success) {
            setIsSaved(res.saved);
          }
        } catch (error) {
        }
      }
      fetchSavedStatus();
    }

  }, [projectIdFromParams]);

  console.log(listInvoldedProject)


  // set first scene to render
  useEffect(() => {
    if (currentSceneId && project) {
      const sceneData = project.scenes.find(s => s.id === currentSceneId);
      if (sceneData) {
        setIsLoadingSceneConfig(true);
        setCurrentPannellumConfig(null);

        fetchAndPreparePannellumConfig(sceneData.id)
          .then(config => {
            setCurrentPannellumConfig(config);
            setSceneReady(true);
          })
          .catch(error => {
            console.error("❌ Error setting Pannellum config:", error);
            setCurrentPannellumConfig(null);
          })
          .finally(() => {
            setIsLoadingSceneConfig(false);
          });

        const tempSceneData = {
          ...sceneData,
          hotspots: sceneData.hotspots.map(hs => ({
            ...hs,
            originalImage: `${API_BASE_URL}/tiles/${project.projectId}/${hs.targetSceneId}/originalImage.jpg`
          }))
        };
        setProcessedSceneData(tempSceneData);
      } else {
        console.warn(`⚠️ Scene data not found for sceneId: ${currentSceneId}`);
        setCurrentPannellumConfig(null);
        setProcessedSceneData(null);
        setIsLoadingSceneConfig(false);
      }
    }
  }, [currentSceneId, project]);

  // get config of scene renderd
  async function fetchAndPreparePannellumConfig(id: any): Promise<MultiResConfigPannellum | null> {
    const configUrl = `${API_BASE_URL}/tiles/${project?.projectId}/${id}/config.json`;
    try {
      const res = await fetch(configUrl);
      if (!res.ok) {
        console.error(`❌ Failed to fetch Pannellum config from ${configUrl}: ${res.statusText}`);
        return null;
      }
      const rawConfig = await res.json();
      if (!rawConfig.multiRes) {
        console.error(`❌ 'multiRes' field missing in Pannellum config from ${configUrl}`);
        return null;
      }
      const config: MultiResConfigPannellum = {
        ...rawConfig.multiRes,
        hfov: rawConfig.hfov,
        pitch: rawConfig.pitch,
        yaw: rawConfig.yaw,
        horizonPitch: rawConfig.horizonPitch,
        horizonRoll: rawConfig.horizonRoll,
        basePath: `${API_BASE_URL}/tiles/${project?.projectId}/${id}/`,
      };
      return config;
    } catch (error) {
      console.error(`❌ Error fetching or parsing Pannellum config from ${configUrl}:`, error);
      return null;
    }
  }

  // handle change scene
  const handleSceneTransition = useCallback(async (nextSceneId: string) => {
    const targetScene = project?.scenes.find(s => s.id === nextSceneId);
    if (!targetScene) {
      console.warn(`🚫 Scene with id "${nextSceneId}" not found.`);
      alert(`Không tìm thấy cảnh "${nextSceneId}" để chuyển đến.`);
      return;
    }

    try {
      setIsLoadingSceneConfig(true);

      const config = await fetchAndPreparePannellumConfig(nextSceneId);
      if (!config) throw new Error("Không tải được config");

      const tempSceneData = {
        ...targetScene,
        hotspots: targetScene.hotspots.map(hs => ({
          ...hs,
          originalImage: `${API_BASE_URL}/tiles/${project?.projectId}/${hs.targetSceneId}/originalImage.jpg`
        }))
      };

      setProcessedSceneData(tempSceneData);
      setCurrentPannellumConfig(config);
      setCurrentSceneId(nextSceneId);
      setSceneReady(true);
    } catch (err) {
      console.error("❌ Lỗi chuyển scene:", err);
      alert("Không thể chuyển scene.");
    } finally {
      setIsLoadingSceneConfig(false);
    }
  }, [project]);

  if (isLoadingProject) {
    return <div className="text-center text-white py-10">Đang tải dữ liệu tour...</div>;
  }
  if (!project) {
    return <div className="text-center text-white py-10">Không thể tải dữ liệu tour. Vui lòng thử lại.</div>;
  }

  const toggleStep = (index: number) => {
    setExpandedSteps(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleToggleSave = async () => {
    if (!userInfor || !userInfor.userId) {
      openModal(1);
      return;
    }

    try {
      const res = await handleSaveStatus({ projectId: projectIdFromParams });
      if (res.success) {
        setIsSaved(res.saved);
      }
    } catch (err) {
      console.error("Lỗi khi lưu tour:", err);
    }
  };

  return (
    <div className="w-11/12 md:w-3/4 mx-auto pt-4">
      <h1 className="text-default-color text-2xl pb-4">{project.title}</h1>
      <p className='pb-5'>{project.description}</p>
      <img src={project.coverImage} alt="project-image-cover" className='w-full max-h-[450px] mb-5 select-none' />

      {project.scenes.length > 0 && (
        <>
          <h2 className='fancy-text font-semibold text-xl mb-2.5'>Trải nghiệm du lịch 360° <span className="inline-block animate-bounce">✨</span></h2>
          <main className="h-[270px] md:h-[80vh] flex items-center justify-center bg-gray-900 relative">
            {processedSceneData && currentPannellumConfig ? (
              <PannellumViewer
                key={currentSceneId}
                sceneId={currentSceneId!}
                multiResConfig={currentPannellumConfig}
                hotspots={processedSceneData.hotspots || []}
                initialPitch={currentPannellumConfig.pitch ?? processedSceneData.pitch ?? 0}
                initialYaw={currentPannellumConfig.yaw ?? processedSceneData.yaw ?? 0}
                initialHfov={currentPannellumConfig.hfov ?? processedSceneData.hfov ?? 100}
                onRequestTransition={handleSceneTransition}
                onSceneLoaded={() => setSceneReady(true)}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              !isLoadingSceneConfig && (
                <div className="text-center text-white p-5">
                  Không thể tải dữ liệu 360° cho cảnh này. <br />
                  {!currentPannellumConfig && "Cấu hình Pannellum chưa được tải."}
                  {!processedSceneData && "Dữ liệu cảnh không tìm thấy."}
                </div>
              )
            )}
            <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 2, pointerEvents: 'auto' }}>
              <audio className='w-[200] hover:w-[300] transition-all duration-500' key={currentSceneId} controls src={processedSceneData?.audio ? processedSceneData.audio : '/audios/scene-audio.mp3'}>
                Trình duyệt không hỗ trợ audio.
              </audio>
            </div>
          </main>

          <p className='mt-6 mb-2 font-semibold select-none'>Danh sách ảnh 360°</p>
          <div className='list-scene'>
            <Swiper
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView={8}
              navigation
              loop
              className="py-2"
            // style={{ padding: '0 40px' }}
            >
              {project.scenes.map((scene, index) => (
                <SwiperSlide key={index}>
                  <div
                    className="flex flex-col items-center cursor-pointer select-none"
                    onClick={() => {
                      if (scene.id !== currentSceneId) {
                        setCurrentSceneId(scene.id);
                      }
                    }}
                  >
                    <img
                      src={`${API_BASE_URL}${scene.originalImage}`}
                      alt={scene.name || 'Ảnh 360'}
                      className={`w-[120] h-[74] object-cover rounded-md border-2 ${scene.id === currentSceneId ? 'border-blue-500' : 'border-transparent'
                        }`}
                    />
                    <span className="text-sm text-center mt-1">{scene.name || ''}</span>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </>
      )}

      <div className='md:flex justify-between items-start gap-8 mb-6 mt-5'>
        <div className='md:w-2/3'>
          <div className="detail_tour">
            <p className="text-xl font-bold mb-2">Lịch trình tour</p>
            {project.tourSteps.map((step: any, index: number) => {
              const isOpen = expandedSteps.includes(index);
              return (
                <div key={index} className="tour_step mb-4">
                  <div className="step_header flex justify-between mb-2 cursor-pointer" onClick={() => toggleStep(index)}>
                    <p className="step_name font-bold text-gray-500">{step.day}</p>
                    {isOpen
                      ? <CornerRightUp className="w-5 text-gray-500" />
                      : <CornerRightDown className="w-5 text-gray-500" />}
                  </div>
                  {isOpen && (
                    <div className="step_detail tiptap" dangerouslySetInnerHTML={{ __html: step.content }} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 w-full border rounded-lg bg-white p-4 shadow-sm dark:bg-slate-200">
            {/* Tabs */}
            <div className="flex border-b mb-4">
              <button
                onClick={() => setActiveTab("comment")}
                className={`cursor-pointer px-4 py-2 font-medium ${activeTab === "comment"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
                  }`}
              >
                BÌNH LUẬN
              </button>
              <button
                onClick={() => setActiveTab("vote")}
                className={`cursor-pointer px-4 py-2 font-medium ${activeTab === "vote"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
                  }`}
              >
                ĐÁNH GIÁ
              </button>
              {
                userInfor?.userId != project.userId &&
                <button
                  onClick={handleToggleSave}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-red-600 px-4 py-2 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill={isSaved ? "red" : "none"}
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.752 6.756a5.478 5.478 0 00-7.776 0L12 8.732l-1.976-1.976a5.478 5.478 0 10-7.776 7.776l1.976 1.976L12 21.248l7.776-7.776 1.976-1.976a5.478 5.478 0 000-7.776z"
                    />
                  </svg>
                  {isSaved ? "Đã lưu tour" : "Lưu tour"}
                </button>
              }

            </div>

            {/* Nội dung theo tab */}
            {activeTab === "comment" && (
              <CommentBox projectId={project.projectId} />
            )}

            {activeTab === "vote" && (
              <VoteStats
                vote={project.vote}
                projectId={project.projectId}
                projectOwnerId={project.userId}
              />
            )}
          </div>
        </div>
        <div className="md:w-1/3 md:sticky top-4 mb-5 mt-4 md:mt-0">
          <p className="text-xl font-bold mb-2">Đặt tour</p>
          <div className="flex flex-col gap-4">
            <span>
              Ngày khởi hành: <span className="font-bold">{project.departureDate}</span>
            </span>
            <span>
              Khởi hành từ: <span className="font-bold">{listCity.find(item => item._id === project.departureCity)?.name || "Không xác định"}</span>
            </span>
            <div className="flex">
              <span>Tổng giá tour:</span>
              <span className="text-default-color ml-1">{rangePrice.find(p => p.id === Number(project.price))?.value || 'Không xác định'} đ</span>
            </div>
            {project.sale ? <> <p><span className='fancy-text'>Ưu đãi:</span> {project.sale}</p></> : null}
            <div className="flex justify-center">{userInfor?.userId != project.userId && <Button className='cursor-pointer' onClick={() => setIsBooking(true)}>Tư vấn - Đặt tour</Button>}
            </div>
          </div>
        </div>
      </div>

      {/* list involded tours */}
      {listInvoldedProject.length > 0 &&
        <div className='mb-10'>
          <p className='mt-10 mb-4 text-2xl text-default-color'>TOUR LIÊN QUAN</p>
          <Swiper
            modules={[Navigation]}
            spaceBetween={16}
            // slidesPerView={3}
            navigation
            loop
            className="py-2"
            breakpoints={{
              640: { slidesPerView: 1 },
              1024: { slidesPerView: 2 },
              1280: { slidesPerView: 3 },
            }}
          // style={{ padding: '0 40px' }}
          >
            {listInvoldedProject.map((project: any, index: any) => {
              const images = project.scenes?.map((scene: any) => `${API_BASE_URL}${scene.originalImage}`) || [];
              return (
                <>
                  <SwiperSlide key={index}>
                    <div className="h-full w-full">
                      <motion.div
                        key={project._id}
                        className="flex flex-col w-full gap-2 rounded-lg overflow-hidden shadow-lg shadow-color-dark h-fit select-none border border-transparent hover:border-sky-300 dark:border-[gray]"
                        initial={{ opacity: 0, x: 100 }} // ẩn và dịch sang phải
                        whileInView={{ opacity: 1, x: 0 }} // hiện và về đúng vị trí
                        viewport={{ once: true, amount: 0.2 }} // chỉ animate khi visible lần đầu
                        transition={{ duration: 0.5, delay: index * 0.1 }} // delay cho từng card
                      >
                        <div>
                          <Swiper
                            modules={[Navigation, Pagination]}
                            spaceBetween={30}
                            slidesPerView={1}
                            loop={true}
                            autoplay={{ delay: 3000 }}
                            pagination={{ clickable: true }}
                            navigation={true}
                          >
                            {(images.length > 0 ? images : [project.coverImage]).map((img: any, index: any) => (
                              <SwiperSlide key={index}>
                                <img
                                  src={img || '/images/no-image.jpg'}
                                  alt={`Slide ${index}`}
                                  className="w-full h-40 object-cover"
                                  width={30}
                                  height={30}
                                  loading="lazy"
                                />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </div>
                        <div className="px-3 py-2 flex flex-col gap-2 h-full">
                          <Link
                            href={`/tour/${project.projectId}`}
                            className="font-semibold line-clamp-2 overflow-hidden text-ellipsis cursor-pointer h-[48]"
                          >
                            {project.title}
                          </Link>
                          <div className="relative group flex gap-1 items-center w-fit">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                size={20}
                                className={i < Math.round(project.vote?.average || 0) ? "text-yellow-400" : "text-gray-300"}
                              />
                            ))}
                            <div className="absolute left-0 bottom-full mb-1 bg-black text-white text-xs px-2 py-1 rounded opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none whitespace-nowrap z-10">
                              {project.vote?.total || 0} lượt đánh giá
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <MapPinHouse size={20} />
                            <p className="line-clamp-2 overflow-hidden text-ellipsis">
                              Khởi hành: {listCity.find((item: any) => item._id === project.departureCity)?.name || "Không xác định"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <CalendarDays size={20} />
                            <p className="line-clamp-2 overflow-hidden text-ellipsis">
                              Ngày khởi hành: {project.departureDate}
                            </p>
                          </div>
                          <p className="bg-sky-100 w-fit px-2 leading-6 text-sky-500 rounded-lg h-[24px]">
                            {project.timeLastBook ? (
                              <span>Vừa được đặt {timeAgo(project.timeLastBook)}</span>
                            ) : (
                              <span>Đang chờ đặt chỗ</span>
                            )
                            }
                          </p>
                          <p className="flex justify-end text-lg text-default-color font-semibold mt-auto">
                            {(() => {
                              const match = rangePrice.find((p) => p.id === Number(project.price));
                              return match ? `Từ ${match.value}` : `Giá: ${project.price}đ`;
                            })()}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </SwiperSlide>
                </>
              )
            }
            )}
          </Swiper>
        </div>
      }

      {isBooking && <Booking project={project} setIsBooking={setIsBooking} />}
    </div>

  );
}