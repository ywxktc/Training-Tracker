export interface CacheEntry<T> {
  data: T
  timestamp: number
  version: string
}

const CACHE_VERSION = '1.0'

export const getFromCache = <T>(key: string): T | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const cached = localStorage.getItem(key)
    if (!cached) {
      return null
    }

    const entry: CacheEntry<T> = JSON.parse(cached)

    // Check version compatibility
    if (entry.version !== CACHE_VERSION) {
      localStorage.removeItem(key)
      return null
    }

    return entry.data
  } catch (error) {
    console.error('Error reading from cache:', error)
    localStorage.removeItem(key)
    return null
  }
}

export const setToCache = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION
    }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch (error) {
    console.error('Error writing to cache:', error)
  }
}

export const removeFromCache = (key: string): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from cache:', error)
  }
}

// Helper function for immediate cache return + async refresh pattern
export const createCachedApiCall = <T>(
  cacheKey: string,
  apiCall: () => Promise<T>,
  onCacheHit?: (data: T) => void
): (() => Promise<T>) => {
  return async () => {
    // Try to get from cache first
    const cachedData = getFromCache<T>(cacheKey)

    // If cache exists, return immediately and refresh in background
    if (cachedData) {
      if (onCacheHit) {
        onCacheHit(cachedData)
      }

      // Start async refresh in background (don't await)
      apiCall()
        .then((freshData) => {
          setToCache(cacheKey, freshData)
        })
        .catch((error) => {
          console.error(`Background refresh failed for ${cacheKey}:`, error)
        })

      return cachedData
    }

    // No cache exists, fetch synchronously
    const freshData = await apiCall()
    setToCache(cacheKey, freshData)
    return freshData
  }
}
