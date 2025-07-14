import { app } from "@/app";
import { env } from "@/common/env";

console.log(`Mock Node server attempting to listen`);

const server = Bun.serve({
  hostname: "::",
  port: env.PORT,
  fetch: app.fetch,
});

console.log(`Mock node listening on ${server.url}`);
