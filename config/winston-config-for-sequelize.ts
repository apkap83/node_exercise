import * as winston from "winston";
import config from "config";

const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Determine log file paths based on NODE_ENV
const env = process.env.NODE_ENV || "development";
const logDir = env === "test" ? "logs/test" : "logs";

const logger = winston.createLogger({
  level: config.get("Logging.WinstonLoggingLevel"),
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    customFormat
  ),
  transports: [
    new winston.transports.File({
      filename: `${logDir}/error.log`,
      level: "error",
    }),
    new winston.transports.File({ filename: `${logDir}/sequelize.log` }),
  ],
});

if (
  process.env.NODE_ENV !== "production" &&
  !config.get("Logging.SequelizeSuppressLoggingToConsole")
) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        customFormat // Use custom format for console as well
      ),
    })
  );
}

export default logger;
