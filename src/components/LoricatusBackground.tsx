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
                ctx.scale(this.scale * 1.5, this.scale * 1.5); // Kicsit nagyobb méret a részletekért
                ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI / 2);
                ctx.globalAlpha = this.opacity;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1;

                const time = Date.now() * 0.02; // Animációs időalap

                // --- REALISZTIKUS LORICATUS FLOTTA (Pixel-Perfect Tech-Art) ---
                switch (this.type) {
                    case 0: // DJI MAVIC 3 — Sleek Consumer Drone
                        // Karok (Folded-look arms)
                        ctx.beginPath();
                        ctx.moveTo(-8, -10); ctx.lineTo(-4, -2);
                        ctx.moveTo(8, -10); ctx.lineTo(4, -2);
                        ctx.moveTo(-10, 8); ctx.lineTo(-4, 0);
                        ctx.moveTo(10, 8); ctx.lineTo(4, 0);
                        ctx.stroke();
                        // Géptest
                        ctx.strokeRect(-4, -6, 8, 12);
                        // Kamera modul
                        ctx.strokeRect(-2, -8, 4, 3);
                        // Propellerek (forgó effekt)
                        this.drawProp(ctx, -8, -10, time);
                        this.drawProp(ctx, 8, -10, time);
                        this.drawProp(ctx, -10, 8, time);
                        this.drawProp(ctx, 10, 8, time);
                        break;

                    case 1: // DJI MATRICE 350 RTK — Heavy Industrial
                        // Vastag váz
                        ctx.strokeRect(-6, -8, 12, 16);
                        // RTK modulok a sarkokon
                        ctx.strokeRect(-8, -10, 4, 4);
                        ctx.strokeRect(4, -10, 4, 4);
                        // Hosszú motortartó karok
                        ctx.beginPath();
                        ctx.moveTo(-6, -6); ctx.lineTo(-15, -15);
                        ctx.moveTo(6, -6); ctx.lineTo(15, -15);
                        ctx.moveTo(-6, 6); ctx.lineTo(-15, 15);
                        ctx.moveTo(6, 6); ctx.lineTo(15, 15);
                        ctx.stroke();
                        // Nagy propellerek
                        this.drawProp(ctx, -15, -15, time * 0.8, 8);
                        this.drawProp(ctx, 15, -15, time * 0.8, 8);
                        this.drawProp(ctx, -15, 15, time * 0.8, 8);
                        this.drawProp(ctx, 15, 15, time * 0.8, 8);
                        break;

                    case 2: // LEICA RTC360 SCANNERT — Vertical Precision
                        ctx.rotate(-(Math.atan2(this.vy, this.vx) + Math.PI / 2)); // Fix állású marad
                        // Test sziluett
                        ctx.beginPath();
                        ctx.moveTo(-6, 10); ctx.lineTo(-6, -6);
                        ctx.lineTo(0, -12); ctx.lineTo(6, -6);
                        ctx.lineTo(6, 10); ctx.closePath();
                        ctx.stroke();
                        // Forgó lézer egység középen
                        ctx.beginPath();
                        ctx.arc(0, -2, 4, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(0, -2);
                        ctx.lineTo(Math.cos(time * 0.5) * 4, -2 + Math.sin(time * 0.5) * 4);
                        ctx.stroke();
                        break;

                    case 3: // DJI AVATA 2 — Cinewhoop
                        // Propeller védő gyűrűk (Ducts)
                        ctx.beginPath();
                        ctx.arc(-8, -8, 7, 0, Math.PI * 2);
                        ctx.arc(8, -8, 7, 0, Math.PI * 2);
                        ctx.arc(-8, 8, 7, 0, Math.PI * 2);
                        ctx.arc(8, 8, 7, 0, Math.PI * 2);
                        ctx.stroke();
                        // X váz és test
                        ctx.beginPath();
                        ctx.moveTo(-8, -8); ctx.lineTo(8, 8);
                        ctx.moveTo(8, -8); ctx.lineTo(-8, 8);
                        ctx.stroke();
                        ctx.strokeRect(-3, -5, 6, 10);
                        // Kamera
                        ctx.beginPath(); ctx.arc(0, -6, 2, 0, Math.PI * 2); ctx.stroke();
                        // Gyors forgású belső propellerek
                        this.drawProp(ctx, -8, -8, time * 2, 5);
                        this.drawProp(ctx, 8, -8, time * 2, 5);
                        this.drawProp(ctx, -8, 8, time * 2, 5);
                        this.drawProp(ctx, 8, 8, time * 2, 5);
                        break;
                }

                // Központi neon szenzor
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }

            // Segédmetódus a forgó propeller rajzolásához
            drawProp(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, r: number = 5) {
                ctx.beginPath();
                ctx.moveTo(x + Math.cos(t) * r, y + Math.sin(t) * r);
                ctx.lineTo(x - Math.cos(t) * r, y - Math.sin(t) * r);
                ctx.stroke();
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
            ctx.clearRect(0, 0, canvas.width, canvas.height);

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
