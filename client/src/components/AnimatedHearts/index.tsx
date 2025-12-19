import { Heart } from "lucide-react";
import { useMemo, useState, useCallback, useEffect } from "react";

interface FloatingHeart {
    id: number;
    left: number;
    size: number;
    duration: number;
    delay: number;
    swayDuration: number;
}

interface ExplosionParticle {
    id: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    size: number;
    rotation: number;
}

export const AnimatedHearts = () => {
    const [explodedHearts, setExplodedHearts] = useState<Set<number>>(new Set());
    const [explosions, setExplosions] = useState<ExplosionParticle[]>([]);
    const [animatingParticles, setAnimatingParticles] = useState<Set<string>>(new Set());

    const hearts = useMemo<FloatingHeart[]>(() => {
        return Array.from({ length: 15 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            size: 12 + Math.random() * 20,
            duration: 15 + Math.random() * 10,
            delay: Math.random() * 20,
            swayDuration: 2 + Math.random() * 3,
        }));
    }, []);

    // Start animation after particles are added
    useEffect(() => {
        if (explosions.length > 0) {
            const timer = setTimeout(() => {
                setAnimatingParticles(new Set(explosions.map(p => p.id)));
            }, 10);
            return () => clearTimeout(timer);
        }
    }, [explosions]);

    const handleHeartClick = useCallback(
        (e: React.MouseEvent, heartId: number) => {
            e.stopPropagation();

            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Create 16 particles in a circle
            const particleCount = 16;
            const newParticles: ExplosionParticle[] = [];

            for (let i = 0; i < particleCount; i++) {
                const angle = (i / particleCount) * Math.PI * 2;
                const distance = 60 + Math.random() * 50;
                newParticles.push({
                    id: `${heartId}-${i}-${Date.now()}`,
                    startX: centerX,
                    startY: centerY,
                    endX: centerX + Math.cos(angle) * distance,
                    endY: centerY + Math.sin(angle) * distance,
                    size: 6 + Math.random() * 10,
                    rotation: Math.random() * 360,
                });
            }

            setExplosions(newParticles);
            setAnimatingParticles(new Set());

            // Hide the clicked heart
            setExplodedHearts((prev) => {
                const next = new Set(prev);
                next.add(heartId);
                return next;
            });

            // Remove particles after animation
            setTimeout(() => {
                setExplosions([]);
                setAnimatingParticles(new Set());
            }, 700);

            // Respawn heart after delay
            setTimeout(() => {
                setExplodedHearts((prev) => {
                    const next = new Set(prev);
                    next.delete(heartId);
                    return next;
                });
            }, 2500);
        },
        []
    );

    return (
        <>
            {/* Floating Hearts */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {hearts.map((heart) => {
                    const isExploded = explodedHearts.has(heart.id);
                    return (
                        <div
                            key={heart.id}
                            className="absolute animate-float-heart"
                            style={{
                                left: `${heart.left}%`,
                                ["--duration" as string]: `${heart.duration}s`,
                                ["--delay" as string]: `${heart.delay}s`,
                                pointerEvents: isExploded ? "none" : "auto",
                            }}
                        >
                            <div
                                className="animate-sway"
                                style={{
                                    ["--sway-duration" as string]: `${heart.swayDuration}s`,
                                }}
                            >
                                <Heart
                                    className="fill-current cursor-pointer transition-all duration-300"
                                    onClick={(e) => handleHeartClick(e, heart.id)}
                                    style={{
                                        width: heart.size,
                                        height: heart.size,
                                        color: "var(--heart-color)",
                                        opacity: isExploded ? 0 : 0.4,
                                        transform: isExploded ? "scale(0)" : "scale(1)",
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Explosion Particles */}
            {explosions.map((particle) => {
                const isAnimating = animatingParticles.has(particle.id);
                return (
                    <Heart
                        key={particle.id}
                        className="fixed pointer-events-none z-50 fill-current transition-all duration-500 ease-out"
                        style={{
                            left: isAnimating ? particle.endX : particle.startX,
                            top: isAnimating ? particle.endY : particle.startY,
                            width: particle.size,
                            height: particle.size,
                            color: "var(--heart-color)",
                            opacity: isAnimating ? 0 : 1,
                            transform: `translate(-50%, -50%) scale(${isAnimating ? 0 : 1}) rotate(${isAnimating ? particle.rotation : 0}deg)`,
                        }}
                    />
                );
            })}
        </>
    );
};
