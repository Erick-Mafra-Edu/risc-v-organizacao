import { Instruction, Register } from "./instructionsType";
import { R_Instruction } from "./instructions/R_Instruction";
import { I_Instruction } from "./instructions/I_Instruction";
import { S_Instruction } from "./instructions/S_Instruction";
import { B_Instruction } from "./instructions/B_Instruction";
import { U_Instruction } from "./instructions/U_Instruction";
import { J_Instruction } from "./instructions/J_Instruction";

export class RISCVSimulator {
    private registers: Int32Array = new Int32Array(32);
    private pc: number = 0;
    private memory: Map<number, number> = new Map();
    private instructions: Instruction[] = [];
    private executionLog: string[] = [];

    constructor(instructions: Instruction[]) {
        this.instructions = instructions;
    }

    private getRegisterValue(reg: Register): number {
        return this.registers[reg.index];
    }

    private setRegisterValue(reg: Register, value: number) {
        if (reg.index !== 0) {
            this.registers[reg.index] = value;
        }
    }

    private signExtend(bin: string, bits: number): number {
        const val = parseInt(bin, 2);
        const shift = 32 - bits;
        return (val << shift) >> shift;
    }

    public step(): boolean {
        if (this.pc / 4 >= this.instructions.length) return false;

        const instruction = this.instructions[this.pc / 4];
        const currentPC = this.pc;
        let nextPC = this.pc + 4;
        let logMsg = `[PC: 0x${currentPC.toString(16).padStart(4, '0')}] ${instruction.formatedString().padEnd(25)}`;

        if (instruction instanceof R_Instruction) {
            const v1 = this.getRegisterValue(instruction.rs1);
            const v2 = this.getRegisterValue(instruction.rs2);
            let res = 0;
            switch (instruction.getMnemonic()) {
                case "add": res = v1 + v2; break;
                case "sub": res = v1 - v2; break;
                case "sll": res = v1 << (v2 & 0x1F); break;
                case "slt": res = v1 < v2 ? 1 : 0; break;
                case "sltu": res = (v1 >>> 0) < (v2 >>> 0) ? 1 : 0; break;
                case "xor": res = v1 ^ v2; break;
                case "srl": res = v1 >>> (v2 & 0x1F); break;
                case "sra": res = v1 >> (v2 & 0x1F); break;
                case "or":  res = v1 | v2; break;
                case "and": res = v1 & v2; break;
            }
            this.setRegisterValue(instruction.rd, res);
            logMsg += ` | ${instruction.rd.ABIName} = ${res}`;
        } 
        else if (instruction instanceof I_Instruction) {
            const v1 = this.getRegisterValue(instruction.rs1);
            const imm = this.signExtend(instruction.imm, 12);
            let res = 0;
            const mnemonic = instruction.getMnemonic();

            if (mnemonic === "jalr") {
                res = currentPC + 4;
                nextPC = (v1 + imm) & ~1;
                this.setRegisterValue(instruction.rd, res);
            } else if (mnemonic.startsWith("l")) { // Loads
                const addr = v1 + imm;
                const memVal = this.memory.get(addr) || 0;
                // Simplified load logic
                res = memVal;
                this.setRegisterValue(instruction.rd, res);
                logMsg += ` | Load from [0x${addr.toString(16)}] = ${res}`;
            } else { // Arithmetic
                switch (mnemonic) {
                    case "addi": res = v1 + imm; break;
                    case "slti": res = v1 < imm ? 1 : 0; break;
                    case "sltiu": res = (v1 >>> 0) < (imm >>> 0) ? 1 : 0; break;
                    case "xori": res = v1 ^ imm; break;
                    case "ori":  res = v1 | imm; break;
                    case "andi": res = v1 & imm; break;
                    case "slli": res = v1 << (imm & 0x1F); break;
                    case "srli": res = v1 >>> (imm & 0x1F); break;
                    case "srai": res = v1 >> (imm & 0x1F); break;
                }
                this.setRegisterValue(instruction.rd, res);
                logMsg += ` | ${instruction.rd.ABIName} = ${res}`;
            }
        }
        else if (instruction instanceof S_Instruction) {
            const v1 = this.getRegisterValue(instruction.rs1);
            const v2 = this.getRegisterValue(instruction.rs2);
            const imm = this.signExtend(instruction.imm, 12);
            const addr = v1 + imm;
            this.memory.set(addr, v2);
            logMsg += ` | Store ${v2} to [0x${addr.toString(16)}]`;
        }
        else if (instruction instanceof B_Instruction) {
            const v1 = this.getRegisterValue(instruction.rs1);
            const v2 = this.getRegisterValue(instruction.rs2);
            const imm = this.signExtend(instruction.imm, 13);
            let take = false;
            switch (instruction.getMnemonic()) {
                case "beq":  take = (v1 === v2); break;
                case "bne":  take = (v1 !== v2); break;
                case "blt":  take = (v1 < v2); break;
                case "bge":  take = (v1 >= v2); break;
                case "bltu": take = ((v1 >>> 0) < (v2 >>> 0)); break;
                case "bgeu": take = ((v1 >>> 0) >= (v2 >>> 0)); break;
            }
            if (take) {
                nextPC = currentPC + imm;
                logMsg += ` | Branch Taken to 0x${nextPC.toString(16)}`;
            } else {
                logMsg += ` | Branch Not Taken`;
            }
        }
        else if (instruction instanceof U_Instruction) {
            const imm = parseInt(instruction.imm, 2) << 12;
            let res = 0;
            if (instruction.getMnemonic() === "lui") {
                res = imm;
            } else { // auipc
                res = currentPC + imm;
            }
            this.setRegisterValue(instruction.rd, res);
            logMsg += ` | ${instruction.rd.ABIName} = 0x${res.toString(16)}`;
        }
        else if (instruction instanceof J_Instruction) {
            const imm = this.signExtend(instruction.imm, 21);
            this.setRegisterValue(instruction.rd, currentPC + 4);
            nextPC = currentPC + imm;
            logMsg += ` | Jump to 0x${nextPC.toString(16)}`;
        }

        this.executionLog.push(logMsg);
        this.pc = nextPC;
        return true;
    }

    public run() {
        while (this.step()) {
            if (this.executionLog.length > 1000) break; // Safety break
        }
    }

    public printState() {
        console.log("\n" + "╔═══════════════════════════════════════════════════════════════╗");
        console.log("║                RISC-V SIMULATION COMPLETE                     ║");
        console.log("╚═══════════════════════════════════════════════════════════════╝");
        
        console.log("\n--- Execution Trace ---");
        this.executionLog.forEach(line => console.log(line));

        console.log("\n--- Final Register State ---");
        let regLine = "";
        for (let i = 0; i < 32; i++) {
            const reg = new Register(i.toString(2).padStart(5, '0'));
            const val = this.registers[i].toString().padStart(4, ' ');
            regLine += `${reg.ABIName.padEnd(4)}: ${val}  `;
            if ((i + 1) % 4 === 0) {
                console.log(regLine);
                regLine = "";
            }
        }

        if (this.memory.size > 0) {
            console.log("\n--- Memory State ---");
            this.memory.forEach((val, addr) => {
                console.log(`[0x${addr.toString(16).padStart(4, '0')}]: ${val}`);
            });
        }
        console.log("\n" + "=".repeat(65) + "\n");
    }
}
