const n = 200;
for (let x = 0; x < n; x++){
  for (let y = 0; y < n; y++){
    for (let z = 0; z < n; z++){
    }
  }
}


console.time("Third")
let arrThird = new Array(n * n * n);
let i = 0;
for (let x = 0; x < n; x++){
  for (let y = 0; y < n; y++){
    for (let z = 0; z < n; z++){
      arrThird[i] = 1
      arrThird[i + 1] = 2
      arrThird[i + 2] = 3
      arrThird[i + 3] = 4
      arrThird[i + 4] = 5
      arrThird[i + 5] = 6
      i += 6;
    }
  }
}
console.timeEnd("Third")



console.time("First")
let arrFirst = [];
for (let x = 0; x < n; x++){
  for (let y = 0; y < n; y++){
    for (let z = 0; z < n; z++){
      arrFirst.push(1);
      arrFirst.push(2);
      arrFirst.push(3);
      arrFirst.push(4);
      arrFirst.push(5);
      arrFirst.push(6);
    }
  }
}
console.timeEnd("First")

console.time("Second")
let arrSecond = [];
for (let x = 0; x < n; x++){
  for (let y = 0; y < n; y++){
    for (let z = 0; z < n; z++){
      arrSecond.push(1, 2, 3, 4, 5, 6);
    }
  }
}
console.timeEnd("Second")
