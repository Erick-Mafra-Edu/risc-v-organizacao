import { Instruction, InstructionOpcode, Register } from "../instructionsType";
class R_Instruction extends Instruction {
    public rd: Register;
    public funct3:string;
    public rs1: Register;
    public rs2: Register;
    public funct7:string;

    public getMnemonic(): string {
        if (this.funct7 === "0000000") {
            switch (this.funct3) {
                case "000": return "add";
                case "001": return "sll";
                case "010": return "slt";
                case "011": return "sltu";
                case "100": return "xor";
                case "101": return "srl";
                case "110": return "or";
                case "111": return "and";
            }
        } else if (this.funct7 === "0100000") {
            switch (this.funct3) {
                case "000": return "sub";
                case "101": return "sra";
            }
        }
        return `r_type_${this.funct7}_${this.funct3}`;
    }

    public formatedString(): string {
       return `${this.getMnemonic()} ${this.rd.ABIName}, ${this.rs1.ABIName}, ${this.rs2.ABIName}`;
    }

    constructor(
        opcode:InstructionOpcode | string,
        rd:string,
        funct3:string,
        rs1:string,
        rs2:string,
        funct7:string
    ){
        super(opcode);
        if(this.opcode !== InstructionOpcode.R_Type){
            throw new Error("Opcode Invalid for R-Type Instruction");
        }
        this.rd = new Register(rd);
        this.funct3 = funct3;
        this.rs1 = new Register(rs1);
        this.rs2 = new Register(rs2);
        this.funct7 = funct7;

    }
    /**
     * R-Type instructions typically read from rs1 and rs2
     * @returns rs1 and rs2 as the registers read by R-Type instructions
     */
    public reads(): string[] | null {
        return [this.rs1.ABIName, this.rs2.ABIName];
    }
    /**
     * R-Type instructions typically write to rd
     * @returns rd as the register written by R-Type instructions
     */
    public writes(): string[] | null {
        return [this.rd.ABIName];
    }
}

export default R_Instruction;
export {R_Instruction};