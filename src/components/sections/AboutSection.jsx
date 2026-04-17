const BASE = import.meta.env.BASE_URL;

const CORE_SKILLS = [
  'Python', 'React', 'TypeScript', 'FastAPI',
  'scikit-learn', 'XGBoost', 'PostgreSQL', 'Docker',
  'Pandas', 'NumPy', 'Vite', 'GSAP',
  'Node.js', 'SQL',
];

const SOFT_SKILLS = [
  'Problem Solving', 'Critical Thinking',
  'Autonomy', 'Curiosity',
  'Collaboration', 'Creativity',
];

const EDUCATION = [
  {
    org: 'IIT GUWAHATI',
    range: '2023 — 2027',
    line: 'B.TECH - Data Science & Artificial Intelligence',
  },
];

const EXPERIENCES = [
  {
    org: '[3 YEARS BUILDING]',
    range: '2023 — 2026',
    line: 'PROJECTS - F1 Podium Predictor · NiftyEdge',
  },
  {
    org: '[INTERNSHIPS + LABS]',
    range: '2024 — 2026',
    line: 'VARIOUS - ML Research · Applied Systems',
  },
  {
    org: '[8 YEARS PROGRAMMING]',
    range: '2018 — 2026',
    line: 'TOTAL_RUNTIME - Continuous Learning Protocol',
  },
];

export default function AboutSection() {
  return (
    <section
      className="section section-stripe about-v2"
      style={{
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        padding: '32px 48px 32px',
        gap: '20px',
        overflow: 'hidden',
      }}
    >
      {/* TOP BAR */}
      <div className="about-v2-topbar section-enter-item">
        <div className="about-v2-title">SUBJECT PROFILE</div>
        <div className="about-v2-topmeta">
          <div>CASE FILE: AV-03</div>
          <div>STATUS: BUILDING</div>
        </div>
      </div>

      {/* 3-COLUMN GRID */}
      <div className="about-v2-grid">

        {/* LEFT COLUMN */}
        <aside className="about-v2-left section-enter-item">
          <div className="about-v2-subjectname">AAKASH VIJETA</div>
          <div className="about-v2-photo">
            <img src={BASE + 'profile.png'} alt="Aakash Vijeta" />
            <div className="about-v2-photo-bracket tl" />
            <div className="about-v2-photo-bracket tr" />
            <div className="about-v2-photo-bracket bl" />
            <div className="about-v2-photo-bracket br" />
          </div>
          <div className="about-v2-fields">
            <div><span>CLASS</span><span>ML_ENGINEER</span></div>
            <div><span>N. LEVEL</span><span>B.TECH_DS+AI</span></div>
            <div><span>LVL_1</span><span>EN (Fluent)</span></div>
            <div><span>LVL_2</span><span>HI (Native)</span></div>
          </div>
          <div className="about-v2-status-alert">
            <span className="about-v2-status-chip">STATUS: ALERT</span>
            <div className="about-v2-status-main">OPEN TO WORK</div>
            <div className="about-v2-status-sub">
              <span>INTERNSHIPS</span>
              <span>REMOTE_READY</span>
            </div>
          </div>
        </aside>

        {/* MIDDLE COLUMN */}
        <div className="about-v2-mid section-enter-item">
          <div className="about-v2-mid-header">
            <span>COMPETENCE_ANALYSIS_REPORT</span>
            <span className="about-v2-readonly">[READ_ONLY]</span>
          </div>

          <p className="about-v2-bio">
            Builder obsessed with the intersection of <span className="hl-1">machine learning</span>,{' '}
            <span className="hl-2">software engineering</span>, and applied mathematics.
            I don't just train models — I ship intelligent systems that are both
            technically rigorous and actually useful.
          </p>

          {/* Academic log */}
          <div className="about-v2-subhead">// ACADEMIC_LOG [EDUCATION]</div>
          {EDUCATION.map((e) => (
            <div className="about-v2-record" key={e.org}>
              <div className="about-v2-record-top">
                <span className="about-v2-record-org">[{e.org}]</span>
                <span className="about-v2-record-range">{e.range}</span>
              </div>
              <div className="about-v2-record-line">{e.line}</div>
            </div>
          ))}

          {/* Field operations */}
          <div className="about-v2-subhead" style={{ marginTop: '18px' }}>
            // FIELD_OPERATIONS [EXPERIENCES]
          </div>
          {EXPERIENCES.map((x) => (
            <div className="about-v2-record" key={x.org}>
              <div className="about-v2-record-top">
                <span className="about-v2-record-org">{x.org}</span>
                <span className="about-v2-record-range">{x.range}</span>
              </div>
              <div className="about-v2-record-line">{x.line}</div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN */}
        <aside className="about-v2-right section-enter-item">
          <div className="about-v2-right-header">SUBJECT_INVENTORY</div>

          <div className="about-v2-inv-label">CORE_SKILLS</div>
          <div className="about-v2-chipgrid">
            {CORE_SKILLS.map((s) => (
              <span className="about-v2-chip" key={s}>{s}</span>
            ))}
          </div>

          <div className="about-v2-inv-label" style={{ marginTop: '18px' }}>SOFT_SKILLS</div>
          <div className="about-v2-chipgrid">
            {SOFT_SKILLS.map((s) => (
              <span className="about-v2-chip" key={s}>{s}</span>
            ))}
          </div>

          <div className="about-v2-danger">
            <div className="about-v2-danger-icon">▲</div>
            <div className="about-v2-danger-label">DANGER: HIGH</div>
          </div>
        </aside>
      </div>
    </section>
  );
}
