// Timezone utility functions for consistent UTC handling

export function formatUTCDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }) + ' UTC'
}

export function formatUTCDateTimeShort(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    timeZone: 'UTC',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }) + ' UTC'
}

export function convertLocalToUTC(localDateTime: string): string {
  const localDate = new Date(localDateTime)
  const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000)
  return utcDate.toISOString()
}

export function convertUTCToLocal(utcDateTime: string): string {
  const utcDate = new Date(utcDateTime)
  const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

export function getCurrentUTCTime(): string {
  return new Date().toISOString()
}

export function isUTCTimeInFuture(utcTime: string): boolean {
  return new Date(utcTime) > new Date()
}
