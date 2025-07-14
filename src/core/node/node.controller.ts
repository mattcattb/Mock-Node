import { createRouter } from "@/common/hono/create-app";

import * as NodeService from "./node.service";
import * as NodeSchemas from "./node.schemas";
import { zValidator } from "@hono/zod-validator";
import { coinParamSchema } from "@/core/node/node.schemas";
export const nodeController = createRouter()
  .get("/:coin/balance", zValidator("param", coinParamSchema), async (c) => {
    const { coin } = c.req.valid("param");
    const response = await NodeService.getBalance(coin);
    return c.json(response, 200);
  })
  .post("/:coin/address", zValidator("param", coinParamSchema), async (c) => {
    const { coin } = c.req.valid("param");

    const response = await NodeService.generateAddress(coin);
    return c.json(response, 200);
  })
  .post(
    "/:coin/withdrawal",
    zValidator("param", coinParamSchema),
    zValidator("json", NodeSchemas.createWithdrawalJsonSchema),
    async (c) => {
      const { coin } = c.req.valid("param");

      const json = c.req.valid("json");
      const response = await NodeService.createWithdrawal(coin, json);
      return c.json(response, 200);
    }
  )
  .post(
    "/:coin/scan",
    zValidator("param", coinParamSchema),
    zValidator("json", NodeSchemas.scanJsonSchema),
    async (c) => {
      const { coin } = c.req.valid("param");

      const json = c.req.valid("json");
      const response = await NodeService.scan(coin, json);
      return c.json(response, 200);
    }
  );
