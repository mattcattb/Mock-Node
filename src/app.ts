import createApp, { addErrorHandling } from "@/common/hono/create-app";
import { devController } from "@/core/dev/dev.controller";
import { nodeController } from "@/core/node/node.controller";

const app = createApp();

const routes = app
  .route("/node", nodeController)
  .route("/dev", devController)
  .get("/health", async (c) => {
    return c.json({ message: "healthy!" }, 200);
  });

addErrorHandling(app);

export { app };

export type NodeAppType = typeof routes;
