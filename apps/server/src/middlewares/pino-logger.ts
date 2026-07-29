import { pinoLogger as logger } from "hono-pino"
import pino from "pino"
import pretty from "pino-pretty"

export function pinoLogger() {
  return logger({
    pino: pino(
      {
        level: "info",
        redact: {
          paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "password",
            "confirmPassword",
            "*.password",
            "*.confirmPassword",
          ],
          remove: true,
        },
      },
      pretty(),
    ),
  })
}
