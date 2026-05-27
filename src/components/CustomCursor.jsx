import { useEffect, useRef, useState } from 'react';

const INTERACTIVE_SEL = [
  'a',
  'button',
  '[role="button"]',
  'input',
  'textarea',
  'select',
  'label[for]',
  '.project-bar:not(.project-bar-classified)',
  '.nav-dot-btn',
  '.theme-toggle',
  '[data-cursor]',
].join(',');

function clean(text) {
  return text ? text.replace(/[↗\s]+/g, ' ').trim() : '';
}

function hintFor(el) {
  if (!el) return '';
  const custom = el.getAttribute('data-cursor');
  if (custom) return `// ${custom.toUpperCase()}`;
  const aria = el.getAttribute('aria-label');
  const tag = el.tagName.toLowerCase();

  if (el.classList.contains('project-bar')) {
    const title = clean(el.querySelector('.strip-title')?.textContent);
    return title ? `// OPEN · ${title.toUpperCase()}` : '// OPEN EVIDENCE';
  }
  if (el.classList.contains('nav-dot-btn')) {
    return aria ? `// JUMP · ${aria.toUpperCase()}` : '// JUMP TO SECTION';
  }
  if (el.classList.contains('theme-toggle')) return '// SWITCH THEME';

  if (tag === 'a') {
    if (el.classList.contains('pane-link-btn-secondary')) {
      const text = clean(el.textContent);
      return text ? `// VIEW REPO · ${text.toUpperCase()}` : '// VIEW REPO ↗';
    }
    if (el.classList.contains('pane-link-btn')) return '// LAUNCH APP ↗';
    if (el.target === '_blank') {
      const text = clean(el.textContent);
      if (text && text.length < 32) return `// OPEN · ${text.toUpperCase()} ↗`;
      return '// OPEN LINK ↗';
    }
    return aria ? `// ${aria.toUpperCase()}` : '// FOLLOW LINK';
  }

  if (tag === 'button' || el.getAttribute('role') === 'button') {
    if (aria) return `// ${aria.toUpperCase()}`;
    const text = clean(el.textContent);
    if (text && text.length < 32) return `// ${text.toUpperCase()}`;
    return '// CLICK';
  }
  if (tag === 'input' || tag === 'textarea') return '// TYPE HERE';
  if (tag === 'select') return '// SELECT';
  return '// HOVER';
}

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  const targetPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);
  const currentTargetRef = useRef(null);

  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState('default');
  const [hint, setHint] = useState('');

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const updateHoverState = (el) => {
      const interactive = el && el.closest ? el.closest(INTERACTIVE_SEL) : null;
      if (interactive !== currentTargetRef.current) {
        currentTargetRef.current = interactive;
        if (interactive) {
          setMode((m) => (m === 'press' ? m : 'hover'));
          setHint(hintFor(interactive));
        } else {
          setMode((m) => (m === 'press' ? m : 'default'));
          setHint('');
        }
      }
    };

    const onMove = (e) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      setCoords({ x: e.clientX, y: e.clientY });
      updateHoverState(e.target);
    };

    const onDown = () => setMode('press');
    const onUp = () => {
      setMode(currentTargetRef.current ? 'hover' : 'default');
    };

    const onLeave = () => {
      currentTargetRef.current = null;
      setMode('default');
      setHint('');
    };

    const tick = () => {
      const t = targetPos.current;
      ringPos.current.x += (t.x - ringPos.current.x) * 0.18;
      ringPos.current.y += (t.y - ringPos.current.y) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${t.x}px, ${t.y}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%)`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate(${t.x + 14}px, ${t.y + 8}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return null;

  return (
    <>
      <div ref={dotRef} className={`cc-dot cc-${mode}`} />
      <div ref={ringRef} className={`cc-ring cc-${mode}`} />
      <div ref={labelRef} className={`cc-label cc-label-${mode}`}>
        {hint || `X: ${coords.x} Y: ${coords.y}`}
      </div>
    </>
  );
}
