import { NextApiRequest, NextApiResponse } from 'next';
import redisClient, { connectRedis } from '@/lib/redis';
import { nanoid } from 'nanoid';

interface ShareCodeData {
  boardId: string;
  boardName: string;
  createdBy: string;
  createdAt: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectRedis();

  if (req.method === 'POST') {
    // Generate share code
    const { boardId, boardName, userId } = req.body;

    if (!boardId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Generate unique 6-character code
      const shareCode = nanoid(6).toUpperCase();

      const shareData: ShareCodeData = {
        boardId,
        boardName,
        createdBy: userId,
        createdAt: Date.now(),
      };

      // Store in Redis with 5-minute expiration (300 seconds)
      await redisClient.setEx(
        `share:${shareCode}`,
        300,
        JSON.stringify(shareData)
      );

      // Also store reverse mapping for cleanup
      await redisClient.setEx(
        `share:board:${boardId}:${shareCode}`,
        300,
        '1'
      );

      res.status(200).json({
        shareCode,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes from now
      });
    } catch (error) {
      console.error('Error generating share code:', error);
      res.status(500).json({ error: 'Failed to generate share code' });
    }
  } else if (req.method === 'GET') {
    // Validate share code
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing share code' });
    }

    try {
      const data = await redisClient.get(`share:${code}`);

      if (!data) {
        return res.status(404).json({ error: 'Share code not found or expired' });
      }

      const shareData = JSON.parse(data) as ShareCodeData;
      res.status(200).json(shareData);
    } catch (error) {
      console.error('Error validating share code:', error);
      res.status(500).json({ error: 'Failed to validate share code' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
