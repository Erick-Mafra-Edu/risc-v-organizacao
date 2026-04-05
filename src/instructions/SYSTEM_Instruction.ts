import { Instruction, InstructionOpcode } from "../instructionsType";

class SYSTEM_Instruction extends Instruction {
    private funct3: string;
    private rs1: string;
    private rd: string;
    private imm: string;

    public formatedString(): string {
        return `Instruction of Type SYSTEM with funct3: ${this.funct3}, rs1: ${this.rs1}, rd: ${this.rd}, imm: ${this.imm}`;
    }

    constructor(
        opcode: InstructionOpcode | string,
        rd: string,
        funct3: string,
        rs1: string,
        imm: string
    ) {
        super(opcode);
        if (this.getOpcode() !== InstructionOpcode.SYSTEM_Type) {
            throw new Error("Opcode must be SYSTEM_Type for SYSTEM_Instruction");
        }
        this.rd = rd;
        this.funct3 = funct3;
        this.rs1 = rs1;
        this.imm = imm;
    }

    public getOpcode(): InstructionOpcode {
        return (this as any).opcode;
    }
}

export default SYSTEM_Instruction;
export { SYSTEM_Instruction };
