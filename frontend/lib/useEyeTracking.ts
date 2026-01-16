import { useEffect, useState, useRef } from 'react';

interface EyePosition {
    x: number;
    y: number;
}

export function useEyeTracking(elementRef: React.RefObject<HTMLElement | null>) {
    const [leftEye, setLeftEye] = useState<EyePosition>({ x: 0, y: 0 });
    const [rightEye, setRightEye] = useState<EyePosition>({ x: 0, y: 0 });

    useEffect(() => {
        const calculateOffset = (e: MouseEvent, eyeXPercent: number, eyeYPercent: number) => {
            if (!elementRef.current) return { x: 0, y: 0 };

            const rect = elementRef.current.getBoundingClientRect();
            // Calculate absolute center of the specific eye socket
            const eyeCenterX = rect.left + rect.width * (eyeXPercent / 100);
            const eyeCenterY = rect.top + rect.height * (eyeYPercent / 100);

            const dx = e.clientX - eyeCenterX;
            const dy = e.clientY - eyeCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            // Pupils should stay within the eye white. 10-12px is usually safe.
            const maxMove = 12;
            // Scale movement based on distance, capped at maxMove
            const moveMagnitude = Math.min(distance / 15, maxMove);

            return {
                x: Math.cos(angle) * moveMagnitude,
                y: Math.sin(angle) * moveMagnitude
            };
        };

        const handleMouseMove = (e: MouseEvent) => {
            setLeftEye(calculateOffset(e, 38, 18));
            setRightEye(calculateOffset(e, 58, 18));
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [elementRef]);

    return { leftEye, rightEye };
}

export function useBlinking(interval: number = 3000) {
    const [isBlinking, setIsBlinking] = useState(false);

    useEffect(() => {
        const blink = () => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 150);
        };

        const randomInterval = () => {
            const random = interval + Math.random() * 2000;
            const timer = setTimeout(() => {
                blink();
                randomInterval();
            }, random);
            return timer;
        };

        const timer = randomInterval();
        return () => clearTimeout(timer);
    }, [interval]);

    return isBlinking;
}
