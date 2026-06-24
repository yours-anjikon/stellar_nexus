import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import client from "prom-client";
import { env, isProduction } from "./env.js";
import { migrate } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { importersRouter } from "./routes/importers.js";
import { startIndexer } from "./indexer.js";

const app = express();

app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

const ALLOWED_ORIGINS = (() => {
  const set = new Set<string>(["http://localhost:3000", "http://127.0.0.1:3000"]);
  for (const o of env.FRONTEND_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean)) {
    set.add(o);
  }
  return set;
})();

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.has(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: false,
  }),
);

app.use(express.json({ limit: "1mb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too many auth attempts; try again in 15 minutes" },
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    contractId: env.TARIFF_SHIELD_CONTRACT_ID,
    network: env.STELLAR_NETWORK,
    env: isProduction ? "production" : "development",
  });
});

client.collectDefaultMetrics();

app.get("/metrics", async (_req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err: any) {
    res.status(500).end(err?.message || "Internal Metrics Error");
  }
});

app.use("/auth/signup", authLimiter);
app.use("/auth/login", authLimiter);
app.use("/auth", authRouter);
app.use("/importers", importersRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[error]", err);
  res.status(500).json({ error: err.message || "internal error" });
});

async function start() {
  await migrate();
  await startIndexer();
  app.listen(env.PORT, () => {
    console.log(`[boot] tariffshield API on :${env.PORT}`);
    console.log(`[boot] contract: ${env.TARIFF_SHIELD_CONTRACT_ID}`);
    console.log(`[boot] cors allowlist: ${Array.from(ALLOWED_ORIGINS).join(", ")}`);
  });
}

start().catch((err) => {
  console.error("[boot] fatal", err);
  process.exit(1);
});
