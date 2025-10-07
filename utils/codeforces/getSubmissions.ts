import { User } from '@/types/User';
import { CodeforcesSubmission } from '@/types/Codeforces';
import { SuccessResponse, ErrorResponse, Response } from '@/types/Response';
import { getFromCache, setToCache } from '@/utils/cache';

const getSubmissionsCacheKey = (user: User) =>
  `codeforces-submissions-${user.codeforcesHandle}`;

const fetchSubmissions = async (
  user: User,
  from?: number,
  count?: number
): Promise<Response<CodeforcesSubmission[]>> => {
  try {
    let url = `https://codeforces.com/api/user.status?handle=${user.codeforcesHandle}`;
    if (from) {
      url += `&from=${from}`;
    }
    if (count) {
      url += `&count=${count}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== 'OK') {
      return ErrorResponse('Failed to fetch submissions');
    }
    return SuccessResponse(data.result);
  } catch (error) {
    return ErrorResponse((error as Error).message);
  }
};

const getSubmissions = async (
  user: User,
  from?: number,
  count?: number
): Promise<Response<CodeforcesSubmission[]>> => {
  const CACHE_KEY = getSubmissionsCacheKey(user);

  // Try to get from cache first
  const cachedSubmissions = getFromCache<CodeforcesSubmission[]>(CACHE_KEY);

  // If cache exists, return immediately and refresh in background
  if (cachedSubmissions) {
    // Start async refresh in background (don't await)
    fetchSubmissions(user, from, count)
      .then((freshData) => {
        if (freshData.success) {
          setToCache(CACHE_KEY, freshData.data);
        }
      })
      .catch((error) => {
        console.error('Background refresh failed for submissions:', error);
      });

    return SuccessResponse(cachedSubmissions);
  }

  // No cache exists, fetch synchronously
  const freshData = await fetchSubmissions(user, from, count);
  if (freshData.success) {
    setToCache(CACHE_KEY, freshData.data);
  }
  return freshData;
};

export default getSubmissions;
