import redisClient, { connectRedis } from './redis';

export interface CachedUser {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  createdAt: string;
  lastActive: string;
  boardCount: number;
  drawingCount: number;
}

const USER_CACHE_TTL = 30 * 24 * 60 * 60; // 30 days

export const cacheUser = async (
  user: CachedUser
): Promise<void> => {
  try {
    await connectRedis();

    const cacheKey = `user:${user.id}`;

    const updatedUser: CachedUser = {
      ...user,
      lastActive: new Date().toISOString(),
    };

    // Store user data
    await redisClient.setEx(
      cacheKey,
      USER_CACHE_TTL,
      JSON.stringify(updatedUser)
    );

    // Track recent/frequent users
    await redisClient.zAdd('frequent_users', {
      score: Date.now(),
      value: user.id,
    });

    // Optional: keep only latest 1000 users
    await redisClient.zRemRangeByRank(
      'frequent_users',
      0,
      -1001
    );

    console.log(`Cached user: ${user.id}`);
  } catch (error) {
    console.error('Error caching user:', error);
  }
};

export const getUserFromCache = async (
  userId: string
): Promise<CachedUser | null> => {
  try {
    await connectRedis();

    const cacheKey = `user:${userId}`;

    const cached = await redisClient.get(cacheKey);

    if (!cached) return null;

    let user: CachedUser;

    try {
      user = JSON.parse(cached);
    } catch (parseError) {
      console.error('Invalid cached JSON:', parseError);
      return null;
    }

    // Refresh TTL + update activity
    const updatedUser: CachedUser = {
      ...user,
      lastActive: new Date().toISOString(),
    };

    await redisClient.setEx(
      cacheKey,
      USER_CACHE_TTL,
      JSON.stringify(updatedUser)
    );

    return updatedUser;
  } catch (error) {
    console.error('Error getting cached user:', error);
    return null;
  }
};

export const getFrequentUsers = async (
  limit = 10
): Promise<CachedUser[]> => {
  try {
    await connectRedis();

    const userIds = await redisClient.zRange(
      'frequent_users',
      0,
      limit - 1,
      {
        REV: true,
      }
    );

    const users = await Promise.all(
      userIds.map((id) => getUserFromCache(id))
    );

    return users.filter(Boolean) as CachedUser[];
  } catch (error) {
    console.error('Error getting frequent users:', error);
    return [];
  }
};

export const updateUserActivity = async (
  userId: string
): Promise<void> => {
  try {
    await connectRedis();

    const user = await getUserFromCache(userId);

    if (!user) return;

    await cacheUser({
      ...user,
      lastActive: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating user activity:', error);
  }
};

export const clearUserCache = async (
  userId: string
): Promise<void> => {
  try {
    await connectRedis();

    await redisClient.del(`user:${userId}`);

    await redisClient.zRem(
      'frequent_users',
      userId
    );

    console.log(`Cleared cache for user: ${userId}`);
  } catch (error) {
    console.error('Error clearing user cache:', error);
  }
};