import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function IntroSection({ isActive }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;
    const el = rootRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const boot = el.querySelectorAll('.intro-boot-line');
    const name1 = el.querySelector('.intro-name-a');
    const name2 = el.querySelector('.intro-name-b');
    const meta = el.querySelectorAll('.intro-meta');

    gsap.killTweensOf([boot, name1, name2, meta]);
    gsap.set([boot, name1, name2, meta], { opacity: 0 });
    gsap.set([name1, name2], { y: 40, skewX: -6 });

    const tl = gsap.timeline();
    tl.to(boot, { opacity: 1, duration: 0.3, stagger: 0.09, ease: 'none' }, 0)
      .to(name1, { opacity: 1, y: 0, skewX: 0, duration: 0.6, ease: 'power3.out' }, 0.35)
      .to(name2, { opacity: 1, y: 0, skewX: 0, duration: 0.6, ease: 'power3.out' }, 0.48)
      .to(meta, { opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' }, 0.75);

    return () => { tl.kill(); };
  }, [isActive]);

  return (
    <section
      ref={rootRef}
      className="section section-stripe intro-hero"
      style={{
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
        padding: '6vh 6vw',
        position: 'relative',
      }}
    >
      {/* Boot lines (Terminal) / driver tag (F1) — top cluster */}
      <div className="intro-top" style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(0.6rem, 1vw, 0.75rem)',
        letterSpacing: '0.35em',
        color: 'var(--color-accent)',
        textTransform: 'uppercase',
        marginBottom: 'clamp(24px, 4vh, 48px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        <span className="intro-boot-line intro-boot-terminal">&gt; booting portfolio_v3 ...</span>
        <span className="intro-boot-line intro-boot-terminal">&gt; handshake ok · theme=crt</span>
        <span className="intro-boot-line intro-boot-terminal">&gt; ready.</span>
        <span className="intro-boot-line intro-boot-f1">DRIVER · NO. 07</span>
        <span className="intro-boot-line intro-boot-f1">TEAM · AAKASH RACING</span>
        <span className="intro-boot-line intro-boot-f1">STATUS · ON TRACK</span>
      </div>

      {/* Giant name-mark */}
      <div className="intro-namewrap">
        <div className="intro-name-a intro-name">AAKASH</div>
        <div className="intro-name-b intro-name">VIJETA<span className="intro-name-cursor" aria-hidden="true">_</span></div>
        <div className="intro-speedline" aria-hidden="true" />
      </div>

      {/* Bottom meta row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: '24px',
        marginTop: 'clamp(24px, 4vh, 48px)',
        flexWrap: 'wrap',
      }}>
        <div className="intro-meta" style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(0.65rem, 1vw, 0.8rem)',
          letterSpacing: '0.3em',
          color: 'var(--color-text)',
          textTransform: 'uppercase',
        }}>
          Full Stack Developer · IIT Guwahati
        </div>
        <div className="intro-meta" style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(0.6rem, 0.9vw, 0.7rem)',
          letterSpacing: '0.3em',
          color: 'var(--color-muted)',
          textTransform: 'uppercase',
        }}>
          ML · Systems · Applied Math
        </div>
      </div>
    </section>
  );
}
