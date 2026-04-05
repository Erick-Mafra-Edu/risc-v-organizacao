import {InstructionOpcode,Instruction} from "./instructionsType"
import * as Instructions from "./instructions/"


class InstructionDetector{
    instructionHexadecimal:string;
    InstructionBinary:string;
    constructor(instructionString:string){
        // Test if input is hexadecimal (8 characters) or binary (32 characters)
        if(instructionString.length === 8){
            // Convert hex to binary
            const binaryValue = parseInt(instructionString, 16).toString(2).padStart(32, "0");
            this.instructionHexadecimal = instructionString;
            this.InstructionBinary = binaryValue;
        } else if(instructionString.length === 32){
            // Convert binary to hex
            this.InstructionBinary = instructionString;
            this.instructionHexadecimal = parseInt(instructionString, 2).toString(16).padStart(8, "0");
        } else {
            throw new Error("Invalid instruction format. Must be 8-char hex or 32-char binary");
        }
        
    }
    public static detectInstruction(instructionString:string): Instruction{
        // Extract opcode from bits 0-6 (RISC-V standard)
        const opcode = instructionString.slice(25, 32);
        switch(opcode){
            case InstructionOpcode.R_Type:
                return new Instructions.R_Instruction(
                    opcode,
                    instructionString.slice(20, 25),  // rd
                    instructionString.slice(17, 20),  // funct3
                    instructionString.slice(12, 17),  // rs1
                    instructionString.slice(7, 12),   // rs2
                    instructionString.slice(0, 7)     // funct7
                );
            case InstructionOpcode.IAL_Type:
            case InstructionOpcode.IL_Type:
            case InstructionOpcode.JALR_Type:
                return new Instructions.I_Instruction(
                    opcode,
                    instructionString.slice(20, 25),  // rd
                    instructionString.slice(17, 20),  // funct3
                    instructionString.slice(12, 17),  // rs1
                    instructionString.slice(0, 12)    // imm[11:0]
                );
            case InstructionOpcode.S_Type:
                return new Instructions.S_Instruction(
                    opcode,
                    instructionString.slice(17, 20),  // funct3
                    instructionString.slice(12, 17),  // rs1
                    instructionString.slice(7, 12),   // rs2
                    instructionString.slice(0, 7),    // imm[11:5]
                    instructionString.slice(25, 32)   // imm[4:0]
                );
            case InstructionOpcode.B_Type:
                return new Instructions.B_Instruction(
                    opcode,
                    instructionString.slice(8, 12),   // imm[4:1]
                    instructionString.slice(25, 31),  // imm[10:5]
                    instructionString.slice(12, 15),  // funct3
                    instructionString.slice(15, 20),  // rs1
                    instructionString.slice(20, 25)   // rs2
                );
            case InstructionOpcode.UAUIPC_Type:
            case InstructionOpcode.ULUI_Type:
                return new Instructions.U_Instruction(
                    opcode,
                    instructionString.slice(20, 25),  // rd
                    instructionString.slice(0, 20)    // imm[31:12]
                );
            case InstructionOpcode.J_Type:
                return new Instructions.J_Instruction(
                    opcode,
                    instructionString.slice(20, 25),  // rd
                    instructionString.slice(0, 20)    // imm[20|10:1|11|19:12]
                );
            default:
                throw new Error("Opcode not recognized");
        }
}
}
export default InstructionDetector;
export {InstructionDetector};