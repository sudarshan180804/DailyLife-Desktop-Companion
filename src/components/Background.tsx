import { useState, useEffect } from "react";
import { wallpaperService } from "../services/wallpaperService";

interface BackgroundProps {
  bgUrl: string;
  altText?: string;
}

export function Background({ bgUrl, altText = "DailyLife Dynamic Wallpaper" }: BackgroundProps) {
  const [currentBg, setCurrentBg] = useState<string>(bgUrl);
  const [prevBg, setPrevBg] = useState<string | null>(null);
  const [isCrossfading, setIsCrossfading] = useState<boolean>(false);

  useEffect(() => {
    if (bgUrl && bgUrl !== currentBg) {
      console.log(`🖼️ [Background] Image src updated to: "${bgUrl}"`);
      setPrevBg(currentBg);
      setCurrentBg(bgUrl);
      setIsCrossfading(true);

      const timer = setTimeout(() => {
        setPrevBg(null);
        setIsCrossfading(false);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [bgUrl, currentBg]);

  const handleImageError = (failedUrl: string) => {
    console.error(`❌ [Background] Failed to load wallpaper image URL: "${failedUrl}"`);
    const fallback = wallpaperService.getBundledDefault("home");
    if (failedUrl !== fallback) {
      console.log(`🔄 [Background] Falling back to bundled background: "${fallback}"`);
      setCurrentBg(fallback);
    }
  };

  const handleImageLoad = (loadedUrl: string) => {
    console.log(`✅ [Background] Successfully loaded wallpaper image: "${loadedUrl}"`);
  };

  return (
    <div className="background-container" data-tauri-drag-region>
      {/* Previous background during crossfade */}
      {prevBg && (
        <img
          src={prevBg}
          alt={altText}
          className={`background-image background-prev ${isCrossfading ? "fade-out" : ""}`}
        />
      )}

      {/* Current background */}
      <img
        src={currentBg}
        alt={altText}
        className={`background-image background-current ${isCrossfading ? "fade-in" : ""}`}
        onLoad={() => handleImageLoad(currentBg)}
        onError={() => handleImageError(currentBg)}
      />

      <div className="background-vignette" />
    </div>
  );
}
