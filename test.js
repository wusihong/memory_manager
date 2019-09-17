const MemoryManager = require('./index.js').MemoryManager;
const assert = require('assert');

function malloc_tests() {
  describe('malloc_tests', () => {
      describe('get_expected_values', () => {
          const memory1 = new MemoryManager(160);
          it('should return correct pointer on valid malloc call', () => {
              assert.equal(memory1.alloc(16),
                           3);
          });

          it('should set correct next', () => {
            assert.equal(memory1.buffer[0],
                         5);
          });

          it('should set correct isFree flag', () => {
            assert.equal(memory1.buffer[1],
                         false);
          });

          it('should set correct blockSize', () => {
            assert.equal(memory1.buffer[2],
                         2);
          });

          it('should return correct pointer on multiple malloc calls', () => {
            assert.equal(memory1.alloc(16),
                         8);
          });

          it('should return null when malloc call is 0', () => {
            assert.equal(memory1.alloc(0),
                         null);
          });
      });

      describe('available_memory_less_than_requested_size', () => {
          const memory2 = new MemoryManager(160); 

          it('should request additional chunk and expand heap', () => {
              memory2.alloc(200); 
              assert.equal(memory2.buffer.length,
                          44);
          });
    });
  });
}

function free_tests() {
  describe('malloc_tests', () => {
    describe('get_expected_values', () => {
        const memory3 = new MemoryManager(160);
        it('should toggle isFree flag to true', () => {
            let pointer = memory3.alloc(16)
            memory3.free(pointer)
            assert.equal(memory3.buffer[1],
                         true);
        });
    });
});

}

malloc_tests();
free_tests();
