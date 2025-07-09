// src/utils/DSAAlgorithms.js

class DSAAlgorithms {
  // Cache for sorted data: fileName[columnName] -> { data, order, dataHash }
  static sortedCache = new Map();
  
  // Session tracking for cache invalidation
  static currentSession = Date.now();

  // // Bubble Sort
  // static bubbleSort(arr, key, order = 'asc') {
  //   console.log("Bubble Sort Executed");
  //   const data = [...arr];
  //   const n = data.length;
  //   for (let i = 0; i < n - 1; i++) {
  //     for (let j = 0; j < n - i - 1; j++) {
  //       const a = this.getValue(data[j], key);
  //       const b = this.getValue(data[j + 1], key);
  //       if ((order === 'asc' && a > b) || (order === 'desc' && a < b)) {
  //         [data[j], data[j + 1]] = [data[j + 1], data[j]];
  //       }
  //     }
  //   }
  //   return data;
  // }

  // Insertion Sort
  static insertionSort(arr, key, order = 'asc') {
    console.log("Insertion Sort Executed");
    const data = [...arr];
    for (let i = 1; i < data.length; i++) {
      let current = data[i];
      let j = i - 1;
      while (j >= 0 && ((order === 'asc' && this.getValue(data[j], key) > this.getValue(current, key)) || 
                        (order === 'desc' && this.getValue(data[j], key) < this.getValue(current, key)))) {
        data[j + 1] = data[j];
        j--;
      }
      data[j + 1] = current;
    }
    return data;
  }

  // Selection Sort
  static selectionSort(arr, key, order = 'asc') {
    console.log("Selection Sort Executed");
    const data = [...arr];
    for (let i = 0; i < data.length - 1; i++) {
      let idx = i;
      for (let j = i + 1; j < data.length; j++) {
        const a = this.getValue(data[j], key);
        const b = this.getValue(data[idx], key);
        if ((order === 'asc' && a < b) || (order === 'desc' && a > b)) {
          idx = j;
        }
      }
      if (idx !== i) {
        [data[i], data[idx]] = [data[idx], data[i]];
      }
    }
    return data;
  }

  // Quick Sort
  static quickSort(arr, key, order = 'asc') {
    if (arr.length <= 1) return arr;
    if (arr.length === 2) console.log("Quick Sort Partial Execution"); 
    else console.log("Quick Sort Executed");

    const pivot = arr[Math.floor(arr.length / 2)];
    const pivotValue = this.getValue(pivot, key);
    const left = [];
    const right = [];
    const equal = [];

    for (const item of arr) {
      const value = this.getValue(item, key);
      if (value < pivotValue) {
        order === 'asc' ? left.push(item) : right.push(item);
      } else if (value > pivotValue) {
        order === 'asc' ? right.push(item) : left.push(item);
      } else {
        equal.push(item);
      }
    }

    return [
      ...this.quickSort(left, key, order),
      ...equal,
      ...this.quickSort(right, key, order)
    ];
  }

  // Merge Sort
  static mergeSort(arr, key, order = 'asc') {
    if (arr.length <= 1) return arr;
    if (arr.length === 2) console.log("Merge Sort Partial Execution");
    else console.log("Merge Sort Executed");

    const mid = Math.floor(arr.length / 2);
    const left = this.mergeSort(arr.slice(0, mid), key, order);
    const right = this.mergeSort(arr.slice(mid), key, order);

    return this.merge(left, right, key, order);
  }

  // Merge helper function
  static merge(left, right, key, order) {
    const result = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
      const leftVal = this.getValue(left[i], key);
      const rightVal = this.getValue(right[j], key);
      if ((order === 'asc' && leftVal <= rightVal) || (order === 'desc' && leftVal >= rightVal)) {
        result.push(left[i]);
        i++;
      } else {
        result.push(right[j]);
        j++;
      }
    }

    return result.concat(left.slice(i)).concat(right.slice(j));
  }

  // Enhanced Linear Search
  static linearSearch(arr, key, value) {
    console.log("Linear Search Executed");
    const results = [];
    const lowerQuery = (value || '').toString().toLowerCase();

    for (let i = 0; i < arr.length; i++) {
      const itemValue = this.getValue(arr[i], key);
      if (itemValue.toString().toLowerCase().includes(lowerQuery)) {
        results.push({ index: i, item: arr[i] });
      }
    }
    return results;
  }

  // Enhanced Binary Search with Caching and Auto-sorting
  static binarySearch(arr, key, value, fileName = 'default') {
    console.log("Binary Search Requested");
    
    // Check for empty values
    const hasEmpty = arr.some(item => {
      const val = this.getValue(item, key);
      return val === undefined || val === null || val.toString().trim() === '';
    });

    if (hasEmpty) {
      console.warn("Empty values detected — Falling back to Linear Search");
      return this.linearSearch(arr, key, value);
    }

    // Check cache first
    const cacheKey = `${fileName}[${key}]`;
    const dataHash = this.generateDataHash(arr);
    const cachedData = this.getCachedSortedData(cacheKey, dataHash);
    
    let sortedData, sortOrder;
    
    if (cachedData) {
      console.log("Using cached sorted data");
      sortedData = cachedData.data;
      sortOrder = cachedData.order;
    } else {
      // Detect current sort order
      sortOrder = this.detectSortOrder(arr, key);
      
      if (sortOrder === 'unsorted') {
        // Sort the data using size-appropriate algorithm and cache it
        const sortAlgorithm = this.getBestSortAlgorithm(arr.length);
        console.log(`Data unsorted - Applying ${sortAlgorithm} and caching`);
        sortedData = this[sortAlgorithm](arr, key, 'asc');
        sortOrder = 'asc';
        this.setCachedSortedData(cacheKey, sortedData, sortOrder, dataHash);
      } else {
        console.log(`Data already sorted in ${sortOrder} order - Caching current state`);
        sortedData = [...arr];
        this.setCachedSortedData(cacheKey, sortedData, sortOrder, dataHash);
      }
    }

    console.log(`Binary Search Executed with ${sortOrder} order`);
    
    // Perform binary search
    return this.performBinarySearch(sortedData, key, value, sortOrder);
  }

  //Generate hash for data integrity checking
  static generateDataHash(arr) {
    // Simple hash based on array length and first/last few elements
    if (arr.length === 0) return 'empty';
    
    const sample = arr.length > 10 ? 
      [arr[0], arr[1], arr[arr.length-2], arr[arr.length-1]] : 
      arr;
    
    return `${arr.length}_${JSON.stringify(sample)}`.slice(0, 100);
  }

  // Detect if data is already sorted
  static detectSortOrder(arr, key) {
    if (arr.length <= 1) return 'asc';
    
    let isAsc = true;
    let isDesc = true;
    
    for (let i = 1; i < arr.length; i++) {
      const prev = this.getValue(arr[i - 1], key);
      const curr = this.getValue(arr[i], key);
      
      if (prev > curr) isAsc = false;
      if (prev < curr) isDesc = false;
      
      if (!isAsc && !isDesc) return 'unsorted';
    }
    
    if (isAsc) return 'asc';
    if (isDesc) return 'desc';
    return 'unsorted';
  }

  // Cache management with data integrity checking
  static getCachedSortedData(cacheKey, currentDataHash) {
    const cached = this.sortedCache.get(cacheKey);
    
    if (!cached) return null;
    
    // Check if data has been modified (hash mismatch)
    if (cached.dataHash !== currentDataHash) {
      console.log("Data modified - Cache invalidated");
      this.sortedCache.delete(cacheKey);
      return null;
    }
    
    return cached;
  }

  
 
  // if size exceed then make cacahe empty
  static setCachedSortedData(cacheKey, data, order, dataHash) {
    this.sortedCache.set(cacheKey, {
      data: [...data],
      order: order,
      dataHash: dataHash,
      sessionId: this.currentSession
    });
  
    const maxAllowedMemory = 5 * 1024 * 1024; // 5MB limit (adjust as needed)
    const currentMemory = JSON.stringify(Array.from(this.sortedCache.entries())).length;
  
    if (currentMemory > maxAllowedMemory) {
      console.warn(`⚠️ Cache exceeded ${(maxAllowedMemory / (1024 * 1024)).toFixed(2)}MB — Auto-clearing oldest entries`);
  
      const keys = Array.from(this.sortedCache.keys());
      let idx = 0;
  
      while (idx < keys.length && JSON.stringify(Array.from(this.sortedCache.entries())).length > maxAllowedMemory) {
        this.sortedCache.delete(keys[idx]);
        idx++;
      }
  
      console.log(`✅ Cache reduced — Current memory: ${(JSON.stringify(Array.from(this.sortedCache.entries())).length / 1024).toFixed(2)}KB`);
    }
  
    // Optional: Maintain max 100 entries regardless of memory
    if (this.sortedCache.size > 100) {
      const oldestKey = this.sortedCache.keys().next().value;
      this.sortedCache.delete(oldestKey);
    }
  }
//////////////////////////////////  




  // Perform binary search with order awareness
  static performBinarySearch(sortedData, key, value, order) {
    let left = 0, right = sortedData.length - 1;
    const results = [];
    const lowerValue = (value || '').toString().toLowerCase();

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midValue = this.getValue(sortedData[mid], key).toString().toLowerCase();

      if (midValue === lowerValue) {
        results.push({ index: mid, item: sortedData[mid] });

        // Find all matching values
        let l = mid - 1, r = mid + 1;
        while (l >= 0 && this.getValue(sortedData[l], key).toString().toLowerCase() === lowerValue) {
          results.unshift({ index: l, item: sortedData[l] });
          l--;
        }
        while (r < sortedData.length && this.getValue(sortedData[r], key).toString().toLowerCase() === lowerValue) {
          results.push({ index: r, item: sortedData[r] });
          r++;
        }
        break;
      } else if (order === 'asc') {
        if (midValue < lowerValue) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      } else { // desc order
        if (midValue > lowerValue) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
    }
    return results;
  }

  // Enhanced search with intelligent algorithm selection based on data size
  static intelligentSearch(arr, key, value, fileName = 'default') {
    const algorithm = this.getBestSearchAlgorithm(arr.length);
    
    if (algorithm === 'binarySearch') {
      return this.binarySearch(arr, key, value, fileName);
    } else {
      return this.linearSearch(arr, key, value);
    }
  }

  // Enhanced sort with caching and size-based algorithm selection
  static intelligentSort(arr, key, order = 'asc', fileName = 'default') {
    const cacheKey = `${fileName}[${key}]`;
    const dataHash = this.generateDataHash(arr);
    
    // Check if we already have this data sorted in the requested order
    const cachedData = this.getCachedSortedData(cacheKey, dataHash);
    if (cachedData && cachedData.order === order) {
      console.log("Using cached sorted data");
      return cachedData.data;
    }
    
    // Sort the data using size-appropriate algorithm
    const algorithm = this.getBestSortAlgorithm(arr.length);
    const sortedData = this[algorithm](arr, key, order);
    
    // Cache the result
    this.setCachedSortedData(cacheKey, sortedData, order, dataHash);
    
    return sortedData;
  }

  // Get value from item
  static getValue(item, key) {
    if (typeof item === 'object' && item !== null) {
      return item[key] !== undefined && item[key] !== null ? item[key] : '';
    }
    return item !== undefined && item !== null ? item : '';
  }

  // Dynamic algorithm selection based on data size
  static getBestSortAlgorithm(dataSize) {
    if (dataSize < 10) return 'insertionSort';
    if (dataSize < 50) return 'selectionSort';
    if (dataSize < 1000) return 'quickSort';
    return 'mergeSort';
  }

  static getBestSearchAlgorithm(dataSize) {
    if (dataSize < 20) return 'linearSearch';
    return 'binarySearch';
  }

  // Session management
  static invalidateSession() {
    console.log("Session invalidated - Clearing all cache");
    this.sortedCache.clear();
    this.currentSession = Date.now();
  }

  // Cache utilities
  static clearCache() {
    this.sortedCache.clear();
    console.log("Cache cleared");
  }



static getCacheInfo() {
  const memoryBytes = JSON.stringify(Array.from(this.sortedCache.entries())).length;
  return {
    size: this.sortedCache.size,
    keys: Array.from(this.sortedCache.keys()),
    totalMemory: `${(memoryBytes / 1024).toFixed(2)} KB (${(memoryBytes / (1024 * 1024)).toFixed(3)} MB)`
  };
}
//////////////////////////////////////







  // Invalidate cache for specific file when data is modified
  static invalidateFileCache(fileName) {
    const keysToDelete = [];
    for (const key of this.sortedCache.keys()) {
      if (key.startsWith(`${fileName}[`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.sortedCache.delete(key);
    });
    
    console.log(`Cache invalidated for file: ${fileName} (${keysToDelete.length} entries removed)`);
  }
}




export default DSAAlgorithms;











