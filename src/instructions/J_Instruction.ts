import { Instruction, InstructionOpcode, Register } from "../instructionsType";
class J_Instruction extends Instruction {
    public rd: Register;
    public imm:string;

    public getMnemonic(): string {
        return "jal";
    }

    private getImmediateValue(): number {
        const val = parseInt(this.imm, 2);
        if (this.imm[0] === '1') { // 21-bit sign extension
            return val - Math.pow(2, 21);
        }
        return val;
    }

    public formatedString(): string {
        const mnemonic = this.getMnemonic();
        const immVal = this.getImmediateValue();
        return `${mnemonic} ${this.rd.ABIName}, ${immVal}`;
    }
    constructor(
        opcode:string,
        rd:string,
        imm:string
    ){
        super(opcode);
        if(this.opcode !== InstructionOpcode.J_Type){
            throw new Error("Opcode Invalid for J-Type Instruction");
        }
        this.rd = new Register(rd);
        this.imm = imm + "0";
    }
    /**
     * J-Type instructions typically do not read from registers
     * @returns null as J-Type instructions do not read from any registers
     */
    public reads(): string[] | null {
        return null;
    }
    /**
     * J-Type instructions typically write to rd
     * @returns rd as the register written by J-Type instructions
     */
    public writes(): string[] | null {
        return [this.rd.ABIName];
    }
}
export default J_Instruction;
export {J_Instruction};