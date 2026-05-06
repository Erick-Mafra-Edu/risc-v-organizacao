import {
    ExecutionMode,
    DecodedInstruction,
    PipelineEntry,
    PipelineState,
    HazardRecord,
    CycleSnapshot,
    SimulationResult,
} from "./types";
import { decodeInstruction, NOP_HEX } from "./decoder";
import { RegisterBank } from "./registers";
import { Memory } from "./memory";

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function createEntry(decoded: DecodedInstruction, pc: number): PipelineEntry {
    return {
        decoded, pc,
        rs1Val: 0, rs2Val: 0,
        aluResult: 0, memResult: 0,
        branchTaken: false, branchTarget: 0,
        isBubble: false,
    };
}

function createBubble(pc = 0): PipelineEntry {
    return {
        decoded: decodeInstruction(NOP_HEX),
        pc,
        rs1Val: 0, rs2Val: 0,
        aluResult: 0, memResult: 0,
        branchTaken: false, branchTarget: 0,
        isBubble: true,
    };
}

function isPipelineEmpty(s: PipelineState): boolean {
    return !s.IF && !s.ID && !s.EX && !s.MEM && !s.WB;
}

/** Mnemonic label for a stage entry (used in cycleLog). */
function stageLabel(entry: PipelineEntry | null): string | null {
    if (!entry) return null;
    if (entry.isBubble) return "---";
    return entry.decoded.mnemonic;
}

/**
 * Return the destination register index for an instruction that writes a
 * register, or -1 if the instruction does not write.
 */
function getWriteRegister(d: DecodedInstruction): number {
    switch (d.type) {
        case "ALU":
        case "LOAD":
        case "JUMP":
            return d.rdIdx;   // may be 0 (x0) — caller must check > 0
        default:
            return -1;
    }
}

/** Register indices read by an instruction (filtering x0, index 0). */
function getReadRegisters(d: DecodedInstruction): number[] {
    if (d.isNop) return [];
    switch (d.type) {
        case "ALU":
            // R-type reads rs1 and rs2; I-type ALU only reads rs1
            if (d.opcode === "0110011") return [d.rs1Idx, d.rs2Idx];
            return [d.rs1Idx];
        case "LOAD":
            return [d.rs1Idx];
        case "STORE":
        case "BRANCH":
            return [d.rs1Idx, d.rs2Idx];
        case "JUMP":
            if (d.opcode === "1100111") return [d.rs1Idx]; // JALR reads rs1
            return [];  // JAL does not read any register
        default:
            return [];
    }
}

/**
 * Detect whether the instruction in ID has a RAW data hazard with the
 * instructions currently in EX or MEM.
 *
 * In our cycle model, WB has already written its result before ID reads
 * (same-cycle forwarding in the register file), so distance-3 hazards do
 * not need a stall.
 */
function detectDataHazard(
    idEntry: PipelineEntry | null,
    exEntry: PipelineEntry | null,
    memEntry: PipelineEntry | null,
): { hazard: boolean; type: "RAW" | "LOAD" } {
    if (!idEntry || idEntry.isBubble) return { hazard: false, type: "RAW" };

    const reads = getReadRegisters(idEntry.decoded).filter(r => r !== 0);
    if (reads.length === 0) return { hazard: false, type: "RAW" };

    // Check instruction in EX
    if (exEntry && !exEntry.isBubble) {
        const exWrite = getWriteRegister(exEntry.decoded);
        if (exWrite > 0 && reads.includes(exWrite)) {
            return {
                hazard: true,
                type: exEntry.decoded.type === "LOAD" ? "LOAD" : "RAW",
            };
        }
    }

    // Check instruction in MEM
    if (memEntry && !memEntry.isBubble) {
        const memWrite = getWriteRegister(memEntry.decoded);
        if (memWrite > 0 && reads.includes(memWrite)) {
            return {
                hazard: true,
                type: memEntry.decoded.type === "LOAD" ? "LOAD" : "RAW",
            };
        }
    }

    return { hazard: false, type: "RAW" };
}

/** Execute the ALU operation for an instruction and return the result. */
function executeALU(d: DecodedInstruction, rs1: number, rs2: number): number {
    switch (d.mnemonic) {
        case "ADD":   return (rs1 + rs2) | 0;
        case "SUB":   return (rs1 - rs2) | 0;
        case "AND":   return rs1 & rs2;
        case "OR":    return rs1 | rs2;
        case "XOR":   return rs1 ^ rs2;
        case "SLL":   return rs1 << (rs2 & 0x1f);
        case "SRL":   return rs1 >>> (rs2 & 0x1f);
        case "SRA":   return rs1 >> (rs2 & 0x1f);
        case "SLT":   return rs1 < rs2 ? 1 : 0;
        case "SLTU":  return (rs1 >>> 0) < (rs2 >>> 0) ? 1 : 0;
        case "ADDI":  return (rs1 + d.imm) | 0;
        case "ANDI":  return rs1 & d.imm;
        case "ORI":   return rs1 | d.imm;
        case "XORI":  return rs1 ^ d.imm;
        case "SLLI":  return rs1 << (d.imm & 0x1f);
        case "SRLI":  return rs1 >>> (d.imm & 0x1f);
        case "SRAI":  return rs1 >> (d.imm & 0x1f);
        case "SLTI":  return rs1 < d.imm ? 1 : 0;
        case "SLTIU": return (rs1 >>> 0) < (d.imm >>> 0) ? 1 : 0;
        case "LUI":   return d.imm;
        case "AUIPC": return 0; // simplified (PC not tracked here)
        default:      return 0;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public simulator class
// ─────────────────────────────────────────────────────────────────────────────

export class PipelineSimulator {
    private registers: RegisterBank;
    private memory: Memory;
    private mode: ExecutionMode;

    constructor(mode: ExecutionMode) {
        this.mode = mode;
        this.registers = new RegisterBank();
        this.memory = new Memory();
    }

    getRegisters(): RegisterBank { return this.registers; }
    getMemory(): Memory { return this.memory; }

    /**
     * Simulate the execution of a list of hex-encoded RISC-V instructions.
     * Resets registers and memory before each run.
     */
    simulate(hexInstructions: string[]): SimulationResult {
        this.registers.reset();
        this.memory.reset();

        let instructions = hexInstructions.map(h => decodeInstruction(h));
        let nopsInserted = 0;

        if (this.mode === "NOP") {
            const { expanded, origToNew } = this.insertNOPs(instructions);
            this.recalculateBranchOffsets(instructions, expanded, origToNew);
            instructions = expanded;
            nopsInserted = instructions.filter(d => d.isNop).length;
        }

        return this.runPipeline(instructions, hexInstructions.length, nopsInserted);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // NOP pre-processing
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Insert NOP instructions before any instruction that has a RAW hazard
     * with a recently-written register.  Uses "pipeline distance" logic:
     *   distance 1 → 2 NOPs needed
     *   distance 2 → 1 NOP needed
     *   distance ≥ 3 → no NOP needed
     *
     * Returns the expanded instruction array together with a mapping from
     * each original instruction index to its new index in the expanded array.
     * This mapping is used by recalculateBranchOffsets.
     */
    private insertNOPs(decoded: DecodedInstruction[]): {
        expanded: DecodedInstruction[];
        origToNew: number[];
    } {
        const result: DecodedInstruction[] = [];
        const origToNew: number[] = [];
        const nopTemplate = decodeInstruction(NOP_HEX);

        for (const [origIdx, current] of decoded.entries()) {
            const n = result.length;

            // Find the last two real (non-NOP) instructions already in result
            let lastRealIdx = -1;
            let secondLastRealIdx = -1;
            for (let j = n - 1; j >= 0 && secondLastRealIdx === -1; j--) {
                if (!result[j].isNop) {
                    if (lastRealIdx === -1) lastRealIdx = j;
                    else secondLastRealIdx = j;
                }
            }

            let nopsNeeded = 0;
            const readRegs = getReadRegisters(current).filter(r => r !== 0);

            if (readRegs.length > 0) {
                if (lastRealIdx !== -1) {
                    const dist = n - lastRealIdx;  // pipeline distance
                    const wr = getWriteRegister(result[lastRealIdx]);
                    if (wr > 0 && readRegs.includes(wr)) {
                        nopsNeeded = Math.max(nopsNeeded, Math.max(0, 3 - dist));
                    }
                }
                if (secondLastRealIdx !== -1) {
                    const dist = n - secondLastRealIdx;
                    const wr = getWriteRegister(result[secondLastRealIdx]);
                    if (wr > 0 && readRegs.includes(wr)) {
                        nopsNeeded = Math.max(nopsNeeded, Math.max(0, 3 - dist));
                    }
                }
            }

            for (let k = 0; k < nopsNeeded; k++) {
                result.push({ ...nopTemplate });
            }
            origToNew[origIdx] = result.length;
            result.push(current);
        }

        return { expanded: result, origToNew };
    }

    /**
     * After NOP insertion the instruction memory layout changes.  BRANCH
     * (B-type) and JAL (J-type) instructions encode a PC-relative byte
     * offset, so those offsets must be recalculated to reflect the new
     * positions.  JALR (I-type JUMP) uses a register + immediate target and
     * cannot be recalculated statically — it is left unchanged.
     *
     * @param original  The original decoded instructions (before NOP insertion).
     * @param expanded  The expanded instruction array (after NOP insertion).
     * @param origToNew Mapping: original index → index in the expanded array.
     */
    private recalculateBranchOffsets(
        original: DecodedInstruction[],
        expanded: DecodedInstruction[],
        origToNew: number[],
    ): void {
        for (let origIdx = 0; origIdx < original.length; origIdx++) {
            const instr = original[origIdx];

            // Only B-type (BRANCH) and JAL (J-type JUMP) use PC-relative imm
            if (
                instr.type !== "BRANCH" &&
                !(instr.type === "JUMP" && instr.mnemonic === "JAL")
            ) {
                continue;
            }

            // Compute original target instruction index from the encoded imm
            const origPc         = origIdx * 4;
            const targetByteAddr = origPc + instr.imm;
            const origTargetIdx  = targetByteAddr / 4;

            // Skip if the target falls outside the original program
            if (
                !Number.isInteger(origTargetIdx) ||
                origTargetIdx < 0 ||
                origTargetIdx >= original.length
            ) {
                continue;
            }

            const newInstrIdx  = origToNew[origIdx];
            const newTargetIdx = origToNew[origTargetIdx];
            if (newInstrIdx === undefined || newTargetIdx === undefined) continue;

            // Rewrite the immediate in the expanded array entry
            expanded[newInstrIdx].imm = (newTargetIdx - newInstrIdx) * 4;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Cycle-by-cycle pipeline simulation
    // ─────────────────────────────────────────────────────────────────────────

    private runPipeline(
        instructions: DecodedInstruction[],
        originalCount: number,
        nopsInserted: number,
    ): SimulationResult {
        const pipeline: PipelineState = {
            IF: null, ID: null, EX: null, MEM: null, WB: null,
        };

        const hazards: HazardRecord[] = [];
        const cycleLog: CycleSnapshot[] = [];

        let PC = 0;
        let cycle = 0;
        let stallCycles = 0;

        while (!isPipelineEmpty(pipeline) || PC < instructions.length) {
            cycle++;
            let stalled = false;
            let branchTaken = false;
            let branchTarget = 0;

            // ── Stage WB ────────────────────────────────────────────────────
            // WB runs first so that the register value it writes is visible
            // to the ID stage in the same cycle (register-file forwarding).
            if (pipeline.WB && !pipeline.WB.isBubble) {
                const wb = pipeline.WB;
                const writeReg = getWriteRegister(wb.decoded);
                if (writeReg > 0) {
                    let writeVal: number;
                    if (wb.decoded.type === "LOAD") {
                        writeVal = wb.memResult;
                    } else if (wb.decoded.type === "JUMP") {
                        writeVal = wb.pc + 4;   // return address
                    } else {
                        writeVal = wb.aluResult;
                    }
                    this.registers.write(writeReg, writeVal);
                }
            }

            // ── Stage MEM ───────────────────────────────────────────────────
            if (pipeline.MEM && !pipeline.MEM.isBubble) {
                const mem = pipeline.MEM;
                if (mem.decoded.type === "LOAD") {
                    mem.memResult = this.memory.read(mem.aluResult);
                } else if (mem.decoded.type === "STORE") {
                    this.memory.write(mem.aluResult, mem.rs2Val);
                }
            }

            // ── Stage EX ────────────────────────────────────────────────────
            if (pipeline.EX && !pipeline.EX.isBubble) {
                const ex = pipeline.EX;
                const { decoded, rs1Val, rs2Val } = ex;

                if (decoded.type === "ALU") {
                    ex.aluResult = executeALU(decoded, rs1Val, rs2Val);

                } else if (decoded.type === "LOAD" || decoded.type === "STORE") {
                    // Effective address = rs1 + imm
                    ex.aluResult = (rs1Val + decoded.imm) | 0;

                } else if (decoded.type === "BRANCH") {
                    let taken = false;
                    switch (decoded.mnemonic) {
                        case "BEQ":  taken = rs1Val === rs2Val; break;
                        case "BNE":  taken = rs1Val !== rs2Val; break;
                        case "BLT":  taken = rs1Val < rs2Val; break;
                        case "BGE":  taken = rs1Val >= rs2Val; break;
                        case "BLTU": taken = (rs1Val >>> 0) < (rs2Val >>> 0); break;
                        case "BGEU": taken = (rs1Val >>> 0) >= (rs2Val >>> 0); break;
                    }
                    if (taken) {
                        branchTaken = true;
                        branchTarget = ex.pc + decoded.imm;
                        hazards.push({
                            cycle,
                            type: "CONTROL",
                            instructionHex: decoded.hex,
                            action: "FLUSHED",
                        });
                    }

                } else if (decoded.type === "JUMP") {
                    branchTaken = true;
                    if (decoded.mnemonic === "JALR") {
                        branchTarget = (rs1Val + decoded.imm) & ~1;
                    } else {
                        branchTarget = ex.pc + decoded.imm; // JAL
                    }
                    ex.aluResult = ex.pc + 4; // return address
                    hazards.push({
                        cycle,
                        type: "CONTROL",
                        instructionHex: decoded.hex,
                        action: "FLUSHED",
                    });
                }
            }

            // ── Hazard detection (STALL mode) ────────────────────────────────
            if (this.mode === "STALL" && pipeline.ID && !pipeline.ID.isBubble) {
                const { hazard, type: hazardType } = detectDataHazard(
                    pipeline.ID, pipeline.EX, pipeline.MEM
                );
                if (hazard) {
                    stalled = true;
                    stallCycles++;
                    hazards.push({
                        cycle,
                        type: hazardType,
                        instructionHex: pipeline.ID.decoded.hex,
                        action: "STALLED",
                    });
                }
            }

            // ── Stage ID: read registers (skipped when stalling) ─────────────
            if (!stalled && pipeline.ID && !pipeline.ID.isBubble) {
                const id = pipeline.ID;
                id.rs1Val = this.registers.read(id.decoded.rs1Idx);
                id.rs2Val = this.registers.read(id.decoded.rs2Idx);
            }

            // Log hazards in NO_STALL mode (detected but ignored)
            if (this.mode === "NO_STALL" && pipeline.ID && !pipeline.ID.isBubble) {
                const { hazard, type: hazardType } = detectDataHazard(
                    pipeline.ID, pipeline.EX, pipeline.MEM
                );
                if (hazard) {
                    hazards.push({
                        cycle,
                        type: hazardType,
                        instructionHex: pipeline.ID.decoded.hex,
                        action: "IGNORED",
                    });
                }
            }

            // ── Snapshot ─────────────────────────────────────────────────────
            cycleLog.push({
                cycle,
                IF: stageLabel(pipeline.IF),
                ID: stageLabel(pipeline.ID),
                EX: stageLabel(pipeline.EX),
                MEM: stageLabel(pipeline.MEM),
                WB: stageLabel(pipeline.WB),
                stalled,
            });

            // ── Advance pipeline ─────────────────────────────────────────────
            if (branchTaken) {
                // Flush the two wrong-path instructions in ID and IF, then
                // redirect IF to the branch/jump target.
                pipeline.WB  = pipeline.MEM;
                pipeline.MEM = pipeline.EX;
                pipeline.EX  = createBubble(); // flush ID
                pipeline.ID  = createBubble(); // flush IF
                const targetIdx = Math.floor(branchTarget / 4);
                if (targetIdx >= 0 && targetIdx < instructions.length) {
                    pipeline.IF = createEntry(instructions[targetIdx], branchTarget);
                    PC = targetIdx + 1;
                } else {
                    pipeline.IF = null;
                    PC = instructions.length;
                }

            } else if (stalled) {
                // Freeze IF and ID; insert a bubble into EX
                pipeline.WB  = pipeline.MEM;
                pipeline.MEM = pipeline.EX;
                pipeline.EX  = createBubble(pipeline.ID?.pc ?? 0);
                // pipeline.ID and pipeline.IF are frozen (unchanged)

            } else {
                // Normal advance: each stage moves one step forward
                pipeline.WB  = pipeline.MEM;
                pipeline.MEM = pipeline.EX;
                pipeline.EX  = pipeline.ID;
                pipeline.ID  = pipeline.IF;
                if (PC < instructions.length) {
                    pipeline.IF = createEntry(instructions[PC], PC * 4);
                    PC++;
                } else {
                    pipeline.IF = null;
                }
            }
        }

        const overhead =
            this.mode === "NOP"   ? nopsInserted  :
            this.mode === "STALL" ? stallCycles    :
            0;

        return {
            registers:        this.registers.getAll(),
            memory:           this.memory.getAll(),
            cycles:           cycle,
            stallCycles,
            nopsInserted,
            hazardsDetected:  hazards,
            cycleLog,
            instructionCount: originalCount,
            overhead,
        };
    }
}
