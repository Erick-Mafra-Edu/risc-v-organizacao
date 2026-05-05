/**
 * Testes para o detector de hazards de pipeline RISC-V (5 estágios: IF ID EX MEM WB).
 *
 * Convenções usadas:
 *   dist=1  → instrução produtora imediatamente antes da consumidora
 *   dist=2  → instrução produtora duas posições antes da consumidora
 *
 * Stalls esperados sem forwarding (Classic):
 *   RAW dist=1   → 2 stalls
 *   RAW dist=2   → 1 stall
 *   LOAD dist=1  → 2 stalls
 *   LOAD dist=2  → 1 stall
 *   CONTROL      → 2 stalls
 *
 * Stalls esperados com forwarding:
 *   RAW  qualquer distância → 0 stalls (NeedsStall=false)
 *   LOAD dist=1 → 1 stall  (resultado só disponível após MEM)
 *   LOAD dist=2 → 0 stalls (forwarding de WB)
 *   CONTROL     → 2 stalls (forwarding não ajuda desvios)
 */

import { InstructionDetector } from "../instructionDetector";
import { Instruction } from "../instructionsType";
import {
  conflictsDetectorPipelineClassico,
  forwardConflicts,
} from "./conflictsDetector";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseHex(hex: string): Instruction {
  return new InstructionDetector(hex).detectInstruction();
}

function parseAll(hexList: string[]): Instruction[] {
  return hexList.map(parseHex);
}

// Instruções usadas nos testes (verificadas com o decodificador):
//   003100b3  add x1, x2, x3       → escreve x1 (ra)
//   00108233  add x4, x1, x1       → lê x1 → RAW com anterior
//   00628233  add x4, x5, x6       → independente (não usa x1)
//   008083b3  add x7, x1, x8       → lê x1 → RAW a dist=2
//   002081b3  add x3, x1, x2       → lê x1 → RAW a dist=2
//   00012083  lw  x1, 0(x2)        → LOAD que escreve x1
//   001081b3  add x3, x1, x1       → lê x1 → LOAD-USE com anterior
//   00a50263  beq a0, a0, 4        → desvio condicional (CONTROL)
//   00000013  nop / addi x0,x0,0   → não gera hazard (registrador zero)

// ---------------------------------------------------------------------------
// 1. Sem conflitos
// ---------------------------------------------------------------------------

describe("conflictsDetectorPipelineClassico – sem conflitos", () => {
  test("sequência de instruções independentes não deve detectar conflitos", () => {
    const instructions = parseAll([
      "003100b3", // add x1, x2, x3
      "00628233", // add x4, x5, x6  (não usa x1)
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions);
    expect(conflicts).toHaveLength(0);
  });

  test("escrita no registrador zero (x0) não deve gerar conflito", () => {
    const instructions = parseAll([
      "00000013", // nop (addi x0, x0, 0)
      "00000013", // nop
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions);
    expect(conflicts).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Conflitos RAW – modo Classic
// ---------------------------------------------------------------------------

describe("conflictsDetectorPipelineClassico – RAW Classic", () => {
  test("RAW dist=1 deve exigir 2 stalls no modo Classic", () => {
    const instructions = parseAll([
      "003100b3", // add x1, x2, x3  → escreve x1
      "00108233", // add x4, x1, x1  → lê x1 (dist=1)
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions, "CLASSIC");

    expect(conflicts).toHaveLength(1);
    const c = conflicts[0];
    expect(c.Type).toBe("RAW");
    expect(c.Index).toBe(1);
    expect(c.NeedsStall).toBe(true);
    expect(c.StallCycles).toBe(2);
  });

  test("RAW dist=2 deve exigir 1 stall no modo Classic", () => {
    const instructions = parseAll([
      "003100b3", // add x1, x2, x3  → escreve x1
      "00628233", // add x4, x5, x6  → independente
      "008083b3", // add x7, x1, x8  → lê x1 (dist=2)
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions, "CLASSIC");

    expect(conflicts).toHaveLength(1);
    const c = conflicts[0];
    expect(c.Type).toBe("RAW");
    expect(c.Index).toBe(2);
    expect(c.NeedsStall).toBe(true);
    expect(c.StallCycles).toBe(1);
  });

  test("dois RAW consecutivos somam stalls corretamente", () => {
    const instructions = parseAll([
      "003100b3", // add x1, x2, x3  → escreve x1
      "00108233", // add x4, x1, x1  → RAW dist=1 em x1
      "00108233", // add x4, x1, x1  → RAW dist=1 em x1 (e dist=2 em x1)
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions, "CLASSIC");
    const totalStalls = conflicts
      .filter((c) => c.NeedsStall)
      .reduce((s, c) => s + c.StallCycles, 0);

    // índice 1: RAW dist=1 em x1 → 2 stalls
    // índice 2: prev (índice 1) escreve x4 (não x1), prev2 (índice 0) escreve x1 → RAW dist=2 → 1 stall
    expect(totalStalls).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// 3. Conflitos RAW – modo Forwarding
// ---------------------------------------------------------------------------

describe("conflictsDetectorPipelineClassico – RAW Forwarding", () => {
  test("RAW dist=1 com forwarding detectado mas sem stall", () => {
    const instructions = parseAll([
      "003100b3", // add x1, x2, x3
      "00108233", // add x4, x1, x1  → RAW dist=1
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions, "FORWARDING");

    expect(conflicts).toHaveLength(1);
    const c = conflicts[0];
    expect(c.Type).toBe("RAW");
    expect(c.NeedsStall).toBe(false);
    expect(c.StallCycles).toBe(0);
  });

  test("RAW dist=2 com forwarding detectado mas sem stall", () => {
    const instructions = parseAll([
      "003100b3", // add x1, x2, x3
      "00628233", // independente
      "008083b3", // add x7, x1, x8  → RAW dist=2
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions, "FORWARDING");

    expect(conflicts).toHaveLength(1);
    const c = conflicts[0];
    expect(c.NeedsStall).toBe(false);
  });

  test("forwardConflicts remove RAW quando forwarding ativo", () => {
    const instructions = parseAll([
      "003100b3",
      "00108233",
    ]);
    let conflicts = conflictsDetectorPipelineClassico(instructions, "FORWARDING");
    conflicts = forwardConflicts(conflicts);

    // RAW puro resolvido por forwarding → deve sumir do array filtrado
    expect(conflicts).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 4. Hazards LOAD-USE – modo Classic
// ---------------------------------------------------------------------------

describe("conflictsDetectorPipelineClassico – LOAD-USE Classic", () => {
  test("LOAD-USE dist=1 deve exigir 2 stalls no modo Classic", () => {
    const instructions = parseAll([
      "00012083", // lw x1, 0(x2)   → LOAD que escreve x1
      "001081b3", // add x3, x1, x1 → lê x1 (dist=1)
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions, "CLASSIC");

    expect(conflicts).toHaveLength(1);
    const c = conflicts[0];
    expect(c.Type).toBe("LOAD");
    expect(c.NeedsStall).toBe(true);
    expect(c.StallCycles).toBe(2);
  });

  test("LOAD-USE dist=2 deve exigir 1 stall no modo Classic", () => {
    const instructions = parseAll([
      "00012083", // lw x1, 0(x2)
      "00628233", // add x4, x5, x6  → independente
      "002081b3", // add x3, x1, x2  → lê x1 (dist=2)
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions, "CLASSIC");

    expect(conflicts).toHaveLength(1);
    const c = conflicts[0];
    expect(c.Type).toBe("LOAD");
    expect(c.NeedsStall).toBe(true);
    expect(c.StallCycles).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 5. Hazards LOAD-USE – modo Forwarding
// ---------------------------------------------------------------------------

describe("conflictsDetectorPipelineClassico – LOAD-USE Forwarding", () => {
  test("LOAD-USE dist=1 com forwarding deve exigir 1 stall", () => {
    const instructions = parseAll([
      "00012083", // lw x1, 0(x2)
      "001081b3", // add x3, x1, x1
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions, "FORWARDING");

    expect(conflicts).toHaveLength(1);
    const c = conflicts[0];
    expect(c.Type).toBe("LOAD");
    expect(c.NeedsStall).toBe(true);
    expect(c.StallCycles).toBe(1);
  });

  test("LOAD-USE dist=2 com forwarding não deve gerar stall", () => {
    const instructions = parseAll([
      "00012083", // lw x1, 0(x2)
      "00628233", // independente
      "002081b3", // add x3, x1, x2
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions, "FORWARDING");

    expect(conflicts).toHaveLength(1);
    const c = conflicts[0];
    expect(c.Type).toBe("LOAD");
    expect(c.NeedsStall).toBe(false);
    expect(c.StallCycles).toBe(0);
  });

  test("forwardConflicts mantém LOAD-USE dist=1 pois ainda exige stall", () => {
    const instructions = parseAll([
      "00012083",
      "001081b3",
    ]);
    let conflicts = conflictsDetectorPipelineClassico(instructions, "FORWARDING");
    conflicts = forwardConflicts(conflicts);

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].NeedsStall).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. Hazards de controle (branch / jump)
// ---------------------------------------------------------------------------

describe("conflictsDetectorPipelineClassico – CONTROL", () => {
  test("instrução de desvio deve gerar conflito CONTROL com 2 stalls", () => {
    const instructions = parseAll([
      "003100b3", // add x1, x2, x3
      "00a50263", // beq a0, a0, 4 → CONTROL
    ]);
    const conflicts = conflictsDetectorPipelineClassico(instructions, "CLASSIC");

    const controlConflicts = conflicts.filter((c) => c.Type === "CONTROL");
    expect(controlConflicts).toHaveLength(1);
    expect(controlConflicts[0].NeedsStall).toBe(true);
    expect(controlConflicts[0].StallCycles).toBe(2);
  });

  test("CONTROL persiste após forwardConflicts (forwarding não resolve desvios)", () => {
    const instructions = parseAll([
      "003100b3",
      "00a50263",
    ]);
    let conflicts = conflictsDetectorPipelineClassico(instructions, "FORWARDING");
    conflicts = forwardConflicts(conflicts);

    const controlConflicts = conflicts.filter((c) => c.Type === "CONTROL");
    expect(controlConflicts).toHaveLength(1);
    expect(controlConflicts[0].StallCycles).toBe(2);
  });
});
