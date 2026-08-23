import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}


export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const baseUrl = env.NEXT_PUBLIC_API_URL || "http://localhost:8000/trpc";
  const url = baseUrl.endsWith("/trpc") ? baseUrl : `${baseUrl}/trpc`;
  const linkFn = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  return linkFn({
    url,
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include", // 👈 Automatically sends HTTP-Only authentication cookies!
      });
    },
  });
};



