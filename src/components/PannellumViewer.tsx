'use client';

import React, { useEffect, useRef, memo } from 'react';

interface PannellumHotspotConfig {
  pitch: number;
  yaw: number;
  text?: string;
  URL?: string;
  sceneId?: string;
  cssClass?: string;
  clickHandlerFunc?: (e: MouseEvent, args: any) => void;
  clickHandlerArgs?: any; // Đối số cho clickHandlerFunc
  createTooltipFunc?: (hotSpotDiv: HTMLDivElement, args: any) => void; // Hàm để tạo tooltip tùy chỉnh
  createTooltipArgs?: any; // Đối số cho createTooltipFunc
}

interface MultiResConfig {
  basePath: string;
  path: string;
  fallbackPath: string;
  extension: string;
  tileResolution: number;
  maxLevel: number;
  cubeResolution: number;
}

interface PannellumViewerProps {
  sceneId: string;
  multiResConfig: MultiResConfig;
  hotspots?: Array<{
    pitch: number;
    yaw: number;
    targetSceneId: string;
    label?: string;
    originalImage?: string;
  }>;
  onRequestTransition?: (nextSceneId: string) => void;
  onPreloadNextSceneConfig?: (nextSceneId: string) => void;
  className?: string;
  style?: React.CSSProperties;
  autoLoad?: boolean;
  showControls?: boolean;
  initialPitch?: number;
  initialYaw?: number;
  initialHfov?: number;
  onSceneLoaded?: () => void;
}

const PannellumViewer: React.FC<PannellumViewerProps> = ({
  sceneId,
  multiResConfig,
  hotspots = [],
  onRequestTransition,
  className,
  style,
  autoLoad = true,
  showControls = true,
  initialPitch,
  initialYaw,
  initialHfov,
  onSceneLoaded
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const pannellumInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (
      !viewerRef.current ||
      !multiResConfig ||
      typeof window === 'undefined' ||
      !(window as any).pannellum
    ) {
      console.warn('Pannellum library not found, viewerRef not set, or multiResConfig missing.');
      return;
    }

    const pannellumHotspots: PannellumHotspotConfig[] = hotspots.map(hs => ({
      pitch: hs.pitch,
      yaw: hs.yaw,
      text: hs.label || `Chuyển đến scene ${hs.targetSceneId}`,
      originalImage: hs.originalImage,
      clickHandlerFunc: (e: MouseEvent) => {
        const viewer = pannellumInstanceRef.current;
        if (!viewer) return;

        const { pitch, yaw } = hs;

        viewer.lookAt(pitch, yaw, undefined, 1000);
        viewer.setHfov(40, 1000);

        setTimeout(() => {
          if (onRequestTransition) {
            onRequestTransition(hs.targetSceneId);
          }
        }, 1200);
      },
      clickHandlerArgs: { sceneId: hs.targetSceneId },
      createTooltipFunc: (hotSpotDiv: HTMLDivElement, args: any) => {
        hotSpotDiv.style.display = 'flex';
        hotSpotDiv.style.flexDirection = 'column';
        hotSpotDiv.style.alignItems = 'center';
        hotSpotDiv.style.pointerEvents = 'auto';

        const img = document.createElement('img');
        img.src = hs.originalImage || ``;
        img.style.width = '50px';
        img.style.height = '50px';
        img.style.minWidth = '50px';
        img.style.minHeight = '50px';
        img.style.maxWidth = '50px';
        img.style.maxHeight = '50px';
        img.style.transform = 'none';
        img.style.position = 'relative';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
        img.style.cursor = 'pointer';
        img.style.border = '2px solid white';
        img.style.transition = 'transform 0.3s ease';
        img.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        img.alt = hs.label || `Scene ${hs.targetSceneId}`;
        hotSpotDiv.appendChild(img);
        let labelDiv: HTMLDivElement | null = null;
        if (hs.label) {
          labelDiv = document.createElement('div');
          labelDiv.textContent = hs.label;
          labelDiv.style.width = '100px';
          labelDiv.style.textAlign = 'center';
          labelDiv.style.padding = '2px 5px';
          labelDiv.style.wordBreak = 'break-word';
          labelDiv.style.marginTop = '5px';
          labelDiv.style.color = '#fff';
          labelDiv.style.fontSize = '13px';
          labelDiv.style.fontWeight = 'bold';
          labelDiv.style.pointerEvents = 'none';
          labelDiv.style.textShadow = '0 0 4px rgba(0,0,0,0.8)';
          labelDiv.style.borderRadius = '3px';
          labelDiv.style.transition = 'margin-top 0.3s ease';
          hotSpotDiv.appendChild(labelDiv);
        }
        hotSpotDiv.onmouseenter = () => {
          img.style.transform = 'scale(2)';
          if (labelDiv) {
            labelDiv.style.marginTop = '60px';
            labelDiv.style.backgroundColor = 'rgba(0,0,0,0.4)';
          }
        };
        hotSpotDiv.onmouseleave = () => {
          img.style.transform = 'scale(1)';
          if (labelDiv) {
            labelDiv.style.marginTop = '5px';
            labelDiv.style.backgroundColor = 'transparent';
          }
        };
      },
      createTooltipArgs: {}
    }));

    // Hủy instance cũ nếu có
    if (pannellumInstanceRef.current) {
      try {
        pannellumInstanceRef.current.destroy();
      } catch (e) {
        console.warn("Error destroying Pannellum instance:", e);
      }
      pannellumInstanceRef.current = null;
    }

    // Khởi tạo viewer mới
    const viewerOptions = {
      type: 'multires',
      multiRes: multiResConfig,
      hotSpots: pannellumHotspots,
      autoLoad: autoLoad,
      showControls: showControls,
      pitch: initialPitch,
      yaw: initialYaw,
      hfov: initialHfov,
    };

    pannellumInstanceRef.current = (window as any).pannellum.viewer(viewerRef.current, viewerOptions);

    // Khi scene load xong
    pannellumInstanceRef.current.on('load', () => {
      if (viewerRef.current) viewerRef.current.style.opacity = '1';
      if (onSceneLoaded) onSceneLoaded();
    });

    return () => {
      if (pannellumInstanceRef.current) {
        try {
          pannellumInstanceRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying Pannellum instance:", e);
        }
        pannellumInstanceRef.current = null;
      }
    };
  }, [sceneId, multiResConfig, hotspots, autoLoad, showControls, initialPitch, initialYaw, initialHfov]);


  return (
    <div
      ref={viewerRef}
      className={className}
      style={style || { width: '100%', height: '100%', position: 'relative', opacity: 1 }}
      id={`pannellum-viewer-container-${sceneId}`}
    />
  );
};

export default memo(PannellumViewer);