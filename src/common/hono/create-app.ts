import { Hono } from "hono";
import { createChildLogger, getPinoLogger } from "./logger";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod/v4";
import { DrizzleError } from "drizzle-orm";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export function createRouter() {
  return new Hono({
    strict: true,
  });
}

const logger = createChildLogger("app");

export default function createApp() {
  const app = createRouter();

  app.use(getPinoLogger());

  return app;
}

export function addErrorHandling(app: Hono) {
  app.notFound((c) => {
    logger.warn(`Not Found: ${c.req.method} ${c.req.url}`);
    return c.json({ message: "Resource not found" }, 404);
  });

  app.onError((err: Error | HTTPException, c) => {
    let status: number = 500;
    let responseBody: { message: string; [key: string]: any } = {
      message: "Internal Server Error",
    };

    let errorToLog: Error | unknown = err;
    logger.error({ err }, "error occured in app!");

    if (err instanceof HTTPException) {
      status = err.status;
      responseBody.message = err.message;
      if (err.cause) {
        responseBody.cause = err.cause;
      }
    } else if (err instanceof ZodError) {
      const issues: { [key: string]: string[] } = {};

      err.issues.forEach((error) => {
        const path = error.path.join(".");
        if (!issues[path]) {
          issues[path] = [];
        }
        issues[path].push(error.message);
      });

      return c.json(
        {
          message: "Validation Failed",
          issues: { nested: issues },
        },
        422
      );
    } else if (err instanceof DrizzleError) {
      status = 500;
      responseBody.message = err.message ?? "Drizzle Error occured";
      errorToLog = err;
    } else if (err instanceof Error) {
      status = 500;
      responseBody.message = "An unexpected server error occurred.";

      errorToLog = err;
    } else {
      status = 500;
      responseBody.message = "An unknown error occurred.";
    }

    const logMessage = `[${status}] ${c.req.method} ${c.req.path}: ${responseBody.message}`;

    if (status >= 500) {
      logger.error({ err: errorToLog }, logMessage);
    } else {
      logger.warn({ err: errorToLog }, logMessage);
    }

    return c.json(responseBody, status as ContentfulStatusCode);
  });
  return app;
}
