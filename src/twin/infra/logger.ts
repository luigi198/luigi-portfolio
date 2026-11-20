import type { Clock, LogFields, Logger } from "@/twin/ports";

/** One JSON line per event, for Vercel's log search. Callers pass metadata only (P1). */
export function createJsonLogger(clock: Clock): Logger {
  const write = (level: "info" | "warn" | "error", event: string, fields: LogFields) => {
    const line = JSON.stringify({ level, event, time: new Date(clock.now()).toISOString(), ...fields });
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  };
  return {
    info: (event, fields) => write("info", event, fields),
    warn: (event, fields) => write("warn", event, fields),
    error: (event, fields) => write("error", event, fields),
  };
}
