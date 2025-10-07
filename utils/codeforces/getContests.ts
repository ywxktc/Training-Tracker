import { Contest } from '@/types/Codeforces';
import { SuccessResponse, ErrorResponse, Response } from '@/types/Response';
import { getFromCache, setToCache } from '@/utils/cache';

const CACHE_KEY = 'codeforces-contests';

const fetchContests = async (): Promise<Response<Contest[]>> => {
  try {
    const res = await fetch('https://codeforces.com/api/contest.list');
    const data = await res.json();
    if (data.status !== 'OK') {
      return ErrorResponse('Failed to fetch contests');
    }
    return SuccessResponse(data.result);
  } catch (error) {
    return ErrorResponse((error as Error).message);
  }
};

const getContests = async (): Promise<Response<Contest[]>> => {
  // Try to get from cache first
  const cachedContests = getFromCache<Contest[]>(CACHE_KEY);

  // If cache exists, return immediately and refresh in background
  if (cachedContests) {
    // Start async refresh in background (don't await)
    fetchContests()
      .then((freshData) => {
        if (freshData.success) {
          setToCache(CACHE_KEY, freshData.data);
        }
      })
      .catch((error) => {
        console.error('Background refresh failed for contests:', error);
      });

    return SuccessResponse(cachedContests);
  }

  // No cache exists, fetch synchronously
  const freshData = await fetchContests();
  if (freshData.success) {
    setToCache(CACHE_KEY, freshData.data);
  }
  return freshData;
};

export default getContests;
