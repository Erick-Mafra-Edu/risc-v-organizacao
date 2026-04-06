"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.R_Instruction = void 0;
const instructionsType_1 = require("../instructionsType");
class R_Instruction extends instructionsType_1.Instruction {
    formatedString() {
        return `Instruction of Type R with rd:${this.rd} and funct3:${this.funct3} and rs1:${this.rs1} and rs2:${this.rs2} and funct7:${this.funct7}`;
    }
    constructor(opcode, rd, funct3, rs1, rs2, funct7) {
        super(opcode);
        if (this.opcode !== instructionsType_1.InstructionOpcode.R_Type) {
            throw new Error("Opcode Invalid for R-Type Instruction");
        }
        this.rd = rd;
        this.funct3 = funct3;
        this.rs1 = rs1;
        this.rs2 = rs2;
        this.funct7 = funct7;
    }
}
exports.R_Instruction = R_Instruction;
exports.default = R_Instruction;
//# sourceMappingURL=R_Instruction.js.map