import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { notFoundResolver } from "../resolvers/404.resolver";
import { digimonsResolver } from "../resolvers/digimons.resolver";
import { wikimonResolver } from "../resolvers/wikimon.resolver";

const server = new Elysia().use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

const setup = () => {
  return serverService.server
    .get("/digimons", digimonsResolver)
    .all("/wikimon/*", wikimonResolver)
    .all("*", notFoundResolver)
    .listen(3000);
};

const serverService = {
  server,
  setup,
};

export default serverService;
