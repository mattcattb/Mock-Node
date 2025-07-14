import pino from "pino";
import { pinoLogger, PinoLogger } from "hono-pino";
import { PinoPretty } from "pino-pretty";
import { env } from "../env";

const pinoInstance = pino(
  {
    level: env.LOG_LEVEL,
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
    },
  },
  env.NODE_ENV !== "production" ? PinoPretty({ colorize: true }) : undefined
);

export function getPinoLogger() {
  return pinoLogger({
    pino: pinoInstance,
  });
}

export const logger = pinoInstance;

export function createChildLogger(child: string) {
  return logger.child({ child });
}
