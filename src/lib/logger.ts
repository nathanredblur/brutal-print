/**
 * Debug Logger System
 * 
 * Enable logs by:
 * 1. Set cookie: document.cookie = "debug_thermal=true"
 * 2. Call in console: window.enableThermalDebug()
 * 3. Always enabled in development (import.meta.env.DEV)
 */

type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';

class ThermalLogger {
  private enabled: boolean = false;
  private styles = {
    info: 'background: #3B82F6; color: white; padding: 2px 6px; border-radius: 3px;',
    warn: 'background: #F59E0B; color: white; padding: 2px 6px; border-radius: 3px;',
    error: 'background: #EF4444; color: white; padding: 2px 6px; border-radius: 3px;',
    success: 'background: #10B981; color: white; padding: 2px 6px; border-radius: 3px;',
    debug: 'background: #A78BFA; color: white; padding: 2px 6px; border-radius: 3px;',
  };

  constructor() {
    this.checkEnabled();
    this.exposeGlobal();
  }

  private checkEnabled(): void {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      this.enabled = false;
      return;
    }

    // Check if in development mode
    if (import.meta.env.DEV) {
      this.enabled = true;
      this.log('info', 'Logger', 'Debug mode enabled (development environment)');
      return;
    }

    // Check cookie
    const cookies = document.cookie.split(';');
    const debugCookie = cookies.find(c => c.trim().startsWith('debug_thermal='));
    if (debugCookie?.includes('true')) {
      this.enabled = true;
      this.log('info', 'Logger', 'Debug mode enabled (cookie)');
      return;
    }

    // Check localStorage
    if (localStorage.getItem('debug_thermal') === 'true') {
      this.enabled = true;
      this.log('info', 'Logger', 'Debug mode enabled (localStorage)');
      return;
    }
  }

  private exposeGlobal(): void {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Expose enable/disable functions globally
    (window as any).enableThermalDebug = () => {
      this.enabled = true;
      localStorage.setItem('debug_thermal', 'true');
      document.cookie = 'debug_thermal=true; max-age=31536000'; // 1 year
      console.log('%c🔧 Thermal Debug ENABLED', this.styles.success);
      console.log('Logs will now appear in console');
    };

    (window as any).disableThermalDebug = () => {
      this.enabled = false;
      localStorage.removeItem('debug_thermal');
      document.cookie = 'debug_thermal=false; max-age=0';
      console.log('%c🔇 Thermal Debug DISABLED', this.styles.warn);
    };

    if (this.enabled) {
      console.log('%c🔧 Thermal Print Studio - Debug Mode Active', this.styles.info);
      console.log('%cTo disable, run: window.disableThermalDebug()', 'color: #94A3B8;');
    } else {
      console.log('%c🖨️ Thermal Print Studio', this.styles.info);
      console.log('%cTo enable debug logs, run: window.enableThermalDebug()', 'color: #94A3B8;');
    }
  }

  private log(level: LogLevel, component: string, message: string, data?: any): void {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const style = this.styles[level];
    
    console.groupCollapsed(
      `%c${level.toUpperCase()}%c [${timestamp}] %c${component}%c ${message}`,
      style,
      'color: #64748B;',
      'color: #A78BFA; font-weight: bold;',
      'color: inherit;'
    );

    if (data !== undefined) {
      console.log('Data:', data);
    }

    // Add stack trace for errors
    if (level === 'error') {
      console.trace();
    }

    console.groupEnd();
  }

  // Public logging methods
  info(component: string, message: string, data?: any): void {
    this.log('info', component, message, data);
  }

  warn(component: string, message: string, data?: any): void {
    this.log('warn', component, message, data);
  }

  error(component: string, message: string, data?: any): void {
    this.log('error', component, message, data);
    // Always log errors, even if debug is disabled
    if (!this.enabled) {
      console.error(`[${component}] ${message}`, data);
    }
  }

  success(component: string, message: string, data?: any): void {
    this.log('success', component, message, data);
  }

  debug(component: string, message: string, data?: any): void {
    this.log('debug', component, message, data);
  }

  // State logging helper
  logState(component: string, stateName: string, value: any): void {
    this.debug(component, `State: ${stateName}`, value);
  }

  // Event logging helper
  logEvent(component: string, eventName: string, data?: any): void {
    this.info(component, `Event: ${eventName}`, data);
  }

  // Print separator for readability
  separator(message: string = ''): void {
    if (!this.enabled) return;
    console.log(
      `%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ${message} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      'color: #475569;'
    );
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const logger = new ThermalLogger();
export default logger;

