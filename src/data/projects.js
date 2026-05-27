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
      "LightGBM",
      "Optuna",
      "scikit-learn",
      "FastAPI",
      "FastF1",
      "Postgres",
      "SQLite",
      "React 19",
      "Vite 8",
      "GSAP",
    ],
    image: BASE + "assets/f1-predictor.png",
    repos: [
      { label: "GitHub", href: "https://github.com/AakashVijeta/f1-podium-predictor" },
      { label: "API Docs", href: "https://api.aakashvijeta.me/docs" },
    ],
    liveDemo: "https://f1.aakashvijeta.me",
    overview: [
      "Every Grand Prix weekend, the app answers a single question: given the qualifying grid, which three drivers will finish on the podium? A LightGBM classifier — tuned with Optuna and calibrated so its probabilities are interpretable rather than just rankable — produces a PodiumProbability for every driver, fused with a dedicated winner model into a CombinedScore, and a React dashboard puts it side-by-side with the official result the moment the chequered flag drops.",
      "What makes this non-trivial is timing. FastF1 serves partial data for up to 1.5 hours after qualifying, races get red-flagged, and the service occasionally goes to sleep mid-season. A race-lifecycle state machine on the backend absorbs all of that: it polls for complete qualifying data (with a ≥18-driver completeness guard), caches predictions as immutable, updates results in place, and retroactively fills any race that happened while the service was offline.",
      "A rolling season dashboard tracks winner hit-rate and podium hit-rate round-by-round across the entire 2026 calendar, so the model's claims are visible and falsifiable — not a black box.",
    ],
    features: [
      "Calibrated probabilities. LightGBM tuned by Optuna and wrapped in CalibratedClassifierCV so a shown 0.72 actually behaves like a 72% setup over the season — not just a higher-than-0.65 ranking.",
      "Era-agnostic features. Fifteen inputs chosen to survive F1 regulation resets, including the 2026 reboot: grid position, normalised quali gap, rolling 3/5-race form, finish variance, DNF rate, beat-teammate rate, constructor podium/finish/development trends, track-type flags, and a rain flag.",
      "Race-state machine. Every request resolves to pre_quali, pre_race, or post_race with built-in buffers (1.5 h post-quali, 3 h post-race) so the API never returns half-baked data.",
      "Dual model fusion. A podium-probability model and a dedicated winner model are merged into a single CombinedScore — better top-of-podium calls without losing P2/P3 coverage.",
      "Dual-backend persistence. Identical DB interface over Postgres (psycopg2 pool with TCP keepalives and a stale-connection probe in production) and a local SQLite cache for development.",
      "Self-healing ingestion. A polling loop waits for FastF1 to finish publishing quali data; predictions missed during downtime are generated retroactively from the official race result. A GitHub Actions keep-alive pings the API every 5 minutes through race weekends.",
      "Public accuracy scoreboard. Season dashboard aggregates stored predictions vs. official results so the model's skill is always visible.",
    ],
    architecture: `React 19 / Vite 8 UI  ──▶  FastAPI Backend  ──▶  Postgres / SQLite
                                      │
                                      ▼
                              LightGBM v8 + Winner Model
                              ──▶ CombinedScore
                                      │
                                      ▼
                              FastF1  ·  Jolpica / Ergast API
                                      │
                              GitHub Actions keep-alive`,
    endpoints: [
      ["GET /predict/{year}/{round}", "Core endpoint. Returns predictions and/or results depending on the race's current state."],
      ["GET /results/{year}/{round}", "Canonical race classification via Jolpica (Ergast-compatible)."],
      ["GET /accuracy/{year}", "Season aggregates: winner hit-rate, podium hit-rate, per-round history."],
      ["GET /health", "Platform healthcheck (supports HEAD)."],
    ],
    model: {
      algorithm: "LightGBM (LGBMClassifier) + Optuna HPO + CalibratedClassifierCV; podium model fused with dedicated winner model into CombinedScore",
      target: "Binary — did this driver finish in the top 3? (Plus a parallel winner-only model.)",
      training: "Seasons 2023–2026 ingested from FastF1, time-decay weighted (factor 0.38), retrainable per-round.",
      metrics: "Brier Score Loss · ROC-AUC · Average Precision (Brier is the key metric for probability quality)",
    },
  },
  {
    slug: "niftyedge",
    tag: "Quant Research",
    title: "NiftyEdge",
    subtitle:
      "A Bloomberg-terminal-styled pre-market trading desk for the Nifty 50 — walk-forward validated XGBoost signals, a Groq-powered AI analyst, and a dashboard that lands on your screen before the opening bell.",
    techStack: [
      "Python",
      "XGBoost",
      "pandas",
      "FastAPI",
      "React 19",
      "Vite 6",
      "Framer Motion 12",
      "Netlify Edge",
      "Groq · Llama 3.3 70B",
      "OpenRouter",
    ],
    image: BASE + "assets/niftyedge.png",
    repos: [
      { label: "Backend", href: "https://github.com/AakashVijeta/NiftyEdge-api" },
      { label: "Frontend", href: "https://github.com/AakashVijeta/NiftyEdge" },
    ],
    liveDemo: "https://niftyedge.netlify.app",
    overview: [
      "NiftyEdge scores every Nifty 50 constituent each morning on a single question: what is the probability it closes at least 1.5% higher within the next five trading days? An XGBoost classifier — validated with rolling six-month walk-forward folds and filtered at a 0.55 confidence threshold — emits the day's shortlist before markets open.",
      "The UI is a Bloomberg-terminal-inspired command center: ultra-flat cards, sharp borders, Inter + IBM Plex Mono on near-black with Bloomberg-orange highlights. A ranked signals table, a high-conviction Spotlight Pick with RSI / volatility / Bollinger breakdown, a sector momentum heatmap, and a Liquid-Metal AI Analyst chat panel — all powered by a stabilized motion engine for zero-flicker, GPU-accelerated state transitions.",
      "The analyst is grounded: Groq-hosted Llama 3.3 70B (with OpenRouter failover) is primed with the current signal set so its commentary references real probabilities, not generic market talk. A Netlify Edge Function proxies Yahoo Finance so the live Nifty 50 quote streams into the browser without CORS drama, and every model claim is backed by a full backtest harness — next-day open entries, take-profit and stop-loss rails, realistic friction and position sizing.",
    ],
    features: [
      "Walk-forward validation. Rolling six-month out-of-sample folds from 2023 onward — no look-ahead, no cherry-picked train/test split.",
      "Twelve engineered features. MA(20/50), RSI, MACD and its signal line, Bollinger position, volume ratio, 5-day return, relative strength vs. Nifty, and sector momentum.",
      "Bloomberg-terminal UI. React 19 + Vite 6 with vanilla CSS @property animations, Framer Motion 12 for GPU-accelerated states, and a custom Liquid-Metal border effect on the AI Analyst trigger.",
      "Grounded LLM analyst. Groq-hosted Llama 3.3 70B with OpenRouter failover is fed the day's signals plus a structured system prompt, so it reasons over real numbers rather than generic market talk.",
      "Honest backtest. Next-day open entries, +2.5% TP / −1.0% SL, 5-day horizon, 0.15% round-trip friction, 2% fixed position sizing — friction and slippage included by default.",
      "Sector coverage. Finance, IT, Energy, Pharma, Metals, Auto, FMCG, Consumer, Infra, Telecom, Aviation — clustered into a live heatmap that makes regime shifts visible at a glance.",
      "Edge-cached delivery. Signals cached for 15 minutes server-side; a Netlify Edge Function proxies Yahoo Finance for the current Nifty 50 quote — no CORS, no leaked keys.",
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
                       │                │
                       ▼                ▼
                  Netlify Edge      Groq → OpenRouter
                   (proxies)`,
    endpoints: [
      ["GET /signals", "Today's trade signals with model probability ≥ 0.55. Cached 15 min server-side."],
      ["POST /chat", "Conversational analyst grounded in the current signal set."],
      ["GET /health", "Liveness probe."],
    ],
    model: {
      algorithm: "XGBoost classifier (n_estimators=200, max_depth=4, lr=0.05, subsample=0.8). Grounded LLM layer: Groq · Llama 3.3 70B with OpenRouter failover.",
      target: "1 if max close in next 5 days ≥ 1.5% above today's close, else 0. Class imbalance handled via scale_pos_weight.",
      training: "Walk-forward six-month folds from 2023-01-01 onward; 0.55 emission threshold.",
      metrics: "Backtested P&L with TP/SL, precision at threshold, hit-rate on the 5-day horizon.",
    },
  },
];
