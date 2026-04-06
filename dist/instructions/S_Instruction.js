"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S_Instruction = void 0;
const instructionsType_1 = require("../instructionsType");
class S_Instruction extends instructionsType_1.Instruction {
    formatedString() {
        return `Instruction of Type S with funct3:${this.funct3} and rs1:${this.rs1} and rs2:${this.rs2} and imm:${this.imm}`;
    }
    constructor(opcode, funct3, rs1, rs2, imm_4_0, imm_11_5) {
        super(opcode);
        if (this.opcode !== instructionsType_1.InstructionOpcode.S_Type) {
            throw new Error("Opcode Invalid for S-Type Instruction");
        }
        this.funct3 = funct3;
        this.rs1 = rs1;
        this.rs2 = rs2;
        this.imm = imm_11_5 + imm_4_0;
    }
}
exports.S_Instruction = S_Instruction;
exports.default = S_Instruction;
//# sourceMappingURL=S_Instruction.js.map