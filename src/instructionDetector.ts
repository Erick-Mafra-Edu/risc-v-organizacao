import {InstructionOpcode,Instruction} from "./instructionsType"
import * as Instructions from "./instructions/"


class IntructionDetector{
    instructionHexadecimal:string;
    InstructionBinary:string;
    constructor(instructionString:string){
        // testar se veio hexadecimal e converter para binário
        if(parseInt(instructionString,16)){
            instructionString = parseInt(instructionString,16).toString(2).padStart(32,"0");
        }else{
            // convertendo binario para hexadecimal
            this.instructionHexadecimal = parseInt(instructionString,2).toString(16).padStart(8,"0");
        }
        this.instructionHexadecimal = instructionString;
        this.InstructionBinary = instructionString;
        
    }
    public static detectInstruction(instructionString:string): Instruction{
        const opcode = instructionString.slice(25,32);
        switch(opcode){
            case InstructionOpcode.R_Type:
                return new Instructions.R_Instruction(
                    opcode,
                    instructionString.slice(20,25),
                    instructionString.slice(17,20),
                    instructionString.slice(12,17),
                    instructionString.slice(7,12),
                    instructionString.slice(0,7)
                );
            case ((InstructionOpcode.IAL_Type) || (InstructionOpcode.IL_Type) || (InstructionOpcode.JALR_Type)):
                return new Instructions.I_Instruction(
                    opcode,
                    instructionString.slice(20,25),
                    instructionString.slice(17,20),
                    instructionString.slice(12,17),
                    instructionString.slice(0,12)
                );
            case InstructionOpcode.S_Type:
                return new Instructions.S_Instruction(
                    opcode,
                    instructionString.slice(17,20),
                    instructionString.slice(12,17),
                    instructionString.slice(7,12),
                    instructionString.slice(0,7),
                    instructionString.slice(25,32)
                );
            case InstructionOpcode.B_Type:
                return new Instructions.B_Instruction(
                    opcode,
                    instructionString.slice(17,20),
                    instructionString.slice(12,17),
                    instructionString.slice(7,12),
                    instructionString.slice(0,7)
                );
            case ((InstructionOpcode.UAUIPC_Type) || (InstructionOpcode.ULUI_Type)):
                return new Instructions.U_Instruction(
                    opcode,
                    instructionString.slice(20,25),
                    instructionString.slice(0,20)
                );
            case InstructionOpcode.J_Type:
                return new Instructions.J_Instruction(
                    opcode,
                    instructionString.slice(20,25),
                    instructionString.slice(0,20)
                );
            default:
                throw new Error("Opcode not recognized");
        }

}
}
export default IntructionDetector;
export {IntructionDetector};