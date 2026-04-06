"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B_Instruction = void 0;
const instructionsType_1 = require("../instructionsType");
class B_Instruction extends instructionsType_1.Instruction {
    formatedString() {
        return `Instruction of Type B with funct3:${this.funct3} and rs1:${this.rs1} and rs2:${this.rs2} and imm:${this.imm}`;
    }
    constructor(opcode, imm_4_1, imm_10_5, funct3, rs1, rs2) {
        super(opcode);
        if (this.opcode !== instructionsType_1.InstructionOpcode.B_Type) {
            throw new Error("Opcode Invalid for B-Type Instruction");
        }
        this.funct3 = funct3;
        this.rs1 = rs1;
        this.rs2 = rs2;
        this.imm = imm_10_5 + imm_4_1 + "0";
    }
}
exports.B_Instruction = B_Instruction;
exports.default = B_Instruction;
//# sourceMappingURL=B_Instruction.js.map