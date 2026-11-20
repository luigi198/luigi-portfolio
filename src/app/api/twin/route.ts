import { randomUUID } from "node:crypto";
import { loadTwinConfig } from "@/twin/infra/config";
import { createTwinDeps } from "@/twin/infra/deps";
import { createJsonLogger } from "@/twin/infra/logger";
import { parseTwinBody } from "@/twin/http/request";
import { errorResponse, outcomeResponse } from "@/twin/http/response";
import { visitorIdFrom } from "@/twin/http/visitor";
import { createTwinService } from "@/twin/service";

/** Streams can outlast the default; the model call itself times out sooner. */
export const maxDuration = 60;

const bootLogger = createJsonLogger({ now: () => Date.now() });

interface Runtime {
  service: ReturnType<typeof createTwinService>;
  salt: string;
}
let runtime: Runtime | undefined;

/** Built on the first request, never at import, so builds and tests need no secrets (research P4). */
function getRuntime(): Runtime {
  if (!runtime) {
    const config = loadTwinConfig();
    runtime = { service: createTwinService(createTwinDeps(config)), salt: config.visitorHashSalt };
  }
  return runtime;
}

export async function POST(request: Request): Promise<Response> {
  const requestId = randomUUID();
  let current: Runtime;
  try {
    current = getRuntime();
  } catch (err) {
    bootLogger.error("twin.config_failed", { requestId, errorClass: err instanceof Error ? err.name : typeof err });
    return errorResponse("unavailable", requestId);
  }

  const parsed = parseTwinBody(await request.text());
  if (!parsed.ok) {
    bootLogger.warn("twin.bad_body", { requestId });
    return errorResponse("invalid", requestId);
  }

  const outcome = await current.service.handle({
    requestId,
    visitorId: visitorIdFrom(request.headers, current.salt),
    ...parsed.value,
  });
  return outcomeResponse(outcome, requestId);
}
