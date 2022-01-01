import dictionary from "./dictionary.json";

export const dictionarySet: Set<string> = new Set(dictionary);

export function pick<T>(array: Array<T>): T {
  return array[Math.floor(array.length * Math.random())];
}
