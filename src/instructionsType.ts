
enum InstructionOpcode {
    R_Type= "0110011",
    /**
     * imediato de load
     */
    IL_Type  = "0000011",
    /**
     * imediato JALR 
     */
    JALR_Type = "1100111",
    /**
     * IAL == Aritmética/Lógica
     */
    IAL_Type = "0010011",
    S_Type = "0100011",
    B_Type = "1100011",
    ULUI_Type = "0110111",
    UAUIPC_Type = "0010111",
    J_Type = "1101111",
    SYSTEM_Type = "1110011"
};

abstract class Instruction{
    protected opcode:InstructionOpcode | null;
    public abstract formatedString():string;
    constructor(opcode: InstructionOpcode | string) {
        // Verifica se o opcode é uma string e tenta convertê-lo para um valor válido do enum
        if (typeof opcode === 'string') {
            const enumValue = Object.values(InstructionOpcode).find(value => value === opcode);
            if (!enumValue) {
                throw new Error("Opcode Invalid");
            }
            this.opcode = enumValue as InstructionOpcode;
        } else {
            // Se for um InstructionOpcode, atribui diretamente
            this.opcode = opcode;
        }
    }
}

export default InstructionOpcode;
export {InstructionOpcode,Instruction};