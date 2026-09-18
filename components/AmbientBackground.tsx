'use client';

import { useEffect, useRef } from 'react';

export default function AmbientBackground({ cursorEffect = true }: { cursorEffect?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    const particles: {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      alpha: number;
      hue: number;
    }[] = [];
    let animationId = 0;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 130; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        alpha: Math.random() * 0.45 + 0.1,
        hue: Math.random() > 0.5 ? 210 : 265,
      });
    }

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 3;
    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    const draw = (t: number) => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, W, H);

      const g1 = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, W * 0.5);
      g1.addColorStop(0, 'rgba(70,100,240,0.045)');
      g1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      const g2 = ctx.createRadialGradient(mx, my, 0, mx, my, 220);
      g2.addColorStop(0, 'rgba(90,140,255,0.035)');
      g2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      particles.forEach((p) => {
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          p.vx += dx * 0.000035;
          p.vy += dy * 0.000035;
        }
        p.vx *= 0.998;
        p.vy *= 0.998;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.0008 + p.x * 0.01);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha * pulse})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 85) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(110,150,255,${0.055 * (1 - d / 85)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };
    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  useEffect(() => {
    if (!cursorEffect) return;

    let mouseX = -999;
    let mouseY = -999;
    let trailX = -999;
    let trailY = -999;
    const particles: {
      x: number;
      y: number;
      r: number;
      maxR: number;
      opacity: number;
      vx: number;
      vy: number;
      color: string;
    }[] = [];
    let animId = 0;

    const cursorCanvas = document.createElement('canvas');
    cursorCanvas.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(cursorCanvas);
    const ctx = cursorCanvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      cursorCanvas.width = window.innerWidth;
      cursorCanvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      const prevX = mouseX;
      const prevY = mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (prevX === -999) {
        trailX = mouseX;
        trailY = mouseY;
        return;
      }

      const dx = mouseX - prevX;
      const dy = mouseY - prevY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 3) {
        const count = Math.min(Math.floor(dist * 0.12), 2);
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 0.4 + 0.1;
          const colors = [
            'rgba(147, 197, 253, 0.1)',
            'rgba(196, 181, 253, 0.1)',
            'rgba(255, 255, 255, 0.08)',
          ];
          particles.push({
            x: mouseX + (Math.random() - 0.5) * 8,
            y: mouseY + (Math.random() - 0.5) * 8,
            r: Math.random() * 2 + 2,
            maxR: Math.random() * 7 + 4,
            opacity: 0.12,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.15,
            color: colors[Math.floor(Math.random() * colors.length)],
          });
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

      if (mouseX !== -999) {
        if (trailX === -999) {
          trailX = mouseX;
          trailY = mouseY;
        } else {
          trailX += (mouseX - trailX) * 0.085;
          trailY += (mouseY - trailY) * 0.085;
        }

        const auraGrd = ctx.createRadialGradient(trailX, trailY, 0, trailX, trailY, 40);
        auraGrd.addColorStop(0, 'rgba(147, 197, 253, 0.05)');
        auraGrd.addColorStop(0.5, 'rgba(196, 181, 253, 0.02)');
        auraGrd.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrd;
        ctx.beginPath();
        ctx.arc(trailX, trailY, 40, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.r += (p.maxR - p.r) * 0.025;
        p.opacity -= 0.003;

        if (p.opacity <= 0 || p.r >= p.maxR) {
          particles.splice(i, 1);
          continue;
        }

        const particleGrd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        const baseColor = p.color.replace('0.1', p.opacity.toFixed(3)).replace('0.08', p.opacity.toFixed(3));
        const fadeColor = p.color.replace('0.1', '0').replace('0.08', '0');
        particleGrd.addColorStop(0, baseColor);
        particleGrd.addColorStop(1, fadeColor);

        ctx.fillStyle = particleGrd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
      document.body.removeChild(cursorCanvas);
    };
  }, [cursorEffect]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(90, 120, 255, 0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(120, 60, 200, 0.08) 0%, transparent 60%), #060608',
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
