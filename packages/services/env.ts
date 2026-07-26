import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().describe("database url"),
  JWT_SECRET: z.string().describe("jwt secret"),
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional().describe("google oauth client id"),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional().describe("google oauth client secret"),
  GOOGLE_OAUTH_REDIRECT_URI: z.string().optional().describe("google oauth redirect uri")
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);

