import { useEffect, useRef, useState } from "react";

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
    options: IntersectionObserverInit = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
) {
    const ref = useRef<T>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(element); // Only animate once
                }
            },
            options
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [options]);

    return { ref, isVisible };
}
