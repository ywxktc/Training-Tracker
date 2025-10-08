import { Contest } from '@/types/Codeforces'
import { SuccessResponse, ErrorResponse, Response } from '@/types/Response'

const getContests = async (): Promise<Response<Contest[]>> => {
  try {
    const res = await fetch('https://codeforces.com/api/contest.list')
    const data = await res.json()
    if (data.status !== 'OK') {
      return ErrorResponse('Failed to fetch contests')
    }
    return SuccessResponse(data.result)
  } catch (error) {
    return ErrorResponse((error as Error).message)
  }
}

export default getContests
