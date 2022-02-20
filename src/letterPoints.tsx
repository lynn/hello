// Based on: https://leancrew.com/all-this/2022/01/wordle-letters/

const letterPoints: Record<string, number> = {
  a: 10,
  e: 10, // 10.0%
  r: 8,
  o: 8,
  i: 8, // 5.9%
  s: 6,
  t: 6,
  l: 6,
  n: 6,
  u: 6, // 3.8%
  y: 4,
  d: 4,
  c: 4,
  h: 4,
  m: 4,
  p: 4, // 3.0%
  b: 2,
  g: 2,
  k: 2,
  w: 2,
  f: 2,
  v: 2, // 1.1%
  z: 0,
  x: 0,
  j: 0,
  q: 0,
};

export default letterPoints;

// scrabble=based:
// a: 10,
// e: 10,
// i: 10,
// l: 10,
// n: 10,
// o: 10,
// r: 10,
// s: 10,
// t: 10,
// u: 10,
// d: 9,
// g: 9,
// b: 8,
// c: 8,
// m: 8,
// p: 8,
// f: 7,
// h: 7,
// v: 7,
// w: 7,
// y: 7,
// k: 6,
// j: 3,
// x: 3,
// q: 1,
// z: 1,
