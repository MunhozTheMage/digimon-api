import type { InferHandler } from "elysia";
import logService from "../services/log.service";
import type serverService from "../services/server.service";

type NotFoundHandler = InferHandler<typeof serverService.server, "*">;

export const notFoundResolver: NotFoundHandler = ({ request }) => {
  const url = new URL(request.url);
  logService.warn(`404 - Route not found: ${url.pathname}`);

  return {
    error: "Not Found",
    status: 404,
  };
};
