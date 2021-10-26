export function randomInteger(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1)
  return Math.round(rand)
}

export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
}

export function chunkArray(arr, size) {
  return arr.length > size
    ? [arr.slice(0, size), ...this.chunkArray(arr.slice(size), size)]
    : [arr]
}