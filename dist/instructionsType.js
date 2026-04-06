"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Instruction = exports.InstructionOpcode = void 0;
var InstructionOpcode;
(function (InstructionOpcode) {
    InstructionOpcode["R_Type"] = "0110011";
    /**
     * imediato de load
     */
    InstructionOpcode["IL_Type"] = "0000011";
    /**
     * imediato JALR
     */
    InstructionOpcode["JALR_Type"] = "1100111";
    /**
     * IAL == Aritmética/Lógica
     */
    InstructionOpcode["IAL_Type"] = "0010011";
    InstructionOpcode["S_Type"] = "0100011";
    InstructionOpcode["B_Type"] = "1100011";
    InstructionOpcode["ULUI_Type"] = "0110111";
    InstructionOpcode["UAUIPC_Type"] = "0010111";
    InstructionOpcode["J_Type"] = "1101111";
    InstructionOpcode["SYSTEM_Type"] = "1110011";
})(InstructionOpcode || (exports.InstructionOpcode = InstructionOpcode = {}));
;
class Instruction {
    constructor(opcode) {
        // Verifica se o opcode é uma string e tenta convertê-lo para um valor válido do enum
        if (typeof opcode === 'string') {
            const enumValue = Object.values(InstructionOpcode).find(value => value === opcode);
            if (!enumValue) {
                throw new Error("Opcode Invalid");
            }
            this.opcode = enumValue;
        }
        else {
            // Se for um InstructionOpcode, atribui diretamente
            this.opcode = opcode;
        }
    }
}
exports.Instruction = Instruction;
exports.default = InstructionOpcode;
//# sourceMappingURL=instructionsType.js.map