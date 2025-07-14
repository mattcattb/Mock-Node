import { HTTPException } from "hono/http-exception";

export class BadRequestError extends HTTPException {
  constructor(message: string = "Bad Request", options?: { cause?: unknown }) {
    super(400, { message, ...options });
  }
}

export class NotFoundError extends HTTPException {
  constructor(
    message: string = "Resource Not Found",
    options?: { cause?: unknown }
  ) {
    super(404, { message, ...options });
  }
}

export class InsufficientFundsError extends HTTPException {
  constructor(
    message: string = "Insufficient funds for this operation.",
    options?: { cause?: unknown }
  ) {
    super(400, { message, ...options });
  }
}

export class MiningError extends HTTPException {
  constructor(
    message: string = "Failed to mine a new block.",
    options?: { cause?: unknown }
  ) {
    super(500, { message, ...options });
  }
}

export class ServiceError extends HTTPException {
  constructor(
    message: string = "An internal service error occurred.",
    options?: { cause?: unknown }
  ) {
    super(500, { message, ...options });
  }
}
