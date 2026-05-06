/** 32-register RISC-V register bank. x0 is hardwired to 0. */
export class RegisterBank {
    private regs: number[];

    constructor() {
        this.regs = new Array(32).fill(0);
    }

    /** Read register at index. Always returns 0 for x0. */
    read(index: number): number {
        if (index === 0) return 0;
        return this.regs[index] ?? 0;
    }

    /** Write a 32-bit signed value to register. Writes to x0 are silently ignored. */
    write(index: number, value: number): void {
        if (index !== 0 && index >= 1 && index <= 31) {
            this.regs[index] = value | 0; // keep as 32-bit signed integer
        }
    }

    /** Return a copy of all 32 register values. */
    getAll(): number[] {
        return [...this.regs];
    }

    /** Reset all registers to 0. */
    reset(): void {
        this.regs = new Array(32).fill(0);
    }
}
