class MemoryStorage {
  constructor() {
    this.map = new Map()
  }
  getItem(key) {
    return this.map.has(String(key)) ? this.map.get(String(key)) : null
  }
  setItem(key, value) {
    this.map.set(String(key), String(value))
  }
  removeItem(key) {
    this.map.delete(String(key))
  }
  clear() {
    this.map.clear()
  }
}

if (typeof globalThis.sessionStorage === 'undefined') {
  globalThis.sessionStorage = new MemoryStorage()
}
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = new MemoryStorage()
}
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    sessionStorage: globalThis.sessionStorage,
    localStorage: globalThis.localStorage,
    location: {
      origin: 'https://drivique.tech',
      hostname: 'drivique.tech',
      href: 'https://drivique.tech/',
    },
  }
}
if (!globalThis.process.env.VITE_API_URL) {
  globalThis.process.env.VITE_API_URL = 'https://drivique.tech/api/v1'
}

