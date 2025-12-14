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

export const cacheUser = async (user: CachedUser) => {
  try {
    await connectRedis();
    
    // Cache user for 30 days
    const cacheKey = `user:${user.id}`;
    await redisClient.setEx(
      cacheKey,
      30 * 24 * 60 * 60, // 30 days in seconds
      JSON.stringify({
        ...user,
        lastActive: new Date().toISOString(),
      })
    );

    // Add to frequent users set
    await redisClient.zAdd('frequent_users', {
      score: Date.now(),
      member: user.id,
    });

    console.log(`Cached user: ${user.id}`);
  } catch (error) {
    console.error('Error caching user:', error);
  }
};

export const getUserFromCache = async (userId: string): Promise<CachedUser | null> => {
  try {
    await connectRedis();
    
    const cacheKey = `user:${userId}`;
    const cached = await redisClient.get(cacheKey);
    
    if (!cached) return null;
    
    const user = JSON.parse(cached) as CachedUser;
    
    // Update last active
    await redisClient.setEx(
      cacheKey,
      30 * 24 * 60 * 60,
      JSON.stringify({
        ...user,
        lastActive: new Date().toISOString(),
      })
    );

    return user;
  } catch (error) {
    console.error('Error getting cached user:', error);
    return null;
  }
};

export const getFrequentUsers = async (limit = 10): Promise<CachedUser[]> => {
  try {
    await connectRedis();
    
    const userIds = await redisClient.zRange('frequent_users', 0, limit - 1, {
      byScore: true,
      rev: true,
    });

    const users: CachedUser[] = [];
    
    for (const userId of userIds) {
      const user = await getUserFromCache(userId);
      if (user) users.push(user);
    }

    return users;
  } catch (error) {
    console.error('Error getting frequent users:', error);
    return [];
  }
};

export const updateUserActivity = async (userId: string) => {
  try {
    await connectRedis();
    
    const user = await getUserFromCache(userId);
    if (user) {
      user.lastActive = new Date().toISOString();
      await cacheUser(user);
    }
  } catch (error) {
    console.error('Error updating user activity:', error);
  }
};

export const clearUserCache = async (userId: string) => {
  try {
    await connectRedis();
    
    await redisClient.del(`user:${userId}`);
    await redisClient.zRem('frequent_users', userId);
    
    console.log(`Cleared cache for user: ${userId}`);
  } catch (error) {
    console.error('Error clearing user cache:', error);
  }
};
