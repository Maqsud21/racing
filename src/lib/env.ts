// Environment variables utility
export function getEnvVar(key: string, defaultValue: string = ''): string {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env[key] || defaultValue
  }
  // Client-side - we'll need to pass these from the server
  return defaultValue
}

// Specific environment variables
export function getPumpFunLink(): string {
  return getEnvVar('PUMP_FUN_LINK', 'https://pump.fun')
}

export function getContractAddress(): string {
  return getEnvVar('CONTRACT_ADDRESS', '')
}
