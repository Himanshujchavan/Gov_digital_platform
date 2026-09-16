/**
 * Structured Logger for Microservices
 */
class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  log(message, meta = {}) {
    this._print('INFO', message, meta);
  }

  warn(message, meta = {}) {
    this._print('WARN', message, meta);
  }

  error(message, trace = '', meta = {}) {
    this._print('ERROR', message, { trace, ...meta });
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV !== 'production') {
      this._print('DEBUG', message, meta);
    }
  }

  _print(level, message, meta) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...(Object.keys(meta).length > 0 ? { meta } : {}),
    };
    const output = `[${logEntry.timestamp}] [${level}] [${this.context}] ${message} ${
      Object.keys(meta).length > 0 ? JSON.stringify(meta) : ''
    }`;
    if (level === 'ERROR') {
      console.error(output);
    } else if (level === 'WARN') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }
}

module.exports = { Logger };
