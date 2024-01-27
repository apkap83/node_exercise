// Imports
import express, { Request, Response, NextFunction, Errback } from "express";

// Initialize Postgres Connection and Models
import "./services/dbService/initDBAndModels";

import morgan from "morgan";
import { myRouter } from "./routes/myRoutes";
import bodyParser from "body-parser";

export const app = express();

app.use(
  morgan("dev", {
    skip: function (req, res) {
      return res.statusCode > 400;
    },
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
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

app.use("/", myRouter);

interface CustomError extends Error {
  status?: number;
}

app.use((req: Request, res: Response, next) => {
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
