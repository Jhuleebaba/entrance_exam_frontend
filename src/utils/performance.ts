// Performance monitoring utility
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
      
      if (duration > 1000) {
        console.warn(`⚠️ Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
      } else {
        console.log(`✅ ${label} completed in ${duration.toFixed(2)}ms`);
      }
    };
  }

  private recordMetric(label: string, duration: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const metrics = this.metrics.get(label)!;
    metrics.push(duration);
    
    // Keep only last 10 measurements
    if (metrics.length > 10) {
      metrics.shift();
    }
  }

  getAverageTime(label: string): number {
    const metrics = this.metrics.get(label);
    if (!metrics || metrics.length === 0) return 0;
    
    return metrics.reduce((sum, time) => sum + time, 0) / metrics.length;
  }

  getMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};
    
    Array.from(this.metrics.entries()).forEach(([label, times]) => {
      result[label] = {
        average: this.getAverageTime(label),
        count: times.length
      };
    });
    
    return result;
  }

  logReport(): void {
    console.group('📊 Performance Report');
    const metrics = this.getMetrics();
    
    Object.entries(metrics).forEach(([label, data]) => {
      console.log(`${label}: ${data.average.toFixed(2)}ms avg (${data.count} samples)`);
    });
    
    console.groupEnd();
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance(); 