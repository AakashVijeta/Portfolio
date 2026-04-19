const CORE_PRIMARY = ['Python', 'FastAPI'];
const CORE_REST = [
  'React', 'TypeScript',
  'scikit-learn', 'XGBoost',
  'PostgreSQL', 'Docker',
  'Pandas', 'NumPy',
  'Vite', 'GSAP',
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
    range: '2021 - PRESENT',
    line: 'Continuous iteration across ML pipelines, backend systems, and quantitative research',
  },
];

export default function AboutSection() {
  return (
    <section
      className="section section-stripe about-profiler section-scroll"
      style={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px clamp(32px, 4vw, 72px) 36px',
        overflow: 'hidden',
      }}
    >
      <header className="profiler-head section-enter-item">
        <div className="profiler-head-row">
          <h2 className="profiler-title">SUBJECT PROFILE</h2>
          <div className="profiler-head-meta">
            <div>REF: AV-01 · IIT GUWAHATI</div>
            <div>STATUS: ACTIVE DEVELOPMENT</div>
          </div>
        </div>
        <hr className="profiler-rule" />
      </header>

      <div className="profiler-container">

        {/* LEFT — IDENTITY */}
        <div className="profiler-module col-identity section-enter-item">
          <div className="identity-name">AAKASH VIJETA</div>

          <div className="fingerprint-scanner">
            <div className="scanner-frame-profile">
              <div className="scanner-grid-overlay-profile" />
              <div className="face-target-box-profile">
                <div className="ft-corner-profile ft-tl" />
                <div className="ft-corner-profile ft-tr" />
                <div className="ft-corner-profile ft-bl" />
                <div className="ft-corner-profile ft-br" />
              </div>
              <div className="scan-data-profile data-top-profile">REC_ACTIVE [●]</div>
              <div className="scan-data-profile data-bot-profile">ISO_FACE_ID: 99.9%</div>
            </div>
            <div className="scan-beam" />
          </div>

          <div className="id-data-grid">
            <div className="id-cell"><span className="id-key">DOMAIN:</span><span className="id-val">ML · QUANT · SYSTEMS</span></div>
            <div className="id-cell"><span className="id-key">LEVEL:</span><span className="id-val">UNDERGRADUATE</span></div>
            <div className="id-cell"><span className="id-key">LANG_1:</span><span className="id-val">Hindi (Native)</span></div>
            <div className="id-cell"><span className="id-key">LANG_2:</span><span className="id-val">English (Fluent)</span></div>
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
                  <div className="history-item" key={e.org}>
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
                  <div className="history-item" key={x.org}>
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
        <div className="col-capabilities-wrapper section-enter-item">
          <div className="profiler-module cap-top">
            <div className="cap-inv-label">EQUIPMENT_INVENTORY</div>

            <div className="tech-category">
              <span className="cat-title cat-accent">HARD SKILLS</span>
              <hr className="cat-rule" />
              <div className="chips-primary">
                {CORE_PRIMARY.map((s) => (
                  <div className="tech-chip tech-chip-primary" key={s}>{s}</div>
                ))}
              </div>
              <div className="chips-grid">
                {CORE_REST.map((s) => (
                  <div className="tech-chip" key={s}>{s}</div>
                ))}
              </div>
            </div>

            <div className="tech-category">
              <span className="cat-title cat-accent">SOFT SKILLS</span>
              <hr className="cat-rule" />
              <div className="chips-primary">
                {SOFT_PRIMARY.map((s) => (
                  <div className="tech-chip tech-chip-primary" key={s}>{s}</div>
                ))}
              </div>
              <div className="chips-grid">
                {SOFT_REST.map((s) => (
                  <div className="tech-chip" key={s}>{s}</div>
                ))}
              </div>
            </div>

            <div className="threat-level cap-inner-threat">
              <div className="alert-box">
                <svg className="alert-svg" viewBox="0 0 100 100">
                  <path className="triangle-bg" d="M50,15 L90,85 L10,85 Z" />
                  <path className="triangle-outline" d="M50,15 L90,85 L10,85 Z" />
                  <path className="triangle-line" d="M50,15 L90,85 L10,85 Z" />
                  <rect className="alert-mark-bar" x="48" y="35" width="4" height="25" />
                  <circle className="alert-mark-dot" cx="50" cy="72" r="3" />
                </svg>
              </div>
              <div className="danger-label">DANGER: HIGH</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
