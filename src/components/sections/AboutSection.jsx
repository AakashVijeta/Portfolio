import { lazy, Suspense, useLayoutEffect, useRef } from 'react';
import { useLayoutMode } from '../../hooks/useLayoutMode';

// The hard-drive figure carries ~70 KB of SVG, so it loads after the first paint
const HardDrive = lazy(() => import('../figures/HardDrive'));


const CORE_PRIMARY = ['Python', 'FastAPI'];
const CORE_REST = [
  'React',
  'scikit-learn', 
  'PostgreSQL', 'Pandas', 'NumPy',
  'GSAP',
  'Node.js', 'SQL',
];

const SOFT_PRIMARY = ['Problem Solving', 'Critical Thinking'];
const SOFT_REST = [
  'Autonomy', 'Curiosity',
  'Collaboration', 'Creativity',
];

const EDUCATION = [
  {
    org: 'IIT GUWAHATI',
    range: '2024 - 2028',
    line: 'BACHELOR — Data Science & Artificial Intelligence',
  },
  {
    org: 'SELF-DIRECTED',
    range: '2021 - 2024',
    line: 'Systems Programming, Statistical Learning & Applied Mathematics',
  },
];

const EXPERIENCES = [
  {
    org: '[F1 PODIUM PREDICTOR]',
    range: '2026',
    line: 'Gradient-boosted classifier with calibrated probability output & race-lifecycle state machine',
  },
  {
    org: '[NIFTYEDGE]',
    range: '2026',
    line: 'Walk-forward XGBoost signal engine with sector momentum & volume-weighted feature construction',
  },
  {
    org: '[INDEPENDENT R&D]',
    range: '2024 - PRESENT',
    line: 'Continuous iteration across ML pipelines, backend systems, and quantitative research',
  },
];

export default function AboutSection({ isActive }) {
  const mode = useLayoutMode();
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    if (!isActive) return;
  }, [isActive]);

  const availability = (
    <div className="status-wrapper">
      <div className="status-bg-scroll" />
      <div className="status-header">
        <span className="status-dot" />
        AVAILABILITY
      </div>
      <div className="status-main">OPEN TO WORK</div>
      <div className="status-footer">
        <span>// CONTRACTS: ENABLED</span>
        <span>[REMOTE_READY]</span>
      </div>
    </div>
  );

  return (
    <section
      ref={rootRef}
      className="section section-stripe about-profiler"
      data-enter-stagger="0.09"
      style={mode === 'paged' ? {
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
        padding: 0,
        overflow: 'hidden',
      } : undefined}
    >
      <header className="profiler-head section-enter-item">
        <div className="profiler-head-row">
          <h2 className="profiler-title" data-parallax="24"><span className="reveal-line"><span className="reveal-chars">SUBJECT PROFILE</span></span></h2>
          <div className="profiler-head-meta">
            <div>STATUS: ACTIVE DEVELOPMENT</div>
          </div>
        </div>
        <hr className="profiler-rule reveal-rule" />
      </header>

      <div className="profiler-main-scroll custom-scrollbar section-scroll">
        <div className="profiler-container">

        {/* LEFT — IDENTITY */}
        <div className="profiler-module col-identity section-enter-item" data-enter-from="left">
          <div className="identity-name">AAKASH VIJETA</div>

          <div className="fingerprint-scanner reveal-wipe">
            <div className="scanner-frame-profile">
              <div className="scanner-grid-overlay-profile" />
              <div className="face-target-box-profile">
                <div className="ft-corner-profile ft-tl" />
                <div className="ft-corner-profile ft-tr" />
                <div className="ft-corner-profile ft-bl" />
                <div className="ft-corner-profile ft-br" />
              </div>
              <div className="scan-data-profile data-top-profile">REC_ACTIVE [●]</div>
              <div className="scan-data-profile data-bot-profile reveal-count">ISO_FACE_ID: 99.9%</div>
            </div>
            <div className="scan-beam-track">
              <div className="scan-beam" />
            </div>
          </div>

          <div className="id-data-grid">
            <div className="id-cell"><span className="id-key">DOMAIN:</span><span className="id-val">ML · QUANT · SYSTEMS</span></div>
            <div className="id-cell"><span className="id-key">LEVEL:</span><span className="id-val">UNDERGRADUATE</span></div>
            <div className="id-cell"><span className="id-key">LANG_1:</span><span className="id-val">Hindi (Native)</span></div>
            <div className="id-cell"><span className="id-key">LANG_2:</span><span className="id-val">English (Fluent)</span></div>
            {availability}
          </div>
        </div>

        {/* MIDDLE — BEHAVIOR */}
        <div className="profiler-module col-behavior section-enter-item">
          <div className="analysis-header">
            <span>COMPETENCE_ANALYSIS_REPORT</span>
            <span className="analysis-readonly">[READ_ONLY]</span>
          </div>
          <div className="psych-report">
            <p className="psych-bio">
              I build at the intersection of{' '}
              <span className="hl-1">statistical inference</span> and{' '}
              <span className="hl-2">production engineering</span>. My work goes beyond model accuracy —
              I design the pipelines, state machines, and APIs that make predictions usable in the real world.
            </p>
            <div className="dossier-history">
              <div className="history-block">
                <h4 className="history-block-title">// ACADEMIC_LOG [EDUCATION]</h4>
                {EDUCATION.map((e) => (
                  <div className="history-item reveal-child" key={e.org}>
                    <div className="history-header">
                      <span className="history-date">[{e.org}]</span>
                      <span className="history-period">{e.range}</span>
                    </div>
                    <div className="history-line">{e.line}</div>
                  </div>
                ))}
              </div>
              <div className="history-block">
                <h4 className="history-block-title">// FIELD_OPERATIONS [EXPERIENCE]</h4>
                {EXPERIENCES.map((x) => (
                  <div className="history-item reveal-child" key={x.org}>
                    <div className="history-header">
                      <span className="history-date">{x.org}</span>
                      <span className="history-period">{x.range}</span>
                    </div>
                    <div className="history-line">{x.line}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — CAPABILITIES */}
        <div className="col-capabilities-wrapper section-enter-item" data-enter-from="right">
          <div className="profiler-module cap-top">
            <div className="cap-inv-label">EQUIPMENT_INVENTORY</div>

            <div className="tech-category">
              <span className="cat-title cat-accent">HARD SKILLS</span>
              <hr className="cat-rule" />
              <div className="chips-primary">
                {CORE_PRIMARY.map((s) => (
                  <div className="tech-chip tech-chip-primary reveal-child" key={s}>{s}</div>
                ))}
              </div>
              <div className="chips-grid">
                {CORE_REST.map((s) => (
                  <div className="tech-chip reveal-child" key={s}>{s}</div>
                ))}
              </div>
            </div>

            <div className="tech-category">
              <span className="cat-title cat-accent">SOFT SKILLS</span>
              <hr className="cat-rule" />
              <div className="chips-primary">
                {SOFT_PRIMARY.map((s) => (
                  <div className="tech-chip tech-chip-primary reveal-child" key={s}>{s}</div>
                ))}
              </div>
              <div className="chips-grid">
                {SOFT_REST.map((s) => (
                  <div className="tech-chip reveal-child" key={s}>{s}</div>
                ))}
              </div>
            </div>

            <Suspense fallback={null}>
              <HardDrive />
            </Suspense>
          </div>
        </div>

        </div>
      </div>

      <footer className="profiler-foot section-enter-item">
        <hr className="profiler-rule reveal-rule" />
        <div className="profiler-foot-inner">
          <div className="foot-version">SYSTEMS_REPORT_V.2.0.46</div>
          <div className="profiler-head-meta">S/N: 2005-10-11-AAK</div>
        </div>
      </footer>
    </section>
  );
}
