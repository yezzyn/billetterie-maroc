import Redis from 'ioredis';

// In-memory fallback used when Redis is unreachable (local dev without Docker).
// In production with docker-compose, Redis is always available.
const memoryStore = new Map<string, { value: string; expiresAt: number }>();
let usingFallback = false;

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const isProduction = process.env.NODE_ENV === 'production';

// Upstash (and any rediss:// endpoint) requires TLS and relaxed retry settings
const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
  ...(isProduction && (redisUrl.includes('upstash.io') || redisUrl.startsWith('rediss://'))
    ? {
        tls: {},
        maxRetriesPerRequest: null,
        retryStrategy: (times: number) => (times > 3 ? null : Math.min(times * 200, 2000))
      }
    : {})
});

redis.on('error', () => {
  if (!usingFallback) {
    usingFallback = true;
    console.warn('[redis] unreachable — using in-memory fallback (dev mode)');
  }
});

async function connect(): Promise<typeof redis | null> {
  if (usingFallback) return null;
  if (redis.status !== 'ready' && redis.status !== 'connecting') {
    try {
      await redis.connect();
    } catch {
      usingFallback = true;
      return null;
    }
  }
  return redis;
}

function memGet(key: string): string | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

async function setex(key: string, seconds: number, value: string) {
  const client = await connect();
  if (client) {
    await client.setex(key, seconds, value);
  } else {
    memoryStore.set(key, { value, expiresAt: Date.now() + seconds * 1000 });
  }
}

async function get(key: string): Promise<string | null> {
  const client = await connect();
  return client ? await client.get(key) : memGet(key);
}

async function del(key: string) {
  const client = await connect();
  if (client) {
    await client.del(key);
  } else {
    memoryStore.delete(key);
  }
}

export default redis;

export async function storeOTP(phone: string, otp: string): Promise<void> {
  await setex(`otp:${phone}`, 600, otp); // 10 minutes
}

export async function verifyAndDeleteOTP(
  phone: string,
  otp: string
): Promise<boolean> {
  const storedOTP = await get(`otp:${phone}`);
  if (!storedOTP) return false;

  const isValid = storedOTP === otp;
  if (isValid) {
    await del(`otp:${phone}`);
  }
  return isValid;
}

export async function createSession(
  userId: string,
  token: string
): Promise<void> {
  await setex(`session:${token}`, 604800, userId); // 7 days
}

export async function getSession(token: string): Promise<string | null> {
  return await get(`session:${token}`);
}

export async function deleteSession(token: string): Promise<void> {
  await del(`session:${token}`);
}
