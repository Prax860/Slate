// Environment configuration for API endpoints

const isDev = process.env.NODE_ENV === 'development';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (isDev ? 'http://localhost:3001' : 'https://api.yourdomain.com');

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 
  (isDev ? 'http://localhost:3001' : 'https://api.yourdomain.com');

// API Client helper
export async function fetchAPI(
  path: string,
  options?: RequestInit
): Promise<any> {
  const url = `${API_URL}${path}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${path}):`, error);
    throw error;
  }
}

// Share API endpoints
export async function generateShareCode(
  boardId: string,
  boardName: string,
  userId: string
) {
  return fetchAPI('/api/share', {
    method: 'POST',
    body: JSON.stringify({ boardId, boardName, userId }),
  });
}

export async function validateShareCode(code: string) {
  return fetchAPI(`/api/share?code=${code}`);
}
