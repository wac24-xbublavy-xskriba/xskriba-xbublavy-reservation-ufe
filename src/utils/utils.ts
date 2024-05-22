export const formatFullName = (a?: string, b?: string): string => {
  return `${a} ${b}`
}

export const isValidTimeBefore = (open?: string, close?: string): boolean => {
  if (!open || !close) return false

  const [openHour, openMinute] = open.split(':').map(Number)
  const [closeHour, closeMinute] = close.split(':').map(Number)

  return openHour > closeHour || (openHour === closeHour && openMinute >= closeMinute)
}
