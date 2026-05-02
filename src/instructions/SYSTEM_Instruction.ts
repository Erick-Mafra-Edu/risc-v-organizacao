import { Instruction, InstructionOpcode, Register } from "../instructionsType";

class SYSTEM_Instruction extends Instruction {
    private funct3: string;
    private rs1: Register;
    private rd: Register;
    private imm: string;

    public formatedString(): string {
        return `Instruction of Type SYSTEM with funct3: ${this.funct3}, rs1: ${this.rs1.ABIName}, rd: ${this.rd.ABIName}, imm: ${this.imm}`;
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
        this.rd = new Register(rd);
        this.funct3 = funct3;
        this.rs1 = new Register(rs1);
        this.imm = imm;
    }

    public getOpcode(): InstructionOpcode {
        return (this as any).opcode;
    }
    /**
     * SYSTEM instructions typically read from rs1
     * @returns rs1 as the register read by SYSTEM instructions
     */
    public reads(): string[] | null {
        return [this.rs1.ABIName]; 
    }
    /**
     * SYSTEM instructions typically write to rd
     * @returns rd as the register written by SYSTEM instructions
     */
    public writes(): string[] | null {
        return [this.rd.ABIName]; 
    }
}

export default SYSTEM_Instruction;
export { SYSTEM_Instruction };
