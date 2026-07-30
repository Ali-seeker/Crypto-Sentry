type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'FATAL'

interface LogEntry {
  timestamp: string
  level: LogLevel
  component: string
  message: string
  context?: Record<string, any>
}

class Logger {
  private log(level: LogLevel, component: string, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
    }

    if (context && Object.keys(context).length > 0) {
      // Create a shallow copy and sanitize
      const safeContext = { ...context }
      if (safeContext.password) delete safeContext.password
      if (safeContext.password_hash) delete safeContext.password_hash
      entry.context = safeContext
    }

    const logString = JSON.stringify(entry)

    if (level === 'ERROR' || level === 'FATAL') {
      console.error(logString)
    } else if (level === 'WARN') {
      console.warn(logString)
    } else {
      console.log(logString)
    }
  }

  info(component: string, message: string, context?: Record<string, any>) {
    this.log('INFO', component, message, context)
  }

  warn(component: string, message: string, context?: Record<string, any>) {
    this.log('WARN', component, message, context)
  }

  error(component: string, message: string, context?: Record<string, any>) {
    this.log('ERROR', component, message, context)
  }

  fatal(component: string, message: string, context?: Record<string, any>) {
    this.log('FATAL', component, message, context)
  }
}

export const logger = new Logger()
