const cache = new Map(), lru = [];


const mem = limit => fn => {
  const memoizerific = function() {
    let currentCache = cache;
    let newMap;
    let fnResult;
    const argsLengthMinusOne = arguments.length - 1;
    const lruPath = Array(argsLengthMinusOne + 1);
    let isMemoized = true;
    let i;

    if ((memoizerific.numArgs || memoizerific.numArgs === 0) && memoizerific.numArgs !== argsLengthMinusOne + 1) {
      throw new Error('Memoizerific functions should always be called with the same number of arguments');
    }


    for (i = 0; i < argsLengthMinusOne; i++) {
      lruPath[i] = {
        cacheItem: currentCache,
        arg: arguments[i]
      };

      if (currentCache.has(arguments[i])) {
        currentCache = currentCache.get(arguments[i]);
        continue;
      }

      isMemoized = false;

      // make maps until last value
      newMap = new Map();
      currentCache.set(arguments[i], newMap);
      currentCache = newMap;
    }

    isMemoized && (currentCache.has(arguments[argsLengthMinusOne]) ? fnResult = currentCache.get(arguments[argsLengthMinusOne]) : isMemoized = !1);
    isMemoized || (fnResult = fn.apply(null, arguments), currentCache.set(arguments[argsLengthMinusOne], fnResult));

    0 < limit && (lruPath[argsLengthMinusOne] = {
      cacheItem: currentCache,
      arg: arguments[argsLengthMinusOne]
    }, isMemoized ? moveToMostRecentLru(lru, lruPath) : lru.push(lruPath), lru.length > limit && removeCachedResult(lru.shift()));

    memoizerific.wasMemoized = isMemoized;
    memoizerific.numArgs = argsLengthMinusOne + 1;

    return fnResult;
  };

  memoizerific.limit = limit;
  memoizerific.wasMemoized = false;
  memoizerific.cache = cache;
  memoizerific.lru = lru;

  return memoizerific;
};

function moveToMostRecentLru(lru, lruPath) {
  const lruLen = lru.length;
  const lruPathLen = lruPath.length;
  let isMatch;
  let i;
  let ii;

  for (i = 0; i < lruLen; i++) {
    isMatch = true;
    for (ii = 0; ii < lruPathLen; ii++) {
      if (!isEqual(lru[i][ii].arg, lruPath[ii].arg)) {
        isMatch = false;
        break;
      }
    }
    if (isMatch) {
      break;
    }
  }

  lru.push(lru.splice(i, 1)[0]);
}

function removeCachedResult(removedLru) {
  const removedLruLen = removedLru.length;
  let currentLru = removedLru[removedLruLen - 1];
  let tmp;
  let i;

  currentLru.cacheItem.delete(currentLru.arg);

  for (i = removedLruLen - 2; i >= 0; i--) {
    currentLru = removedLru[i];
    tmp = currentLru.cacheItem.get(currentLru.arg);

    if (!tmp || !tmp.size) {
      currentLru.cacheItem.delete(currentLru.arg);
    } else {
      break;
    }
  }
}

function isEqual(val1, val2) {
  return val1 === val2 || (val1 !== val1 && val2 !== val2);
}
console.clear();
//console.log(mem);
console.time('a');
const abc = mem(50)((a, b, c) => a * b * c);
const bcd = abc(5, 11, 20);
console.log(bcd);
console.timeEnd('a');
