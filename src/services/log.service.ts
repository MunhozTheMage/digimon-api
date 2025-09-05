import Logger from "js-logger";

const setup = () => {
  Logger.useDefaults();
};

const info = (message: string) => {
  Logger.info(message);
};

const error = (message: string) => {
  Logger.error(message);
};

const warn = (message: string) => {
  Logger.warn(message);
};

const withTiming = async <T>(
  fn: () => Promise<T>,
  description: string
): Promise<T> => {
  const start = performance.now();
  try {
    info(`[START] ${description}`);
    const result = await fn();
    const duration = performance.now() - start;
    info(`[END] ${description} (${duration.toFixed(2)}ms)`);
    return result;
  } catch (err) {
    const duration = performance.now() - start;
    error(`[ERROR] ${description} (${duration.toFixed(2)}ms)`);
    throw err;
  }
};

const logService = {
  info,
  error,
  warn,
  withTiming,
  setup,
};

export default logService;
