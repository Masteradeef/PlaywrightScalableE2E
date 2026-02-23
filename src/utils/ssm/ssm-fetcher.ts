import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { fromIni } from '@aws-sdk/credential-provider-ini'

interface SSMConfig {
  region?: string
  profile?: string
}

export class SSMTokenFetcher {
  private ssmClient: SSMClient
  private cache = new Map<string, { value: string; expiry: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  constructor(config: SSMConfig = {}) {
    // Try to detect scloud profile automatically
    const profile = config.profile || this.detectScloudProfile()
    
    this.ssmClient = new SSMClient({
      region: config.region || process.env.AWS_REGION || 'eu-west-1',
      credentials: profile ? fromIni({ profile }) : undefined,
    })
  }

  private detectScloudProfile(): string | undefined {
    // Try to detect scloud-generated profile
    const fs = require('fs')
    const os = require('os')
    
    try {
      const credentialsPath = `${os.homedir()}/.aws/credentials`
      const credentialsFile = fs.readFileSync(credentialsPath, 'utf8')
      
      // Look for scloud-style profile (account_role format)
      const scloudProfileMatch = credentialsFile.match(/\[(\d+_\w+)\]/g)
      if (scloudProfileMatch && scloudProfileMatch[0]) {
        const profileName = scloudProfileMatch[0].replace(/[\[\]]/g, '')
        console.log(`🔧 SSM: Using detected scloud profile: ${profileName}`)
        return profileName
      }
    } catch (error) {
      // Fallback to environment or default behavior
    }
    
    return undefined
  }

  /**
   * Fetch a parameter from AWS SSM with caching
   */
  async fetchSSMTokenCached(parameterName: string): Promise<string | null> {
    try {
      // Check cache first
      const cached = this.cache.get(parameterName)
      if (cached && Date.now() < cached.expiry) {
        return cached.value
      }

      // Fetch from SSM
      const command = new GetParameterCommand({
        Name: parameterName,
        WithDecryption: true, // Decrypt SecureString parameters
      })

      const response = await this.ssmClient.send(command)
      const value = response.Parameter?.Value

      if (!value) {
        console.warn(`⚠️ SSM parameter '${parameterName}' not found or empty`)
        return null
      }

      // Cache the result
      this.cache.set(parameterName, {
        value,
        expiry: Date.now() + this.CACHE_TTL,
      })

      return value
    } catch (error) {
      console.error(`❌ Failed to fetch SSM parameter '${parameterName}':`, error)
      return null
    }
  }

  /**
   * Clear the cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear()
  }
}

// Singleton instance for reuse
let ssmFetcher: SSMTokenFetcher | null = null

export function getSSMFetcher(config?: SSMConfig): SSMTokenFetcher {
  if (!ssmFetcher) {
    ssmFetcher = new SSMTokenFetcher(config)
  }
  return ssmFetcher
}

/**
 * Convenience function to fetch SSM token with caching
 * Compatible with the original fetchSSMTokenCached function signature
 */
export async function fetchSSMTokenCached(
  parameterName: string, 
  tokenType?: any
): Promise<string | null> {
  const fetcher = getSSMFetcher()
  return fetcher.fetchSSMTokenCached(parameterName)
}
