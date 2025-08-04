import logService from "./services/log.service";
import serverService from "./services/server.service";

logService.setup();
const app = serverService.setup();

logService.info(`Server running at http://localhost:${app.server?.port}`);
