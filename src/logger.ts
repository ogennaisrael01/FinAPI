import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.json()
);

export const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    //Output everything to the console (formatted nicely for local dev)
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    // Save info logs (and higher severity) into daily rotating files
    new transports.DailyRotateFile({
      filename: './logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d', // Deletes files older than 14 days
      level: 'info'
    }),
    
    // Separate out error-only logs into a dedicated folder
    new transports.DailyRotateFile({
      filename: './logs/errors-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      level: 'error'
    })
  ]
});
