import "dotenv/config";
import { z } from "zod";

const Env = z.object({
  PORT: z.coerce.number().int().positive().default(3002),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url(),
  FRONTEND_ORIGIN: z.string().default("http://localhost:3000"),
  JWT_SECRET: z.string().min(32),

  STELLAR_NETWORK: z.enum(["testnet", "public"]).default("testnet"),
  STELLAR_RPC_URL: z.string().url(),
  STELLAR_HORIZON_URL: z.string().url(),
  STELLAR_NETWORK_PASSPHRASE: z.string().min(10),

  TARIFF_SHIELD_CONTRACT_ID: z.string().startsWith("C").min(56),
  PLATFORM_STELLAR_SECRET: z.string().startsWith("S").min(56),
  SURETY_STELLAR_SECRET: z.string().startsWith("S").min(56),
  METRICS_ALLOWED_CIDR: z.string().optional(),
});

export const env = Env.parse(process.env);
export const isProduction = env.NODE_ENV === "production";
