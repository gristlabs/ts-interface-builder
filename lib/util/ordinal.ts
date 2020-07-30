export function ordinal (number: number): string {
    let result = String(number)
    const n = Math.abs(number)
    const cent = n % 100
    const dec = n % 10
    if (cent >= 10 && cent <= 20) {
        result += 'th'
    } else if (dec === 1) {
        result += 'st'
    } else if (dec === 2) {
        result += 'nd'
    } else if (dec === 3) {
        result += 'rd'
    } else {
        result += 'th'
    }
    return result
}
