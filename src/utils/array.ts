export namespace Arr {
  export const equal = (a: any[], b: any[]) => {
    if (a.length != b.length) return false;
    for (let i = 0; i < a.length; i++){
      if (a[i] != b[i]) return false;
    }
    return true
  }
  export const listEqual = (a: any[], b: any[]) => {
    for (let i = 0; i < b.length; i++){
      for (let j = 0; j < a.length; j++) {
        if (a[j] != b[i][j]) return false;
      }
    }
    return true
  }
  export const sum = (a: number[], b: number[]) => a.map((x, i) => (x + b[i]))
  export const sumN = (a: any[]) => {
    if(!a.length) throw Error("None array")
  }
}


