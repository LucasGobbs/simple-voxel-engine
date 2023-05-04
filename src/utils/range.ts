export const Range = function* (total = 0,  from = 0, step = 1) {
  for (let i = 0; i < total; yield from + i++ * step) {}
};