import { formatDisplayInDecimal } from "./process-file";

describe("process-file formatting", () => {
    test("should keep register and funct fields unsigned while sign-extending imm", () => {
        const formattedInstruction = "Instruction of Type I with rd:11111 and funct3:111 and rs1:11111 and imm:111111111111";

        expect(formatDisplayInDecimal(formattedInstruction)).toBe(
            "Instruction of Type I with rd:31 and funct3:7 and rs1:31 and imm:-1"
        );
    });

    test("should keep positive immediate values positive", () => {
        const formattedInstruction = "Instruction of Type B with funct3:000 and rs1:01010 and rs2:01010 and imm:0000000000100";

        expect(formatDisplayInDecimal(formattedInstruction)).toBe(
            "Instruction of Type B with funct3:0 and rs1:10 and rs2:10 and imm:4"
        );
    });
});
