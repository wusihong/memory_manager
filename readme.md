*** Instructions *** 

npm install 

run tests with: 
mocha test.js

*** Memory Manager Class *** 
Buffer Description 
- For readability and simplicity, represented the buffer as an array. 
- To mimic a 64 bit system, each index of the array represented a memory address of 8 bytes

Notes
- Javascript doesn't have pointers, so I *tried* to be explicit in the variable naming re: when I was returning the value stored at a memory address vs. the memory address itself (represented by the buffer arr index). 
- Note: For the time being, most of my validation was focused on looking at whether malloc and free calls resulted into the expected changes to the buffer array itself. 

*** Memory Block  *** 

| next | isFree | blockSize | actualMemoryBlock | 

- For each malloc call, meta data precedes actual memory block 
- Next pointer (int): a reference to the index in the buffer of the next memory block
- isFree flag (bool): whether block is free or alloated
- blockSize (int): specifies the number of 8 byte memory addresses following the meta data
- actualMemoryBlock(int): zeros as placeholders for the memory block itself

*** Malloc *** 

Algorithim
1. First malloc call will initialize the first free memory block starting at index 0 in the buffer, with the size equaling the entire buffer size (minus the meta data). Head and tail point to the index. 
2. On each malloc call, search list for a block that is large enough for the requested size + metadata.
3. If large enough block not found, "request" additional chunk from OS i.e. increase the size of the array (min increase of 24 memory addresses to reduce constant requests to OS) 
4. Split off a large enough chunk of current memory block for current size request. Leftover is split off as a free block. Tail points to this free block. 
5. return value (success): pointer (index) of start of specific memory block. return value (failure): null

Example: 

let memory = new MemoryManager(160);
// [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]

memory.alloc(32); 
// [ 0, true, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]  
^^initialize first memory block at point head/tail to index 0

// [ 7, false, 4, 0, 0, 0, 0, null, true, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]

memory.alloc(16);
// [ 7, false, 4, 0, 0, 0, 0, 12, false, 2, 0, 0, null, true, 5, 0, 0, 0, 0, 0 ]

*** Free *** 

Pretty barebones at the moment. 

1. take in the pointer reference to the memory block to be freed. Because the pointer references the start of the actual memory block, need to shift it backwards by 3 indexes to get to the start of the meta data. 
2. toggle the isFree flag to true. 
3. no return value 

*** Possible Optimizations *** 

the current implementation is a single linked list connecting each memory block (free and allocated combined). One of the benefits is it is contiguous...so free calls don't require any changing of pointers. Because it is contiguous it also seems easier to build the ability for free() calls to checks forward and backwards and combine free memory blocks. However, this approach also takes a hit in run time complexity because we have to iterate through the entire list of all memory blocks (rather than on the freed blocks or the allocated blocks)

I also chose to store the metadata as part of memory block right before the returned pointer of the malloc call. Another approach I considered was creating a hash map to store meta data, which could make lookups of metadata a bit more readable and straightforward, although would take more memory. 

1. Current algorithim has no prevention of two or more threads concurrently accessing the same memory space. Need to consider a basic locking mechanism. 
2. On free() calls, considering checking to see if adjacent blocks to the freed memory block can be combined into a large freed memory block. Also expand to doubly link list, could look backwards and forwards. 
3. How to optimize the malloc() call for common request sizes
4. Consider two linked lists, one for freed memory blocks, and the other for allocated memory blocks, in order to reduce runtime complexity. Although would need to figure out how to keep track of data to knw when freed memory blocks are contiguous. 
5. Improve error messaging and graceful error handling, there are definitely some basic holes here, not to mention other more serious edge cases yet to be factored in. For example, guard for if you are writing data past the end of your allocated block. 
6. Building in the capability to detect memory leaks 
7. Mechanism for returning freed blocks back to OS
8. Needs refactoring to make the memoryManager base class extendable to multiple sublasses with different memory management strategies
...and probably much more!



