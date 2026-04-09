import * as fs from "fs";
import * as path from "path";
import { InstructionDetector } from "./instructionDetector";
import { R_Instruction } from "./instructions/R_Instruction";
import { I_Instruction } from "./instructions/I_Instruction";

describe("RISC-V Execution Simulator from input.txt", () => {
    let registers: Int32Array;

    beforeAll(() => {
        registers = new Int32Array(32);
    });

    const toSigned = (bin: string): number => {
        const len = bin.length;
        const val = parseInt(bin, 2);
        return (val << (32 - len)) >> (32 - len);
    };

    test("Deve processar todas as instruções do input.txt sequencialmente", () => {
        const inputPath = path.resolve(__dirname, "../input.txt");
        const content = fs.readFileSync(inputPath, "utf-8");
        // Remove \r para evitar problemas de impressao no terminal e filtra linhas vazias
        const lines = content.replace(/\r/g, "").trim().split("\n").filter(line => line.trim());

        lines.forEach((hex, index) => {
            const trimmedHex = hex.trim();
            const detector = new InstructionDetector(trimmedHex);
            const ins = InstructionDetector.detectInstruction((detector as any).InstructionBinary);

            if (ins instanceof I_Instruction) {
                const rd = parseInt(ins.rd, 2);
                const rs1 = parseInt(ins.rs1, 2);
                const imm = toSigned(ins.imm);
                
                const oldVal = registers[rs1];
                if (rd !== 0) registers[rd] = registers[rs1] + imm;
                
                console.log(`[${index + 1}] I-Type (${trimmedHex}): x${rd} = x${rs1}(${oldVal}) + ${imm} => Resultado: ${registers[rd]}`);
            } 
            else if (ins instanceof R_Instruction) {
                const rd = parseInt((ins as any).rd, 2);
                const rs1 = parseInt((ins as any).rs1, 2);
                const rs2 = parseInt((ins as any).rs2, 2);
                
                const val1 = registers[rs1];
                const val2 = registers[rs2];
                if (rd !== 0) registers[rd] = val1 + val2;
                
                console.log(`[${index + 1}] R-Type (${trimmedHex}): x${rd} = x${rs1}(${val1}) + x${rs2}(${val2}) => Resultado: ${registers[rd]}`);
            } else {
                console.log(`[${index + 1}] Outro (${trimmedHex}): Tipo detectado, mas simulação não implementada neste teste.`);
            }
        });

        console.log("\n--- Estado Final dos Registradores Alterados ---");
        registers.forEach((val, i) => {
            if (val !== 0) console.log(`x${i}: ${val}`);
        });
    });
});
