import http from "http";
import { app } from "./App";
import logger from "../config/winston-config";
import config from "config";

const port = config.get("Backend.PORT");
const server = http.createServer(app);
server.listen(port, () => {
  logger.info(`Backend is Listening on Port: ${port}`);
});
