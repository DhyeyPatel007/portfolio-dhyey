import { useEffect, useRef } from 'react';

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const disc = discRef.current;
    if (!dot || !disc) return;
    let mx = -100, my = -100, dx = -100, dy = -100;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
      const t = e.target as HTMLElement | null;
      const hot = t?.closest('a, button, [data-hover]');
      disc.classList.toggle('on', !!hot);
    };
    const loop = () => {
      dx += (mx - dx) * 0.14;
      dy += (my - dy) * 0.14;
      disc.style.left = dx + 'px';
      disc.style.top = dy + 'px';
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="cursor-disc" ref={discRef} />
      <div className="cursor-dot" ref={dotRef} />
    </>
  );
}
