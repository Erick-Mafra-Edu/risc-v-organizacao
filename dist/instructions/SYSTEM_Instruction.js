"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_Instruction = void 0;
const instructionsType_1 = require("../instructionsType");
class SYSTEM_Instruction extends instructionsType_1.Instruction {
    formatedString() {
        return `Instruction of Type SYSTEM with funct3: ${this.funct3}, rs1: ${this.rs1}, rd: ${this.rd}, imm: ${this.imm}`;
    }
    constructor(opcode, rd, funct3, rs1, imm) {
        super(opcode);
        if (this.getOpcode() !== instructionsType_1.InstructionOpcode.SYSTEM_Type) {
            throw new Error("Opcode must be SYSTEM_Type for SYSTEM_Instruction");
        }
        this.rd = rd;
        this.funct3 = funct3;
        this.rs1 = rs1;
        this.imm = imm;
    }
    getOpcode() {
        return this.opcode;
    }
}
exports.SYSTEM_Instruction = SYSTEM_Instruction;
exports.default = SYSTEM_Instruction;
//# sourceMappingURL=SYSTEM_Instruction.js.map