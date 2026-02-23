import SSM from 'aws-sdk/clients/ssm'
import mem from 'p-memoize'
import { RequestTag } from '../infrastructure/metrics/tagTypes'

const fetchSSMToken = async (
  keyName: string,
  requestTag: RequestTag,
): Promise<string | undefined> => {
  try {
    const ssm = new SSM({ region: process.env.AWS_REGION || 'eu-west-1' }) // Need to re-create instance as AWS credentials expire in 15 minutes
    const data = await ssm
      .getParameter({
        Name: keyName,
        WithDecryption: true,
      })
      .promise()

    const apiKey = data.Parameter && data.Parameter.Value

    return apiKey
  } catch (e) {
    throw new Error(
      `Could not get the key parameter from SSM: ${(e as Error).message}`,
    )
  }
}

export const fetchSSMTokenCached = mem(fetchSSMToken, {
  cachePromiseRejection: false,
  maxAge: 10 * 60 * 1000, // 10 minutes in milliseconds
})
