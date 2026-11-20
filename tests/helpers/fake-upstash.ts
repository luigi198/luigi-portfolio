/**
 * In-memory Redis behind Upstash's REST contract: POST {url}/pipeline with a
 * JSON array of commands, answered with [{ result } | { error }] in order.
 * Implements only the commands the twin sends.
 */
type Command = (string | number)[];

const isCommand = (value: unknown): value is Command =>
  Array.isArray(value) && value.every((part) => typeof part === "string" || typeof part === "number");

/** Upstash's pipeline body is a JSON array of commands; anything else is a client bug. */
function commandsFrom(body: unknown): Command[] {
  if (!Array.isArray(body) || !body.every(isCommand)) throw new Error("fake Upstash: body is not a command pipeline");
  return body;
}

export function fakeUpstash() {
  const data = new Map<string, string>();
  const ttl = new Map<string, number>();
  const calls: { url: string; auth: string | null; body: (string | number)[][] }[] = [];
  let down = false;

  const run = ([cmd, key, arg]: (string | number)[]): unknown => {
    const k = String(key);
    switch (String(cmd).toUpperCase()) {
      case "GET":
        return data.get(k) ?? null;
      case "INCR":
        data.set(k, String(Number(data.get(k) ?? 0) + 1));
        return Number(data.get(k));
      case "INCRBYFLOAT":
        data.set(k, String(Number(data.get(k) ?? 0) + Number(arg)));
        return data.get(k);
      case "EXPIRE":
        ttl.set(k, Number(arg));
        return 1;
      default:
        throw new Error(`fake Upstash: unsupported command ${cmd}`);
    }
  };

  const fetch = async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (down) return new Response(JSON.stringify({ error: "ERR service unavailable" }), { status: 503 });
    const body = commandsFrom(JSON.parse(String(init?.body)));
    calls.push({ url: String(url), auth: new Headers(init?.headers).get("authorization"), body });
    return new Response(JSON.stringify(body.map((c) => ({ result: run(c) }))), { status: 200 });
  };

  return { fetch, data, ttl, calls, setDown: (value: boolean) => void (down = value) };
}
