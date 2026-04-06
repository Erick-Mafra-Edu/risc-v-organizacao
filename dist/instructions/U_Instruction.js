"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.U_Instruction = void 0;
const instructionsType_1 = require("../instructionsType");
class U_Instruction extends instructionsType_1.Instruction {
    formatedString() {
        return `Instruction of Type U with rd:${this.rd} and imm:${this.imm}`;
    }
    constructor(opcode, rd, imm) {
        super(opcode);
        if (this.opcode !== instructionsType_1.InstructionOpcode.ULUI_Type && this.opcode !== instructionsType_1.InstructionOpcode.UAUIPC_Type) {
            throw new Error("Opcode Invalid for U-Type Instruction");
        }
        this.rd = rd;
        this.imm = imm;
    }
}
exports.U_Instruction = U_Instruction;
exports.default = U_Instruction;
//# sourceMappingURL=U_Instruction.js.map