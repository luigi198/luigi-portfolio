import { initBotId } from "botid/client/core";
import { TWIN_API_PATH } from "@/twin/route-path";

// Vercel BotID runs its browser challenge for these routes; the server checks it
// with checkBotId(). A protected route missing here makes checkBotId() fail.
initBotId({ protect: [{ path: TWIN_API_PATH, method: "POST" }] });
