import { useState, useEffect } from "react";

/**
 * usePerformance — Mobile & Low Power Detection
 * 
 * Detects if the device is likely mobile or low-power.
 * Returns settings to optimize rendering.
 */
export function usePerformance() {
    const [isMobile, setIsMobile] = useState(false);
    const [quality, setQuality] = useState<"high" | "medium" | "low">("high");

    useEffect(() => {
        // Basic mobile detection
        const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        setIsMobile(mobileCheck);

        // Hardware concurrency check (rough estimate of power)
        const cores = navigator.hardwareConcurrency || 4;

        if (mobileCheck) {
            if (cores < 4) setQuality("low");
            else setQuality("medium");
        } else {
            if (cores < 4) setQuality("medium");
            else setQuality("high");
        }

        // Could also check FPS roughly if we wanted dynamic scaling, but static is safer for now.
    }, []);

    return {
        isMobile,
        quality,
        // Derived settings
        // Aggressive optimization for mobile
        particleCountMultiplier: quality === "high" ? 1 : quality === "medium" ? 0.4 : 0.2,
        enablePostProcessing: quality !== "low",
        resolution: quality === "high" ? 1 : quality === "medium" ? 0.9 : 0.7
    };
}
