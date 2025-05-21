"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MarqueeProps {
    children: React.ReactNode;
    speed?: number; // pixels per second
    className?: string;
}

const Marquee: React.FC<MarqueeProps> = ({
    children,
    speed = 50,
    className = "",
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const cloneRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<gsap.core.Tween | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        const content = contentRef.current;
        const clone = cloneRef.current;

        if (!container || !content || !clone) return;

        gsap.set([content, clone], { x: 0 });

        const contentWidth = content.offsetWidth;

        animationRef.current?.kill(); // Reset previous animation

        animationRef.current = gsap.to([content, clone], {
            x: -contentWidth,
            duration: contentWidth / speed,
            ease: "none",
            repeat: -1,
            modifiers: {
                x: (x) => `${parseFloat(x) % contentWidth}px`,
            },
        });

        return () => {
            animationRef.current?.kill();
        };
    }, [children, speed]);

    return (
        <div
            ref={containerRef}
            className={`overflow-hidden w-full whitespace-nowrap flex ${className}`}
        >
            <div
                ref={contentRef}
                style={{
                    flexShrink: 0,
                    minWidth: "100%",
                    display: "inline-block",
                    willChange: "transform"
                }}
            >
                {children}
            </div>
            <div
                ref={cloneRef}
                style={{
                    flexShrink: 0,
                    minWidth: "100%",
                    display: "inline-block",
                    willChange: "transform"
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default Marquee;
