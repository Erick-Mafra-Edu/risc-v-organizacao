/** Execution mode of the pipeline simulator. */
export type ExecutionMode = "NO_STALL" | "STALL" | "NOP";

/** A fully decoded RISC-V instruction with all fields extracted. */
export interface DecodedInstruction {
    /** Original hex string (lower-case, 8 chars). */
    hex: string;
    /** 32-bit binary string. */
    binary: string;
    /** 7-bit opcode binary string. */
    opcode: string;
    /** Destination register index (0-31). */
    rdIdx: number;
    /** Source register 1 index (0-31). */
    rs1Idx: number;
    /** Source register 2 index (0-31). */
    rs2Idx: number;
    /** 3-bit funct3 field. */
    funct3: string;
    /** 7-bit funct7 field. */
    funct7: string;
    /** Sign-extended immediate value. */
    imm: number;
    /** Human-readable mnemonic, e.g. "ADDI", "ADD", "BEQ". */
    mnemonic: string;
    /** True when this is the canonical NOP (addi x0, x0, 0). */
    isNop: boolean;
    /** High-level instruction category. */
    type: "ALU" | "LOAD" | "STORE" | "BRANCH" | "JUMP" | "SYSTEM" | "OTHER";
}

/** A single entry travelling through the 5-stage pipeline. */
export interface PipelineEntry {
    decoded: DecodedInstruction;
    /** Byte address of this instruction. */
    pc: number;
    /** Value of rs1 read during ID stage. */
    rs1Val: number;
    /** Value of rs2 read during ID stage. */
    rs2Val: number;
    /** ALU result computed in EX stage. */
    aluResult: number;
    /** Data read from memory in MEM stage (LOAD only). */
    memResult: number;
    /** True when a branch/jump was resolved as taken. */
    branchTaken: boolean;
    /** Resolved branch target byte address. */
    branchTarget: number;
    /** True if this entry is a pipeline bubble (stall-inserted). */
    isBubble: boolean;
}

/** Snapshot of all 5 pipeline stages at a single cycle. */
export interface PipelineState {
    IF: PipelineEntry | null;
    ID: PipelineEntry | null;
    EX: PipelineEntry | null;
    MEM: PipelineEntry | null;
    WB: PipelineEntry | null;
}

/** Record of a single hazard event during simulation. */
export interface HazardRecord {
    /** Cycle number in which the hazard was detected. */
    cycle: number;
    /** Hazard classification. */
    type: "RAW" | "LOAD" | "CONTROL";
    /** Hex of the instruction that caused the hazard. */
    instructionHex: string;
    /** What the pipeline did about this hazard. */
    action: "IGNORED" | "STALLED" | "FLUSHED";
}

/** Per-cycle snapshot used for the cycle-by-cycle display. */
export interface CycleSnapshot {
    cycle: number;
    IF: string | null;
    ID: string | null;
    EX: string | null;
    MEM: string | null;
    WB: string | null;
    stalled: boolean;
}

/** Full result returned by PipelineSimulator.simulate(). */
export interface SimulationResult {
    /** Final value of each of the 32 registers. */
    registers: number[];
    /** Final data-memory contents. */
    memory: Map<number, number>;
    /** Total number of clock cycles executed. */
    cycles: number;
    /** Data-hazard stall cycles inserted (STALL mode). */
    stallCycles: number;
    /** NOP instructions inserted (NOP mode). */
    nopsInserted: number;
    /** All hazard events detected during simulation. */
    hazardsDetected: HazardRecord[];
    /** Per-cycle pipeline stage log. */
    cycleLog: CycleSnapshot[];
    /** Number of instructions in the original (pre-NOP) program. */
    instructionCount: number;
    /**
     * Performance overhead:
     *   - NOP mode  → nopsInserted
     *   - STALL mode → stallCycles
     *   - NO_STALL  → 0
     */
    overhead: number;
}
