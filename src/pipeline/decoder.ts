import { InstructionDetector } from "../instructionDetector";
import { DecodedInstruction } from "./types";

export const NOP_HEX = "00000013"; // addi x0, x0, 0

function signExtend(value: number, bits: number): number {
    const shift = 32 - bits;
    return (value << shift) >> shift;
}

function getInstructionType(opcode: string): DecodedInstruction["type"] {
    switch (opcode) {
        case "0110011": return "ALU";   // R-type
        case "0010011": return "ALU";   // I-type ALU
        case "0000011": return "LOAD";
        case "0100011": return "STORE";
        case "1100011": return "BRANCH";
        case "1101111": return "JUMP";  // JAL
        case "1100111": return "JUMP";  // JALR
        case "1110011": return "SYSTEM";
        default: return "OTHER";
    }
}

function getMnemonic(opcode: string, funct3: string, funct7: string): string {
    switch (opcode) {
        case "0110011":
            if (funct3 === "000") return funct7 === "0100000" ? "SUB" : "ADD";
            if (funct3 === "001") return "SLL";
            if (funct3 === "010") return "SLT";
            if (funct3 === "011") return "SLTU";
            if (funct3 === "100") return "XOR";
            if (funct3 === "101") return funct7 === "0100000" ? "SRA" : "SRL";
            if (funct3 === "110") return "OR";
            if (funct3 === "111") return "AND";
            return "R?";

        case "0010011":
            if (funct3 === "000") return "ADDI";
            if (funct3 === "001") return "SLLI";
            if (funct3 === "010") return "SLTI";
            if (funct3 === "011") return "SLTIU";
            if (funct3 === "100") return "XORI";
            if (funct3 === "101") return funct7 === "0100000" ? "SRAI" : "SRLI";
            if (funct3 === "110") return "ORI";
            if (funct3 === "111") return "ANDI";
            return "I?";

        case "0000011":
            if (funct3 === "000") return "LB";
            if (funct3 === "001") return "LH";
            if (funct3 === "010") return "LW";
            if (funct3 === "100") return "LBU";
            if (funct3 === "101") return "LHU";
            return "LOAD?";

        case "0100011":
            if (funct3 === "000") return "SB";
            if (funct3 === "001") return "SH";
            if (funct3 === "010") return "SW";
            return "STORE?";

        case "1100011":
            if (funct3 === "000") return "BEQ";
            if (funct3 === "001") return "BNE";
            if (funct3 === "100") return "BLT";
            if (funct3 === "101") return "BGE";
            if (funct3 === "110") return "BLTU";
            if (funct3 === "111") return "BGEU";
            return "B?";

        case "1101111": return "JAL";
        case "1100111": return "JALR";
        case "0110111": return "LUI";
        case "0010111": return "AUIPC";
        case "1110011": return "ECALL";
        default: return "?";
    }
}

function computeImmediate(binary: string, opcode: string): number {
    switch (opcode) {
        // I-type: imm[11:0] at bits[31:20]
        case "0010011":
        case "0000011":
        case "1100111":
            return signExtend(parseInt(binary.slice(0, 12), 2), 12);

        // S-type: imm[11:5] at bits[31:25], imm[4:0] at bits[11:7]
        case "0100011": {
            const immHigh = binary.slice(0, 7);
            const immLow = binary.slice(20, 25);
            return signExtend(parseInt(immHigh + immLow, 2), 12);
        }

        // B-type: imm[12|10:5] at bits[31:25], imm[4:1|11] at bits[11:7]
        case "1100011": {
            const b12 = binary[0];
            const b11 = binary[24];
            const b10_5 = binary.slice(1, 7);
            const b4_1 = binary.slice(20, 24);
            return signExtend(parseInt(b12 + b11 + b10_5 + b4_1 + "0", 2), 13);
        }

        // U-type: imm[31:12] at bits[31:12]
        case "0110111":
        case "0010111":
            return parseInt(binary.slice(0, 20), 2) << 12;

        // J-type: imm[20|10:1|11|19:12] scattered
        case "1101111": {
            const j20 = binary[0];
            const j19_12 = binary.slice(12, 20);
            const j11 = binary[11];
            const j10_1 = binary.slice(1, 11);
            return signExtend(parseInt(j20 + j19_12 + j11 + j10_1 + "0", 2), 21);
        }

        default:
            return 0;
    }
}

/**
 * Decode a RISC-V instruction from its hex (or binary) representation.
 * Accepts 8-character hex strings (the only format used in this simulator).
 */
export function decodeInstruction(hex: string): DecodedInstruction {
    const normalizedHex = hex.toLowerCase().padStart(8, "0");
    const detector = new InstructionDetector(normalizedHex);
    const binary = detector.InstructionBinary;

    const opcode  = binary.slice(25, 32);
    const rdIdx   = parseInt(binary.slice(20, 25), 2);
    const funct3  = binary.slice(17, 20);
    const rs1Idx  = parseInt(binary.slice(12, 17), 2);
    const rs2Idx  = parseInt(binary.slice(7, 12), 2);
    const funct7  = binary.slice(0, 7);

    const imm      = computeImmediate(binary, opcode);
    const mnemonic = getMnemonic(opcode, funct3, funct7);
    const type     = getInstructionType(opcode);
    const isNop    = normalizedHex === NOP_HEX;

    return { hex: normalizedHex, binary, opcode, rdIdx, rs1Idx, rs2Idx, funct3, funct7, imm, mnemonic, isNop, type };
}
