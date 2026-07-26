import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}


export const createTRPCHttpBatchClientClient = () => {
  return httpLink({
    url: env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/trpc",
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include", // 👈 Automatically sends HTTP-Only authentication cookies!
      });
    },
  });
};

