/**
 * Performance optimization utilities for the tuition management system
 */

// Debounce function for search inputs
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll events
export function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization for expensive calculations
export function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Lazy loading utility
export function lazyLoad(importFunc) {
  return React.lazy(importFunc);
}

// Image optimization
export function optimizeImage(src, width, height, quality = 75) {
  // In a real implementation, you might use a service like Cloudinary or ImageKit
  return `${src}?w=${width}&h=${height}&q=${quality}&f=auto`;
}

// Data pagination helper
export function paginateData(data, page, limit) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: data.slice(startIndex, endIndex),
    pagination: {
      total: data.length,
      page,
      limit,
      totalPages: Math.ceil(data.length / limit),
      hasNext: endIndex < data.length,
      hasPrev: page > 1
    }
  };
}

// Cache management
class CacheManager {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  set(key, value, ttl = 300000) { // 5 minutes default TTL
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

export const cacheManager = new CacheManager();

// API request optimization
export class APIOptimizer {
  constructor() {
    this.pendingRequests = new Map();
  }

  async request(url, options = {}) {
    const key = `${url}-${JSON.stringify(options)}`;
    
    // Return existing promise if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Check cache first
    const cached = cacheManager.get(key);
    if (cached) {
      return cached;
    }

    // Make new request
    const promise = fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }).then(async (response) => {
      const data = await response.json();
      
      // Cache successful responses
      if (response.ok) {
        cacheManager.set(key, data);
      }
      
      return data;
    }).finally(() => {
      // Remove from pending requests
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}

export const apiOptimizer = new APIOptimizer();

// Virtual scrolling helper
export function calculateVirtualScrollItems({
  containerHeight,
  itemHeight,
  totalItems,
  scrollTop
}) {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, totalItems);
  
  return {
    startIndex,
    endIndex,
    visibleCount,
    totalHeight: totalItems * itemHeight,
    offsetY: startIndex * itemHeight
  };
}

// Bundle size optimization
export function preloadRoute(route) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  }
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = performance.memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
    };
  }
  return null;
}

// Performance metrics collection
export class PerformanceMetrics {
  constructor() {
    this.metrics = new Map();
  }

  startTiming(name) {
    this.metrics.set(name, {
      start: performance.now(),
      end: null,
      duration: null
    });
  }

  endTiming(name) {
    const metric = this.metrics.get(name);
    if (metric) {
      metric.end = performance.now();
      metric.duration = metric.end - metric.start;
    }
  }

  getTiming(name) {
    return this.metrics.get(name);
  }

  getAllMetrics() {
    return Object.fromEntries(this.metrics);
  }

  clear() {
    this.metrics.clear();
  }
}

export const performanceMetrics = new PerformanceMetrics();

// Resource hints
export function addResourceHints() {
  if (typeof window !== 'undefined') {
    // Preconnect to external domains
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    });
  }
}

// Service Worker registration for caching
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}
