// ✅ PreviewImage360.tsx — fix render lại hotspot và click sau khi đổi scene

import React, { useState, useEffect, useRef, memo } from 'react';

interface Preview360ImageProps {
    sceneId: string;
    baseApiUrl: string;
    tilesPath: string;
    hotspots?: Array<{
        pitch: number;
        yaw: number;
        label?: string;
        targetSceneId?: string;
        cssClass?: string;
        clickHandlerFunc?: (e: MouseEvent, args: any) => void;
    }>;
    initialHfov?: number;
    initialPitch?: number;
    initialYaw?: number;
    showControls?: boolean;
    hotspotDebug?: boolean;
    addingHotspotMode?: boolean;
    onHotspotClickToAdd?: (pitch: number, yaw: number) => void;
    onSceneChange?: (newSceneId: string) => void;
    onViewerRef?: (viewerInstance: any) => void;
}

const Preview360Image: React.FC<Preview360ImageProps> = ({
    sceneId,
    baseApiUrl,
    tilesPath,
    hotspots = [],
    initialHfov = 100,
    initialPitch = 0,
    initialYaw = 0,
    showControls = true,
    hotspotDebug = false,
    addingHotspotMode = false,
    onHotspotClickToAdd,
    onSceneChange,
    onViewerRef,
}) => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const pannellumInstanceRef = useRef<any>(null);
    const hasViewerMountedRef = useRef(false);
    const [multiResConfig, setMultiResConfig] = useState<any | null>(null);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);

    const hotspotModeRef = useRef(addingHotspotMode);
    const clickCallbackRef = useRef(onHotspotClickToAdd);

    useEffect(() => {
        hotspotModeRef.current = addingHotspotMode;
        clickCallbackRef.current = onHotspotClickToAdd;
    }, [addingHotspotMode, onHotspotClickToAdd]);

    useEffect(() => {
        setIsLoadingConfig(true);
        const configFullUrl = `${baseApiUrl}${tilesPath.endsWith('/') ? tilesPath : tilesPath + '/'}config.json`;

        fetch(configFullUrl)
            .then(res => {
                if (!res.ok) throw new Error(`Không tải được config: ${res.statusText}`);
                return res.json();
            })
            .then(configData => {
                if (configData.multiRes) {
                    setMultiResConfig({
                        ...configData.multiRes,
                        basePath: `${baseApiUrl}${tilesPath.endsWith('/') ? tilesPath : tilesPath + '/'}`,
                        hfov: configData.hfov || initialHfov,
                        pitch: configData.pitch || initialPitch,
                        yaw: configData.yaw || initialYaw,
                    });
                } else {
                    setMultiResConfig({
                        ...configData,
                        basePath: `${baseApiUrl}${tilesPath.endsWith('/') ? tilesPath : tilesPath + '/'}`,
                    });
                }
            })
            .catch(err => {
                console.error(`Lỗi tải config từ ${configFullUrl}:`, err);
                setMultiResConfig(null);
            })
            .finally(() => setIsLoadingConfig(false));
    }, [sceneId, baseApiUrl, tilesPath, initialHfov, initialPitch, initialYaw]);

    useEffect(() => {
        if (!viewerRef.current || typeof window === 'undefined' || !(window as any).pannellum || !multiResConfig)
            return;

        hasViewerMountedRef.current = false;
        viewerRef.current.innerHTML = '';

        const viewerOptions = {
            type: 'multires',
            multiRes: multiResConfig,
            autoLoad: true,
            showControls,
            hotSpotDebug: hotspotDebug,
            hfov: multiResConfig.hfov || initialHfov,
            pitch: multiResConfig.pitch || initialPitch,
            yaw: multiResConfig.yaw || initialYaw,
        };

        const instance = (window as any).pannellum.viewer(viewerRef.current, viewerOptions);
        pannellumInstanceRef.current = instance;
        hasViewerMountedRef.current = true;

        if (onViewerRef) onViewerRef(instance);

        let isDragging = false;

        const handleMouseDown = () => { isDragging = false; };
        const handleMouseMove = () => { isDragging = true; };
        const handleMouseUp = (event: MouseEvent) => {
            if (!isDragging && hotspotModeRef.current && clickCallbackRef.current && instance) {
                const coords = instance.mouseEventToCoords(event);
                clickCallbackRef.current(coords[0], coords[1]);
            }
        };

        viewerRef.current.addEventListener('mousedown', handleMouseDown);
        viewerRef.current.addEventListener('mousemove', handleMouseMove);
        viewerRef.current.addEventListener('mouseup', handleMouseUp);

        return () => {
            viewerRef.current?.removeEventListener('mousedown', handleMouseDown);
            viewerRef.current?.removeEventListener('mousemove', handleMouseMove);
            viewerRef.current?.removeEventListener('mouseup', handleMouseUp);
        };
    }, [sceneId, multiResConfig]);

    // useEffect(() => {
    //     const instance = pannellumInstanceRef.current;
    //     if (!instance) return;

    //     instance.clearHotSpots?.();

    //     const timeout = setTimeout(() => {
    //         hotspots.forEach((hs) => {
    //             instance.addHotSpot({
    //                 pitch: hs.pitch,
    //                 yaw: hs.yaw,
    //                 type: 'info',
    //                 text: hs.label,
    //                 sceneId: hs.targetSceneId,
    //                 cssClass: hs.cssClass || 'custom-hotspot',
    //                 clickHandlerFunc: hs.clickHandlerFunc,
    //                 clickHandlerArgs: { sceneId: hs.targetSceneId, label: hs.label },
    //             });
    //         });
    //     }, 400); // tăng delay để đảm bảo viewer kịp load scene

    //     return () => clearTimeout(timeout); // cleanup timeout khi component unmount
    // }, [sceneId, JSON.stringify(hotspots)]);
    useEffect(() => {
        // ... (logic khởi tạo viewer với pannellum.viewer()) ...
        // Ở đây, sau khi instance được tạo và scene đã load (Pannellum có sự kiện 'load')
        // bạn có thể gọi một hàm để cập nhật hotspots.

        const instance = pannellumInstanceRef.current;
        if (instance) {
            const handleSceneLoad = () => {
                console.log(`PreviewImage360: Scene ${sceneId} loaded, updating hotspots.`);
                instance.clearHotSpots?.();
                hotspots.forEach((hs) => {
                    instance.addHotSpot({
                        pitch: hs.pitch,
                        yaw: hs.yaw,
                        type: 'info', // Hoặc dựa trên hs.type nếu có
                        text: hs.label,
                        sceneId: hs.targetSceneId,
                        cssClass: hs.cssClass || 'custom-hotspot-editor', // Đặt tên class riêng cho editor
                        // Không cần clickHandlerFunc phức tạp trong editor nếu chỉ để hiển thị
                        // Nếu muốn click để chọn hotspot trong editor:
                        // clickHandlerFunc: () => {
                        //   console.log("Hotspot clicked in preview:", hs);
                        //   // Gọi một callback ra ngoài để BlockImage360 biết hotspot nào được click trên ảnh
                        //   // Ví dụ: onHotspotSelectInPreview(hs)
                        // }
                    });
                });
            };

            instance.on('load', handleSceneLoad);

            // Nếu scene đã load trước khi listener này được thêm (ví dụ, khi chỉ hotspots thay đổi)
            // thì cần gọi handleSceneLoad một lần nữa.
            // Hoặc, tách logic cập nhật hotspot ra một useEffect khác chỉ phụ thuộc vào hotspots và instance.

            return () => {
                instance.off('load', handleSceneLoad);
                // instance.destroy() sẽ được gọi ở useEffect chính khi sceneId hoặc multiResConfig thay đổi hoàn toàn
            };
        }
    }, [sceneId, multiResConfig]); // Effect này tạo/destroy viewer khi sceneId/config thay đổi

    // useEffect riêng để cập nhật hotspots khi mảng hotspots thay đổi hoặc sceneId thay đổi (sau khi viewer đã sẵn sàng)
    useEffect(() => {
        const instance = pannellumInstanceRef.current;
        // Đảm bảo instance tồn tại và viewer không phải đang trong quá trình load scene mới hoàn toàn
        // hasViewerMountedRef.current có thể hữu ích ở đây để biết viewer đã mount ít nhất 1 lần chưa
        if (!instance || !hasViewerMountedRef.current || isLoadingConfig) {
            console.log("PreviewImage360: Skipping hotspot update (instance not ready or config loading). Instance:", !!instance, "Mounted:", hasViewerMountedRef.current, "LoadingConfig:", isLoadingConfig);
            return;
        }

        console.log(`PreviewImage360: Updating hotspots for scene ${sceneId}. Hotspots:`, hotspots);
        instance.clearHotSpots?.();

        hotspots.forEach((hs, index) => { // Thêm index để debug
            console.log(`PreviewImage360: Adding hotspot ${index} for scene ${sceneId}:`, hs);
            instance.addHotSpot({
                pitch: hs.pitch,
                yaw: hs.yaw,
                type: 'info',
                text: hs.label,
                sceneId: hs.targetSceneId, // Quan trọng nếu hotspot có type 'scene'
                cssClass: hs.cssClass || `custom-hotspot-editor editor-hs-${index}`,
                // Nếu muốn click hotspot trên ảnh để chọn nó trong danh sách editor:
                // clickHandlerFunc: () => {
                //   if (onSelectHotspotInPreview) onSelectHotspotInPreview(index);
                // }
            });
        });

    }, [sceneId, hotspots, isLoadingConfig, hasViewerMountedRef.current]); // Phụ thuộc vào sceneId và hotspots
    // và isLoadingConfig để đảm bảo config đã được load

    if (isLoadingConfig && !multiResConfig) {
        return <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-600">Đang tải cấu hình 360°...</div>;
    }
    if (!multiResConfig && !isLoadingConfig) {
        return <div className="w-full h-full flex items-center justify-center bg-gray-100 text-red-600">Lỗi: Không tải được cấu hình 360°.</div>;
    }

    return (
        <div
            ref={viewerRef}
            style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
            className={addingHotspotMode ? 'pannellum-add-hotspot-mode' : ''}
        />
    );
};

export default memo(Preview360Image);
