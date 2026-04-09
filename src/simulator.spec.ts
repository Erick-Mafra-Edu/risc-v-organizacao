import * as fs from "fs";
import * as path from "path";
import { InstructionDetector } from "./instructionDetector";
import { R_Instruction } from "./instructions/R_Instruction";
import { I_Instruction } from "./instructions/I_Instruction";
import { B_Instruction } from "./instructions/B_Instruction";
import { J_Instruction } from "./instructions/J_Instruction";
import { S_Instruction } from "./instructions/S_Instruction";
import { SYSTEM_Instruction } from "./instructions/SYSTEM_Instruction";
import { U_Instruction } from "./instructions/U_Instruction";

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
        const typeCounter = {
            I: 0,
            R: 0,
            S: 0,
            B: 0,
            J: 0,
            U: 0,
            SYSTEM: 0
        };

        lines.forEach((hex, index) => {
            const trimmedHex = hex.trim();
            const detector = new InstructionDetector(trimmedHex);
            const ins = InstructionDetector.detectInstruction((detector as any).InstructionBinary);

            if (ins instanceof I_Instruction) {
                typeCounter.I++;
                const rd = parseInt(ins.rd, 2);
                const rs1 = parseInt(ins.rs1, 2);
                const imm = toSigned(ins.imm);
                
                const oldVal = registers[rs1];
                if (rd !== 0) registers[rd] = registers[rs1] + imm;
                
                console.log(`[${index + 1}] I-Type (${trimmedHex}): x${rd} = x${rs1}(${oldVal}) + ${imm} => Resultado: ${registers[rd]}`);
            } 
            else if (ins instanceof R_Instruction) {
                typeCounter.R++;
                const rd = parseInt((ins as any).rd, 2);
                const rs1 = parseInt((ins as any).rs1, 2);
                const rs2 = parseInt((ins as any).rs2, 2);
                
                const val1 = registers[rs1];
                const val2 = registers[rs2];
                if (rd !== 0) registers[rd] = val1 + val2;
                
                console.log(`[${index + 1}] R-Type (${trimmedHex}): x${rd} = x${rs1}(${val1}) + x${rs2}(${val2}) => Resultado: ${registers[rd]}`);
            } else if (ins instanceof S_Instruction) {
                typeCounter.S++;
                console.log(`[${index + 1}] S-Type (${trimmedHex}): Instrucao reconhecida.`);
            } else if (ins instanceof B_Instruction) {
                typeCounter.B++;
                console.log(`[${index + 1}] B-Type (${trimmedHex}): Instrucao reconhecida.`);
            } else if (ins instanceof J_Instruction) {
                typeCounter.J++;
                console.log(`[${index + 1}] J-Type (${trimmedHex}): Instrucao reconhecida.`);
            } else if (ins instanceof U_Instruction) {
                typeCounter.U++;
                console.log(`[${index + 1}] U-Type (${trimmedHex}): Instrucao reconhecida.`);
            } else if (ins instanceof SYSTEM_Instruction) {
                typeCounter.SYSTEM++;
                console.log(`[${index + 1}] SYSTEM-Type (${trimmedHex}): Instrucao reconhecida.`);
            } else {
                console.log(`[${index + 1}] Outro (${trimmedHex}): Tipo detectado, mas simulação não implementada neste teste.`);
            }
        });

        console.log("\n--- Estado Final dos Registradores Alterados ---");
        registers.forEach((val, i) => {
            if (val !== 0) console.log(`x${i}: ${val}`);
        });

        expect(typeCounter).toEqual({
            I: 4,
            R: 1,
            S: 1,
            B: 1,
            J: 1,
            U: 1,
            SYSTEM: 1
        });
        expect(registers[5]).toBe(0);
        expect(registers[6]).toBe(0);
        expect(registers[7]).toBe(5);
        expect(registers[10]).toBe(5);
        expect(registers[17]).toBe(10);
    });
});
