export const wordLength = 5;

export function pick<T>(array: Array<T>): T {
  return array[Math.floor(array.length * Math.random())];
}
