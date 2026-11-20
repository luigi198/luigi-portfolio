/**
 * Minimal Upstash Redis client over its REST API (POST {url}/pipeline). Plain
 * fetch instead of an SDK: the twin needs four commands, and this wire format
 * is documented and stable.
 */

export type RedisCommand = (string | number)[];

export interface Redis {
  /** Runs commands in order (not atomically) and returns each result. Throws on any error. */
  pipeline(commands: RedisCommand[]): Promise<unknown[]>;
}

export class RedisError extends Error {
  override name = "RedisError";
}

/** Short, so a slow store fails the request closed instead of hanging it (A8). */
const REDIS_TIMEOUT_MS = 2000;

type PipelineItem = { result: unknown } | { error: string };

function isItems(value: unknown): value is PipelineItem[] {
  return Array.isArray(value) && value.every((item) => typeof item === "object" && item !== null && ("result" in item || "error" in item));
}

export function createRedis(options: { url: string; token: string; fetch?: typeof globalThis.fetch }): Redis {
  const send = options.fetch ?? globalThis.fetch;
  const endpoint = `${options.url.replace(/\/+$/, "")}/pipeline`;
  return {
    async pipeline(commands) {
      const response = await send(endpoint, {
        method: "POST",
        headers: { authorization: `Bearer ${options.token}`, "content-type": "application/json" },
        body: JSON.stringify(commands),
        signal: AbortSignal.timeout(REDIS_TIMEOUT_MS),
      });
      if (!response.ok) throw new RedisError(`Upstash responded ${response.status}`);
      const items: unknown = await response.json();
      if (!isItems(items) || items.length !== commands.length) throw new RedisError("Unexpected Upstash pipeline response");
      return items.map((item) => {
        if ("error" in item) throw new RedisError(`Upstash command failed: ${item.error}`);
        return item.result;
      });
    },
  };
}
