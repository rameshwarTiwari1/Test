import "reflect-metadata";
import { InversifyExpressServer } from "inversify-express-utils";
import container from "../inversify.config.ts";

const server = new InversifyExpressServer(container);
server.build().listen(8000, () => console.log("Server started on port 8000"));