/** Word-addressed data memory for the RISC-V simulator. */
export class Memory {
    private data: Map<number, number>;

    constructor() {
        this.data = new Map();
    }

    /** Read a 32-bit word from the given byte address. Returns 0 if uninitialized. */
    read(address: number): number {
        return this.data.get(address) ?? 0;
    }

    /** Write a 32-bit signed word to the given byte address. */
    write(address: number, value: number): void {
        this.data.set(address, value | 0);
    }

    /** Return a copy of all stored (address, value) pairs. */
    getAll(): Map<number, number> {
        return new Map(this.data);
    }

    /** Clear all stored data. */
    reset(): void {
        this.data.clear();
    }
}
