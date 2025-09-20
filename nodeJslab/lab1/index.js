
const toNums = (arr) => {
  const nums = arr.map((x) => Number(x));
  if (nums.some((n) => Number.isNaN(n))) {
    throw new Error('all inputs must be numbers');
  }
  return nums;
};

const [, , actionRaw, ...rest] = process.argv;
const action = (actionRaw || '').toLowerCase();

function doAdd(nums) {
  return nums.reduce((a, b) => a + b, 0);
}
function doDivide(nums) {
  if (nums.length < 2) throw new Error('divide needs 2 numbers at least');
  if (nums[1] === 0) throw new Error('division by zero');
  return nums[0] / nums[1];
}
function doSubtract(nums) {
  if (nums.length < 2) throw new Error('subtract needs 2 numbers at least');
  return nums.slice(1).reduce((a, b) => a - b, nums[0]);
}
function doMulti(nums) {
  if (nums.length < 2) throw new Error('multiply needs 2 numbers at least');
  return nums.reduce((a, b) => a * b, 1);
}

try {
  const nums = toNums(rest);
  let result;

  switch (action) {
    case 'add':
      result = doAdd(nums);
      break;
    case 'divide':
      result = doDivide(nums);
      break;
    case 'subtract':
    case 'sub': 
      result = doSubtract(nums);
      break;
    case 'multi':
    case 'mul': 
      result = doMulti(nums);
      break;
    default:
      console.error('usage: add|divide|subtract|multi <n...>');
      process.exit(1);
  }

 
  if (result !== undefined) {
    console.log(result);
  }
} catch (e) {
  console.error('error:', e.message);
  process.exit(1);
}
