import http from "http";
import { app } from "./App";

const port = 4000;
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
