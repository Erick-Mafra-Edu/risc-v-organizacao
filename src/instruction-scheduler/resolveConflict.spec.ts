/**
 * Testes para ResolveConflict: verifica que NOPs são inseridos corretamente
 * antes das instruções com hazard conforme os stalls calculados pelo detector.
 *
 * NOP canônico RISC-V: addi x0, x0, 0  (escrita em x0 não tem efeito)
 */

import { InstructionDetector } from "../instructionDetector";
import { Instruction } from "../instructionsType";
import { conflictsDetectorPipelineClassico, forwardConflicts } from "./conflictsDetector";
import { ResolveConflict } from "./resolveConflict";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseHex(hex: string): Instruction {
  return new InstructionDetector(hex).detectInstruction();
}

function parseAll(hexList: string[]): Instruction[] {
  return hexList.map(parseHex);
}

function isNop(instr: Instruction): boolean {
  const r = instr.reads() ?? [];
  const w = instr.writes() ?? [];
  return (
    r.length === 1 &&
    w.length === 1 &&
    r[0] === "zero" &&
    w[0] === "zero" &&
    instr.formatedString().includes("imm:000000000000")
  );
}

// ---------------------------------------------------------------------------
// Sem conflito
// ---------------------------------------------------------------------------

describe("ResolveConflict – sem conflito", () => {
  test("instruções independentes não recebem NOPs", () => {
    const instructions = parseAll([
      "003100b3", // add x1, x2, x3
      "00628233", // add x4, x5, x6  (independente)
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions, "CLASSIC");
    const resolved = ResolveConflict(conflicts, instructions);

    expect(resolved).toHaveLength(2);
    expect(resolved.every((i) => !isNop(i))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// RAW – modo Classic
// ---------------------------------------------------------------------------

describe("ResolveConflict – RAW Classic", () => {
  test("RAW dist=1 insere 2 NOPs antes da instrução dependente", () => {
    const instructions = parseAll([
      "003100b3", // add x1, x2, x3  (escreve x1)
      "00108233", // add x4, x1, x1  (lê x1, dist=1)
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions, "CLASSIC");
    const resolved = ResolveConflict(conflicts, instructions);

    // 2 instruções originais + 2 NOPs = 4 no total
    expect(resolved).toHaveLength(4);
    expect(isNop(resolved[1])).toBe(true);
    expect(isNop(resolved[2])).toBe(true);
    expect(isNop(resolved[0])).toBe(false); // instrução original[0]
    expect(isNop(resolved[3])).toBe(false); // instrução original[1]
  });

  test("RAW dist=2 insere 1 NOP antes da instrução dependente", () => {
    const instructions = parseAll([
      "003100b3", // add x1, x2, x3
      "00628233", // add x4, x5, x6  (independente)
      "008083b3", // add x7, x1, x8  (lê x1, dist=2)
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions, "CLASSIC");
    const resolved = ResolveConflict(conflicts, instructions);

    // 3 instruções + 1 NOP = 4
    expect(resolved).toHaveLength(4);
    // Ordem: instr[0], instr[1], NOP, instr[2]
    expect(isNop(resolved[2])).toBe(true);
    expect(isNop(resolved[0])).toBe(false);
    expect(isNop(resolved[1])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// LOAD-USE – modo Classic
// ---------------------------------------------------------------------------

describe("ResolveConflict – LOAD-USE Classic", () => {
  test("LOAD-USE dist=1 insere 2 NOPs antes da instrução dependente", () => {
    const instructions = parseAll([
      "00012083", // lw x1, 0(x2)
      "001081b3", // add x3, x1, x1
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions, "CLASSIC");
    const resolved = ResolveConflict(conflicts, instructions);

    expect(resolved).toHaveLength(4);
    expect(isNop(resolved[1])).toBe(true);
    expect(isNop(resolved[2])).toBe(true);
  });

  test("LOAD-USE dist=2 insere 1 NOP antes da instrução dependente", () => {
    const instructions = parseAll([
      "00012083", // lw x1, 0(x2)
      "00628233", // add x4, x5, x6  (independente)
      "002081b3", // add x3, x1, x2
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions, "CLASSIC");
    const resolved = ResolveConflict(conflicts, instructions);

    expect(resolved).toHaveLength(4);
    // Ordem: original[0], original[1], NOP, original[2]
    expect(isNop(resolved[2])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// LOAD-USE – modo Forwarding
// ---------------------------------------------------------------------------

describe("ResolveConflict – LOAD-USE Forwarding", () => {
  test("LOAD-USE dist=1 com forwarding insere 1 NOP", () => {
    const instructions = parseAll([
      "00012083", // lw x1, 0(x2)
      "001081b3", // add x3, x1, x1
    ]);
    let conflicts = conflictsDetectorPipelineClassico(instructions, "FORWARDING");
    conflicts = forwardConflicts(conflicts);
    const resolved = ResolveConflict(conflicts, instructions);

    // 2 instruções + 1 NOP = 3
    expect(resolved).toHaveLength(3);
    expect(isNop(resolved[1])).toBe(true);
  });

  test("LOAD-USE dist=2 com forwarding não insere NOPs", () => {
    const instructions = parseAll([
      "00012083", // lw x1, 0(x2)
      "00628233", // independente
      "002081b3", // add x3, x1, x2
    ]);
    let conflicts = conflictsDetectorPipelineClassico(instructions, "FORWARDING");
    conflicts = forwardConflicts(conflicts);
    const resolved = ResolveConflict(conflicts, instructions);

    expect(resolved).toHaveLength(3);
    expect(resolved.every((i) => !isNop(i))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// CONTROL – desvios
// ---------------------------------------------------------------------------

describe("ResolveConflict – CONTROL", () => {
  test("instrução de desvio insere 2 NOPs antes dela", () => {
    const instructions = parseAll([
      "003100b3", // add x1, x2, x3
      "00a50263", // beq a0, a0, 4 → CONTROL
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions, "CLASSIC");
    const resolved = ResolveConflict(conflicts, instructions);

    // 2 originais + 2 NOPs = 4
    expect(resolved).toHaveLength(4);
    expect(isNop(resolved[1])).toBe(true);
    expect(isNop(resolved[2])).toBe(true);
    expect(isNop(resolved[3])).toBe(false); // beq original
  });
});
