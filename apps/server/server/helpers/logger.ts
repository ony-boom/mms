import { formatDate } from "date-fns";
import * as deemix from "@repo/deemix";
import { join as joinPath } from "path";
import { createLogger, format, transports } from "winston";

const logFolder: string = joinPath(deemix.utils.getConfigFolder(), "logs");

const logFilename = joinPath(
  logFolder,
  `${formatDate(new Date(), "yyyy-MM-dd-hh.mm.ss")}.log`,
);

const { combine, timestamp, errors, colorize, printf } = format;

const logFormat = printf((error) => {
  const { level, message } = error;

  return `[${level}] ${message}`;
});

export const logger = createLogger({
  format: combine(errors({ stack: true }), timestamp(), logFormat),
  transports: [
    new transports.File({
      handleExceptions: true,
      handleRejections: true,
      format: combine(errors({ stack: true }), timestamp(), logFormat),
      filename: logFilename,
    }),
    new transports.Console({
      handleExceptions: true,
      handleRejections: true,
      format: combine(
        errors({ stack: true }),
        colorize(),
        timestamp(),
        logFormat,
      ),
    }),
  ],
});
