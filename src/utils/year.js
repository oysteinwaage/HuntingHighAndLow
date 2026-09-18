export function getCurrentHuntingYear() {
  return new Date().getFullYear()
}

export function getYearOptions(range = 3) {
  const current = getCurrentHuntingYear()
  const years = []
  for (let y = current + 1; y >= current - range; y--) {
    years.push(y)
  }
  return years
}
