class MemoryManager {
  constructor(numBytes) {
    this.numBytes = numBytes; 
    this.buffer = this.initiateBuffer(this.numBytes); 
    this.metaDataSize = 3; 
    this.head = null; 
    this.tail = null; 
  }

  initiateBuffer(sizeInBytes) {
    // each index in array buffer "represents" an 8 byte memory address
    return sizeInBytes % 8 === 0 ? Array(sizeInBytes / 8).fill(0) : Array(Math.floor(sizeInBytes / 8) + 1).fill(0)
  }

  alloc(sizeInBytes) {
    if (sizeInBytes <= 0) return null; 

    let requestedSize = sizeInBytes % 8 === 0 ? sizeInBytes / 8 : Math.floor(sizeInBytes / 8) + 1;

    if (this.head === null) this.initHead();
    
    // request memory block
    let blockStartIdx = this.getFreeBlock(requestedSize); 

    // if block not big enough go back to OS to ask for another chunk 
    if (blockStartIdx === null) {
      let requiredMemAddreses = requestedSize + (2 * this.metaDataSize) - this.buffer[this.tail + 2]; 
      let generatedMemAddresses = this.requestChunk(requiredMemAddreses);
      this.buffer[this.tail + 2] += generatedMemAddresses;
      blockStartIdx = this.getFreeBlock(requestedSize) 
    } 
    
    this.buffer[blockStartIdx + 1] = false;
    this.tail = blockStartIdx; 
  
    // split off big enough chunk of block for current request, put rest back in free list 
    let { blockSize } = this.getMetadata(blockStartIdx)
    if (blockSize + this.metaDataSize > requestedSize) { 
      let freeBlockStartIdx = this.splitBlock(blockStartIdx, requestedSize); 
      this.tail = freeBlockStartIdx; 
    } 

    return blockStartIdx + this.metaDataSize; 
  }

  initHead() {
    this.buffer[0] = 0; 
    this.buffer[0 + 1] = true; 
    this.buffer[0 + 2] = this.buffer.length - 3; 
    this.head = 0; 
    this.tail = 0; 
  }

  getMetadata(blockStartIdx) {
    let next = this.buffer[blockStartIdx]; 
    let isFree = this.buffer[blockStartIdx + 1]; 
    let blockSize = this.buffer[blockStartIdx + 2]; 
    return { next: next, isFree: isFree, blockSize: blockSize }
  }

  getFreeBlock(requestedSize) {
    let currBlockIdx = this.head; 
    while (currBlockIdx !== null) {
      let { next, isFree, blockSize } = this.getMetadata(currBlockIdx)
      if (isFree && blockSize >= requestedSize + this.metaDataSize) return currBlockIdx; 
      if (next === 0) return null; 
      currBlockIdx = next;
    }
    return null; 
  }

  requestChunk(requiredMemAddreses) {
    if (requiredMemAddreses > 24) {
      this.buffer = [...this.buffer, ...Array(requiredMemAddreses).fill(0)]
      return requiredMemAddreses;
    } else {
      this.buffer = [...this.buffer, ...Array(24).fill(0)]    
      return 24; 
    }
  }

  splitBlock(blockStartIdx, size) { 
    let blockSize = this.buffer[blockStartIdx + 2]; 
    let excessChunkSize = blockSize - size - this.metaDataSize; 
    let freeBlockStartIdx = blockStartIdx + size + this.metaDataSize; 
    this.buffer[blockStartIdx] = freeBlockStartIdx; 
    this.buffer[blockStartIdx + 2] = size;
    this.buffer[freeBlockStartIdx] = null; 
    this.buffer[freeBlockStartIdx + 1] = true; 
    this.buffer[freeBlockStartIdx + 2] = excessChunkSize; 
    return freeBlockStartIdx
  }
  
  free(pointer) {
    let blockStartIdx = pointer - this.metaDataSize
    this.buffer[blockStartIdx + 1] = true; 
  }
};

module.exports.MemoryManager = MemoryManager; 

const memory2 = new MemoryManager(160); 
memory2.alloc(200); 
console.log(memory2.buffer.length);