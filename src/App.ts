// Imports
import express, { Request, Response, NextFunction, Errback } from "express";
import { myGraphQlRoute } from "./routes/myGraphQLRoutes";

// Initialize Sequelize DB Connection and Models
import "./services/dbService/initDBAndModels";

import morgan from "morgan";
import { myRouter } from "./routes/myRoutes";
import bodyParser from "body-parser";

// I created GraphQL Routes also - check GraphQL_Notes.txt
import "./routes/myGraphQLRoutes";

export const app = express();

interface CustomError extends Error {
  status?: number;
}

app.use(
  morgan("dev", {
    skip: function (req: Request, res: Response) {
      return res.statusCode > 400;
    },
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  // Set response headers
  res.header("Access-Control-Allow-Origin", "*"); // Allow access to any (*) site
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  ); // We set which kind of headers we want to accept

  // Set available request methods
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    return res.status(200).json({});
  }
  next(); // Go to next middleware
});

app.use("/api", myRouter);
app.use("/graphql", myGraphQlRoute());

app.use((req: Request, res: Response, next: NextFunction) => {
  const error: CustomError = new Error("No route was found for this request!");
  error.status = 404;
  next(error);
});

app.use(
  (error: CustomError, req: Request, res: Response, next: NextFunction) => {
    res.status(error.status || 500);
    res.json({
      error: {
        message: error.message,
      },
    });
  }
);
