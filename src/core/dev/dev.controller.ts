import { createRouter } from "@/common/hono/create-app";
import * as DevService from "./dev.service";
import * as devSchemas from "./dev.schemas";
import { zValidator } from "@hono/zod-validator";
import { coinParamSchema } from "@/core/node/node.schemas";

export const devController = createRouter()
  .post("/mine/all", async (c) => {
    const response = await DevService.mineAll();
    return c.json(response, 200);
  })
  .post("/mine/:coin", zValidator("param", coinParamSchema), async (c) => {
    const { coin } = c.req.valid("param");
    const response = await DevService.mine(coin);

    return c.json(response, 200);
  })
  .post(
    "/:coin/simulate-deposit",
    zValidator("param", coinParamSchema),
    zValidator("json", devSchemas.simulateDepositSchema),
    async (c) => {
      const json = c.req.valid("json");
      const { coin } = c.req.valid("param");
      const response = await DevService.simulateDeposit(coin, json);

      return c.json(response, 200);
    }
  );
