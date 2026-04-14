const BASE = import.meta.env.BASE_URL;

export const projectDetails = [
  {
    slug: "f1-podium-predictor",
    tag: "Machine Learning",
    title: "F1 Podium Predictor",
    subtitle:
      "A calibrated machine-learning service that calls every Formula 1 podium before the lights go out — with a public accuracy scoreboard to keep it honest.",
    techStack: [
      "Python",
      "scikit-learn",
      "FastAPI",
      "FastF1",
      "Postgres",
      "SQLite",
      "React 19",
      "Vite",
    ],
    image: BASE + "assets/f1-predictor.png",
    repos: [
      { label: "GitHub", href: "https://github.com/AakashVijeta/f1-podium-predictor" },
    ],
    liveDemo: "https://f1.aakashvijeta.me",
    overview: [
      "Every Grand Prix weekend, the app answers a single question: given the qualifying grid, which three drivers will finish on the podium? A gradient-boosting classifier — calibrated so its probabilities are interpretable rather than just rankable — produces a PodiumProbability for every driver, and a React dashboard puts it side-by-side with the official result the moment the chequered flag drops.",
      "What makes this non-trivial is timing. FastF1 serves partial data for up to an hour after qualifying, races get red-flagged, and the service occasionally goes to sleep mid-season. A race-lifecycle state machine on the backend absorbs all of that: it polls for complete qualifying data, caches predictions as immutable, updates results in place, and retroactively fills any race that happened while the service was offline.",
      "A rolling season dashboard tracks winner hit-rate and podium hit-rate round-by-round, so the model's claims are visible and falsifiable — not a black box.",
    ],
    features: [
      "Calibrated probabilities. GradientBoostingClassifier wrapped in CalibratedClassifierCV so a shown 0.72 actually behaves like a 72% setup over the season — not just a higher-than-0.65 ranking.",
      "Era-agnostic features. Nine inputs chosen to survive F1 regulation resets, including the 2026 reboot: grid position and its non-linear penalty, quali gap to pole (raw and normalised), a midfield-traffic flag, rolling 3-race and 5-race form, and a one-hot track-type encoding.",
      "Race-state machine. Every request resolves to pre_quali, pre_race, or post_race with built-in buffers for session overruns and ingestion lag, so the API never returns half-baked data.",
      "Dual-backend persistence. Identical DB interface over Postgres (psycopg2 pool with TCP keepalives and a stale-connection probe in production) and a local SQLite cache for development.",
      "Self-healing ingestion. A 60-minute polling loop waits for FastF1 to finish publishing quali data; predictions missed during downtime are generated retroactively from the official race result.",
      "Public accuracy scoreboard. Season dashboard aggregates stored predictions vs. official results so the model's skill is always visible.",
    ],
    architecture: `React (Vite) UI  ──▶  FastAPI Backend  ──▶  Postgres / SQLite
                                  │
                                  ▼
                          FastF1 (sessions)
                          Jolpica / Ergast API`,
    endpoints: [
      ["GET /predict/{year}/{round}", "Core endpoint. Returns predictions and/or results depending on the race's current state."],
      ["GET /results/{year}/{round}", "Canonical race classification via Jolpica (Ergast-compatible)."],
      ["GET /accuracy/{year}", "Season aggregates: winner hit-rate, podium hit-rate, per-round history."],
      ["GET /health", "Platform healthcheck (supports HEAD)."],
    ],
    model: {
      algorithm: "GradientBoostingClassifier + CalibratedClassifierCV",
      target: "Binary — did this driver finish in the top 3?",
      training: "Seasons 2023–2025 ingested from FastF1 into data/f1_dataset_clean.csv, retrainable per-round.",
      metrics: "classification_report · ROC-AUC · Brier score (the key metric for probability quality)",
    },
  },
  {
    slug: "niftyedge",
    tag: "Quant Research",
    title: "NiftyEdge",
    subtitle:
      "A pre-market trading desk for the Nifty 50 — walk-forward validated XGBoost signals, a grounded LLM analyst, and a dashboard that lands on your screen before the opening bell.",
    techStack: [
      "Python",
      "XGBoost",
      "pandas",
      "FastAPI",
      "React 19",
      "Vite",
      "Netlify Edge Functions",
      "Groq · Llama 3.3 70B",
    ],
    image: BASE + "assets/niftyedge.png",
    repos: [
      { label: "Backend", href: "https://github.com/AakashVijeta/NiftyEdge-backend" },
      { label: "Frontend", href: "https://github.com/AakashVijeta/NiftyEdge-frontend" },
    ],
    liveDemo: "https://niftyedge.netlify.app",
    overview: [
      "NiftyEdge scores every Nifty 50 constituent each morning on a single question: what is the probability it closes at least 1.5% higher within the next five trading days? An XGBoost classifier — validated with rolling six-month walk-forward folds and filtered at a 0.55 confidence threshold — emits the day's shortlist before markets open.",
      "The dashboard is built around what a discretionary trader actually needs in the first ten minutes of the session: a ranked signals table, a top pick with reasoning, a sector heatmap, aggregate metrics, and an LLM analyst chat that is primed with the current signal set so its answers are grounded in real probabilities, not vibes. A Netlify Edge Function proxies Yahoo Finance so the live Nifty 50 quote streams into the browser without CORS drama.",
      "Every claim the model makes is backed by a full backtest harness — next-day open entries, take-profit and stop-loss rails, realistic friction and position sizing — so the probabilities on screen have been pressure-tested against three years of tape.",
    ],
    features: [
      "Walk-forward validation. Rolling six-month out-of-sample folds from 2023 onward — no look-ahead, no cherry-picked train/test split.",
      "Twelve engineered features. MA(20/50), RSI, MACD and its signal line, Bollinger position, volume ratio, 5-day return, relative strength vs. Nifty, and sector momentum.",
      "Grounded LLM analyst. Groq-hosted Llama 3.3 70B (with OpenRouter failover) is given the day's signals plus a structured system prompt, so it reasons over real numbers rather than generic market talk.",
      "Honest backtest. Next-day open entries, +2.5% TP / −1.0% SL, 5-day horizon, 0.15% round-trip friction, 2% fixed position sizing — friction and slippage included by default.",
      "Sector coverage. Finance, IT, Energy, Pharma, Metals, Auto, FMCG, Consumer, Infra, Telecom, Aviation — clustered into a live heatmap that makes regime shifts visible at a glance.",
      "Live index ticker. Netlify Edge Function proxies Yahoo Finance for the current Nifty 50 quote — no server, no CORS, no leaked keys.",
    ],
    architecture: `yfinance ──▶ ingest.py ──▶ data/raw/
                              │
                              ▼
                        features.py ──▶ data/processed/
                              │
                              ▼
                          train.py ──▶ models/model_v1.pkl
                              │
                              ▼
                        main.py (FastAPI)
                         /           \\
                   GET /signals     POST /chat
                                     │
                                     ▼
                              Groq → OpenRouter`,
    endpoints: [
      ["GET /signals", "Today's trade signals with model probability ≥ 0.55."],
      ["POST /chat", "Conversational analyst grounded in the current signal set."],
      ["GET /health", "Liveness probe."],
    ],
    model: {
      algorithm: "XGBoost classifier (n_estimators=200, max_depth=4, lr=0.05, subsample=0.8)",
      target: "1 if max close in next 5 days ≥ 1.5% above today's close, else 0. Class imbalance handled via scale_pos_weight.",
      training: "Walk-forward six-month folds from 2023-01-01 onward; 0.55 emission threshold.",
      metrics: "Backtested P&L with TP/SL, precision at threshold, hit-rate on the 5-day horizon.",
    },
  },
];

export const getProjectBySlug = (slug) =>
  projectDetails.find((p) => p.slug === slug);
