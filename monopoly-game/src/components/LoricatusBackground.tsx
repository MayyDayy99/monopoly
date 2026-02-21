import React, { useEffect, useRef } from 'react';

// Loricatus Színpaletta
const NEON_GREEN = '#c7fe1b';
const TECH_BLUE = '#0ea5e9';
const BG_DEEP = '#0a0a0a';

/**
 * LORICATUS DRÓN FLOTTA — Canvas Animációs Motor
 * Szigorú fizikai szabályok: Wander, Screen Wrap és Boids-alapú Separation.
 */
export const LoricatusBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let drones: Drone[] = [];
        let animationFrameId: number;

        // ─── KONFIGURÁCIÓ ───
        const DRONE_COUNT = 15;
        const MIN_DISTANCE = 100; // Separation távolság (pixel)
        const REPULSION_FORCE = 0.05; // Taszító erő mértéke
        const WANDER_STRENGTH = 0.02; // Irányváltoztatási hajlam

        // ─── DRÓN OSZTÁLY ───
        class Drone {
            x: number;
            y: number;
            vx: number;
            vy: number;
            type: number; // 0: Quad, 1: Wing, 2: Scanner, 3: Hexa
            scale: number;
            opacity: number;
            color: string;
            angle: number;
            speed: number;

            constructor(w: number, h: number) {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.type = Math.floor(Math.random() * 4);
                this.scale = 0.5 + Math.random() * 1.25; // Parallax mélység
                this.opacity = 0.1 + (this.scale / 2);
                this.color = Math.random() > 0.5 ? NEON_GREEN : TECH_BLUE;

                this.angle = Math.random() * Math.PI * 2;
                this.speed = (0.5 + Math.random() * 1) * (this.scale * 0.8);
                this.vx = Math.cos(this.angle) * this.speed;
                this.vy = Math.sin(this.angle) * this.speed;
            }

            update(w: number, h: number, allDrones: Drone[]) {
                // 1. Wander: Finom irányváltoztatás szinuszos módosítással
                this.angle += (Math.random() - 0.5) * WANDER_STRENGTH;
                const targetVx = Math.cos(this.angle) * this.speed;
                const targetVy = Math.sin(this.angle) * this.speed;

                // Finom átmenet az új irányba (Loricatus fluiditás)
                this.vx += (targetVx - this.vx) * 0.1;
                this.vy += (targetVy - this.vy) * 0.1;

                // 2. Separation: Ütközéselkerülés (LiDAR szenzor szimuláció)
                allDrones.forEach(other => {
                    if (other === this) return;
                    const dx = this.x - other.x;
                    const dy = this.y - other.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < MIN_DISTANCE * this.scale) {
                        // Taszító erő az inverz távolság alapján
                        const force = (MIN_DISTANCE * this.scale - dist) / (MIN_DISTANCE * this.scale);
                        this.vx += (dx / dist) * force * REPULSION_FORCE;
                        this.vy += (dy / dist) * force * REPULSION_FORCE;
                    }
                });

                // Pozíció frissítése
                this.x += this.vx;
                this.y += this.vy;

                // 3. Screen Wrap: Átfordulás a széleken
                if (this.x < -50) this.x = w + 50;
                if (this.x > w + 50) this.x = -50;
                if (this.y < -50) this.y = h + 50;
                if (this.y > h + 50) this.y = -50;
            }

            draw(ctx: CanvasRenderingContext2D) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.scale(this.scale, this.scale);
                ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI / 2);
                ctx.globalAlpha = this.opacity;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1.5;

                // Típus-specifikus rajzolás (SVG Mester kódalapú vektorgrafika)
                switch (this.type) {
                    case 0: // Quadcopter (X váz)
                        ctx.beginPath();
                        ctx.moveTo(-10, -10); ctx.lineTo(10, 10);
                        ctx.moveTo(10, -10); ctx.lineTo(-10, 10);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.arc(-10, -10, 4, 0, Math.PI * 2);
                        ctx.arc(10, -10, 4, 0, Math.PI * 2);
                        ctx.stroke();
                        break;
                    case 1: // Flying Wing (V alak)
                        ctx.beginPath();
                        ctx.moveTo(0, -12); ctx.lineTo(-15, 8);
                        ctx.lineTo(0, 2); ctx.lineTo(15, 8);
                        ctx.closePath();
                        ctx.stroke();
                        break;
                    case 2: // Scanner (Kör + forgó fej)
                        ctx.beginPath();
                        ctx.arc(0, 0, 8, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(0, 0); ctx.lineTo(0, -12);
                        ctx.stroke();
                        break;
                    case 3: // Hexacopter (Csillag váz)
                        for (let i = 0; i < 6; i++) {
                            ctx.rotate(Math.PI / 3);
                            ctx.beginPath();
                            ctx.moveTo(0, 0); ctx.lineTo(0, -12);
                            ctx.stroke();
                        }
                        break;
                }

                // Központi "szenzor" pont
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }

        // ─── INITIALIZATION ───
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drones = [];
            for (let i = 0; i < DRONE_COUNT; i++) {
                drones.push(new Drone(canvas.width, canvas.height));
            }
        };

        window.addEventListener('resize', resize);
        resize();

        // ─── RENDER LOOP ───
        const render = () => {
            // Blueprint rács az ürítés helyett (nagyon halvány)
            ctx.fillStyle = BG_DEEP;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Halvány rácsvonalak
            ctx.strokeStyle = 'rgba(30, 41, 59, 0.3)';
            ctx.lineWidth = 0.5;
            const gridSize = 50;
            ctx.beginPath();
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
            }
            ctx.stroke();

            // Drónok update és draw
            drones.forEach(drone => {
                drone.update(canvas.width, canvas.height, drones);
                drone.draw(ctx);
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                background: BG_DEEP,
                display: 'block'
            }}
        />
    );
};
