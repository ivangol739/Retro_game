import { calcTileType } from '../utils';

test('should top-left', () => {
  const result = calcTileType(0, 8);
  expect(result).toBe('top-left');
});
test('should top', () => {
  const result = calcTileType(5, 8);
  expect(result).toBe('top');
});
test('should top-right', () => {
  const result = calcTileType(7, 8);
  expect(result).toBe('top-right');
});
test('should bottom-left', () => {
  const result = calcTileType(56, 8);
  expect(result).toBe('bottom-left');
});
test('should bottom', () => {
  const result = calcTileType(60, 8);
  expect(result).toBe('bottom');
});
test('should bottom-right', () => {
  const result = calcTileType(63, 8);
  expect(result).toBe('bottom-right');
});
test('should left', () => {
  const result = calcTileType(8, 8);
  expect(result).toBe('left');
});
test('should right', () => {
  const result = calcTileType(15, 8);
  expect(result).toBe('right');
});
test('should center', () => {
  const result = calcTileType(18, 8);
  expect(result).toBe('center');
});
