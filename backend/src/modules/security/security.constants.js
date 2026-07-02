const RATE_LIMITS = {
  GLOBAL: {
    windowSeconds: 60,
    maxRequests: 120,
  },

  AUTH: {
    windowSeconds: 15 * 60,
    maxRequests: 10,
  },

  AI: {
    windowSeconds: 60 * 60,
    maxRequests: 20,
  },

  EMAIL: {
    windowSeconds: 60,
    maxRequests: 5,
  },

  JOBS: {
    windowSeconds: 60,
    maxRequests: 20,
  },
};

const CACHE_TTL_SECONDS = {
  DASHBOARD_ANALYTICS: 60,
};

export { RATE_LIMITS, CACHE_TTL_SECONDS };