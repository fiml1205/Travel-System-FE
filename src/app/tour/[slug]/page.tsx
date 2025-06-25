'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { CornerRightDown, CornerRightUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { rangePrice } from '@/utilities/constant';
import { useUser } from '@/contexts/UserContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { createNoti } from '@/app/api/notification';
import { getProject, getSaveStatus, handleSaveStatus } from '@/app/api/project';
import PannellumViewer from '@/components/PannellumViewer';
import VoteStats from "@/components/VoteStats";
import CommentBox from "@/components/CommentBox";
import { API_BASE_URL } from '@/utilities/config';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

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
  price: string | number;
  sale?: string;
  userId: Number;
  vote?: VoteData
}

export default function ProjectDetail() {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [currentPannellumConfig, setCurrentPannellumConfig] = useState<MultiResConfigPannellum | null>(null);
  const [processedSceneData, setProcessedSceneData] = useState<SceneData | null>(null); // State mới để chứa scene data đã thêm fake hotspot
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [isLoadingSceneConfig, setIsLoadingSceneConfig] = useState(false);
  const [activeTab, setActiveTab] = useState<"comment" | "vote">("comment");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [sceneReady, setSceneReady] = useState<boolean>(false);
  const params = useParams();

  const projectIdFromParams: Number = Number(params?.slug);
  const userInfor = useUser();
  const { openModal } = useAuthModal();

  const scrollRef = useRef<HTMLDivElement>(null);
  const itemWidth = 100 + 16;

  const scrollOne = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const currentScroll = container.scrollLeft;

    if (direction === 'left') {
      const nextScroll = currentScroll - itemWidth;
      if (nextScroll < 0) {
        container.scrollTo({ left: maxScrollLeft, behavior: 'smooth' }); // vòng lại cuối
      } else {
        container.scrollTo({ left: nextScroll, behavior: 'smooth' });
      }
    } else {
      const nextScroll = currentScroll + itemWidth;
      if (nextScroll > maxScrollLeft - 5) {
        container.scrollTo({ left: 0, behavior: 'smooth' }); // vòng lại đầu
      } else {
        container.scrollTo({ left: nextScroll, behavior: 'smooth' });
      }
    }
  };


  // get project detail
  useEffect(() => {
    if (!projectIdFromParams) return;
    setIsLoadingProject(true);
    const fetchProjectData = async () => {
      try {
        getProject(projectIdFromParams)
          .then((data) => {
            const projectWithVote: ProjectData = {
              ...data.project,
              vote: data.vote,
            };
            setProject(projectWithVote);

            const firstScene = data.project.scenes.find((s: SceneData) => s.isFirst) || data.project.scenes[0];
            if (firstScene && firstScene.id !== currentSceneId) {
              setCurrentSceneId(firstScene.id);
            }
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

  // get congif of scene renderd
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
    console.log("🚀 Preloading scene:", nextSceneId);

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

  // handle booking
  const handleBooking = async () => {
    if (!userInfor || !userInfor.userId) {
      openModal(1);
      return;
    }
    const contact = userInfor.phone || userInfor.email || 'thông tin liên hệ';
    const message = `👤 ${userInfor.fullName || userInfor.userName || 'Khách hàng'} vừa đăng ký tư vấn tour "${project.title}. Liên hệ qua ${contact}"`;
    try {
      await createNoti({
        projectId: projectIdFromParams,
        projectName: project.title,
        userIdTour: project.userId,
        userId: userInfor.userId,
        message: message,
      });
      alert(`✅ Nhân viên sẽ liên hệ tư vấn cho bạn qua ${contact} sớm nhất có thể. Xin cảm ơn!`);
    } catch (error) {
      console.error(error);
      alert('❌ Gửi thông báo thất bại. Vui lòng thử lại sau.');
    }
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
    <div className="w-3/4 mx-auto pt-4">
      <h1 className="text-default-color text-2xl pb-4">{project.title}</h1>
      <p className='pb-5'>{project.description}</p>
      <img src={project.coverImage} alt="project-image-cover" className='w-full max-h-[450px] mb-5' />

      {project.scenes.length > 0 && (
        <>
          <h2 className='fancy-text font-semibold text-xl mb-2.5'>Trải nghiệm du lịch 360° <span className="inline-block animate-bounce">✨</span></h2>
          <main className="h-[80vh] flex items-center justify-center bg-gray-900 relative">
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
              <audio key={currentSceneId} controls src={processedSceneData?.audio ? processedSceneData.audio : '/audios/scene-audio.mp3'} style={{ maxWidth: '200px' }}>
                Trình duyệt không hỗ trợ audio.
              </audio>
            </div>
          </main>

          <p className='mt-6 mb-2 font-semibold select-none'>Danh sách ảnh 360°</p>
          <div className='list-scene'>
            <Swiper
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView={10}
              navigation
              loop
              className="py-2"
              style={{ padding: '0 40px' }}
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

      <div className='flex justify-between items-start gap-8 mb-6'>
        <div className='w-2/3'>
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

          <div className="mt-6 w-full border rounded-lg bg-white p-4 shadow-sm">
            {/* Tabs */}
            <div className="flex border-b mb-4">
              <button
                onClick={() => setActiveTab("comment")}
                className={`px-4 py-2 font-medium ${activeTab === "comment"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-500"
                  }`}
              >
                BÌNH LUẬN
              </button>
              <button
                onClick={() => setActiveTab("vote")}
                className={`px-4 py-2 font-medium ${activeTab === "vote"
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
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-red-600 px-4 py-2"
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
        <div className="book_tour w-1/3 sticky top-4 mb-5">
          <p className="text-xl font-bold mb-2">Đặt tour</p>
          <div className="flex flex-col gap-4">
            <span>
              Ngày khởi hành: <span className="font-bold">{project.departureDate}</span>
            </span>
            <div className="flex">
              <span>Tổng giá tour:</span>
              <span className="text-default-color ml-1">{rangePrice.find(p => p.id === Number(project.price))?.value || 'Không xác định'} đ</span>
            </div>
            {project.sale ? <> <p><span className='fancy-text'>Ưu đãi:</span> {project.sale}</p></> : null}
            <div className="flex justify-center">{userInfor?.userId != project.userId && <Button className='cursor-pointer' onClick={handleBooking}>Tư vấn - Đặt tour</Button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}