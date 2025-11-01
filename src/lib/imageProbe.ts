// concurrency-limited image probe for browser environments
// prevents creating too many Image objects at once which can cause high memory usage
let active = 0
const queue: Array<() => void> = []
const CONCURRENCY = 4

function next() {
  if (active >= CONCURRENCY) return
  const job = queue.shift()
  if (!job) return
  active++
  job()
}

export function probeImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const run = () => {
      try {
        if (typeof Image === 'undefined') {
          resolve(false)
          active = Math.max(0, active - 1)
          next()
          return
        }
        const img = new Image()
        try { img.crossOrigin = 'anonymous' } catch {}
        const cleanup = () => {
          // allow GC to collect the image object
          img.onload = null
          img.onerror = null
        }
        img.onload = () => {
          cleanup()
          resolve(true)
          active = Math.max(0, active - 1)
          next()
        }
        img.onerror = () => {
          cleanup()
          resolve(false)
          active = Math.max(0, active - 1)
          next()
        }
        // kick off load
        img.src = url
      } catch (err) {
        resolve(false)
        active = Math.max(0, active - 1)
        next()
      }
    }

    queue.push(run)
    // attempt to start immediately
    next()
  })
}

// placeholder: exported so callers can be feature-flagged later; no-op for now
export function setConcurrency(_n: number) {
  // no-op: concurrency is currently fixed at build-time (CONCURRENCY)
}
