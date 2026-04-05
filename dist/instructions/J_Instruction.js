"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.J_Instruction = void 0;
const instructionsType_1 = require("../instructionsType");
class J_Instruction extends instructionsType_1.Instruction {
    formatedString() {
        return `Instruction of Type J with rd:${this.rd} and imm:${this.imm}`;
    }
    constructor(opcode, rd, imm) {
        super(opcode);
        if (this.opcode !== instructionsType_1.InstructionOpcode.J_Type) {
            throw new Error("Opcode Invalid for J-Type Instruction");
        }
        this.rd = rd;
        this.imm = imm;
    }
}
exports.J_Instruction = J_Instruction;
exports.default = J_Instruction;
//# sourceMappingURL=J_Instruction.js.map