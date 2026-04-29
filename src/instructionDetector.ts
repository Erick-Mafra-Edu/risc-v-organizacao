import { InstructionOpcode, Instruction } from "./instructionsType";
import * as Instructions from "./instructions/";

class InstructionDetector {
    instructionHexadecimal: string;
    InstructionBinary: string;

    constructor(instructionString: string) {
        // Valida se a entrada veio em hexadecimal (8 chars) ou binario (32 chars).
        if (instructionString.length === 8) {
            // Converte hexadecimal para binario.
            const binaryValue = parseInt(instructionString, 16).toString(2).padStart(32, "0");
            this.instructionHexadecimal = instructionString;
            this.InstructionBinary = binaryValue;
        } else if (instructionString.length === 32) {
            // Converte binario para hexadecimal.
            this.InstructionBinary = instructionString;
            this.instructionHexadecimal = parseInt(instructionString, 2).toString(16).padStart(8, "0");
        } else {
            throw new Error("Formato de instrucao invalido. Deve ser 8 caracteres em hex ou 32 caracteres em binario");
        }
    }

    public detectInstruction(inputInstructionString?: string): Instruction {
        // Extrai o opcode dos bits 0-6 (padrao RISC-V).
        // se for nulo pega o this.InstructionBinary
        let instructionString = inputInstructionString || this.InstructionBinary;
        const opcode = instructionString.slice(25, 32);

        switch (opcode) {
            case InstructionOpcode.R_Type:
                return new Instructions.R_Instruction(
                    opcode,
                    instructionString.slice(20, 25), // rd
                    instructionString.slice(17, 20), // funct3
                    instructionString.slice(12, 17), // rs1
                    instructionString.slice(7, 12),  // rs2
                    instructionString.slice(0, 7)    // funct7
                );

            case InstructionOpcode.IAL_Type:
            case InstructionOpcode.IL_Type:
            case InstructionOpcode.JALR_Type:
                return new Instructions.I_Instruction(
                    opcode,
                    instructionString.slice(20, 25), // rd
                    instructionString.slice(17, 20), // funct3
                    instructionString.slice(12, 17), // rs1
                    instructionString.slice(0, 12)   // imm[11:0]
                );

            case InstructionOpcode.S_Type:
                return new Instructions.S_Instruction(
                    opcode,
                    instructionString.slice(17, 20), // funct3
                    instructionString.slice(12, 17), // rs1
                    instructionString.slice(7, 12),  // rs2
                    instructionString.slice(20, 25), // imm[4:0]
                    instructionString.slice(0, 7)    // imm[11:5]
                );

            case InstructionOpcode.B_Type:
                const bImm12 = instructionString[0];
                const bImm11 = instructionString[24];
                const bImm10_5 = instructionString.slice(1, 7);
                const bImm4_1 = instructionString.slice(20, 24);
                const fullBImm = bImm12 + bImm11 + bImm10_5 + bImm4_1;

                return new Instructions.B_Instruction(
                    opcode,
                    fullBImm,
                    instructionString.slice(17, 20), // funct3
                    instructionString.slice(12, 17), // rs1
                    instructionString.slice(7, 12)   // rs2
                );

            case InstructionOpcode.UAUIPC_Type:
            case InstructionOpcode.ULUI_Type:
                return new Instructions.U_Instruction(
                    opcode,
                    instructionString.slice(20, 25), // rd
                    instructionString.slice(0, 20)   // imm[31:12]
                );

            case InstructionOpcode.J_Type:
                const jImm20 = instructionString[0];
                const jImm19_12 = instructionString.slice(12, 20);
                const jImm11 = instructionString[11];
                const jImm10_1 = instructionString.slice(1, 11);
                const fullJImm = jImm20 + jImm19_12 + jImm11 + jImm10_1;

                return new Instructions.J_Instruction(
                    opcode,
                    instructionString.slice(20, 25), // rd
                    fullJImm // imm[20|10:1|11|19:12]
                );

            case InstructionOpcode.SYSTEM_Type:
                return new Instructions.SYSTEM_Instruction(
                    opcode,
                    instructionString.slice(20, 25), // rd
                    instructionString.slice(17, 20), // funct3
                    instructionString.slice(12, 17), // rs1
                    instructionString.slice(0, 12)   // imm[11:0]
                );

            default:
                throw new Error("Opcode nao reconhecido");
        }
    }
}

export default InstructionDetector;
export { InstructionDetector };
