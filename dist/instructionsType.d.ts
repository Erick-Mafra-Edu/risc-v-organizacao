declare enum InstructionOpcode {
    R_Type = "0110011",
    /**
     * imediato de load
     */
    IL_Type = "0000011",
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
}
declare abstract class Instruction {
    protected opcode: InstructionOpcode | null;
    abstract formatedString(): string;
    constructor(opcode: InstructionOpcode | string);
}
export default InstructionOpcode;
export { InstructionOpcode, Instruction };
//# sourceMappingURL=instructionsType.d.ts.map