# Project Instructions: RISC-V Organization

This project is a RISC-V (RV32I) instruction analyzer, scheduler, and simulator built with TypeScript and Node.js. It allows users to parse hex/binary instructions, detect pipeline hazards (RAW, Load, Control), resolve them by inserting NOPs, and simulate the execution of the original code.

## 🏗️ Project Architecture

- **`src/instructions/`**: Contains classes for each RISC-V instruction type (R, I, S, B, U, J, SYSTEM). Each class handles decoding its specific fields and providing assembly-like mnemonics.
- **`src/instructionDetector.ts`**: The main parser that converts hexadecimal or binary strings into instruction class instances.
- **`src/instruction-scheduler/`**: 
    - `conflictsDetector.ts`: Logic for identifying RAW, LOAD, and CONTROL hazards in both "Classic" (no forwarding) and "Forwarding" modes.
    - `resolveConflict.ts`: Logic for inserting NOP instructions to stall the pipeline and resolve detected hazards.
- **`src/simulator.ts`**: A functional simulator that supports two modes:
    - `NAIVE`: Instant register writes (functional correctness).
    - `PIPELINE`: Delayed register writes (2 cycles) to demonstrate RAW hazards and the necessity of NOPs for architectural correctness.
    - Includes an execution trace, final register state table, and memory dump.
- **`src/server.ts`**: An Express.js server providing a web-based interface and API for instruction analysis and conflict detection.

## 🚀 Building and Running

### Prerequisites
- Node.js (v14+)
- npm

### Key Commands

- **Build Project**:
  ```bash
  npm run build
  ```
- **Run Simulator (CLI)**:
  ```bash
  node dist/main.js [input_file.txt]
  ```
  *(Defaults to `input.txt` if no file is provided)*
- **Run Web Server**:
  ```bash
  npm run server
  ```
  *(Starts on http://localhost:3000)*
- **Run Tests**:
  ```bash
  npm test
  ```
- **Process File (Formatted Report)**:
  ```bash
  npm run process -- [input_file.txt]
  ```

## 🛠️ Development Conventions

- **Instruction Classes**: All new instruction types should extend the base `Instruction` class in `src/instructionsType.ts` and implement `getMnemonic()`, `formatedString()`, `reads()`, and `writes()`.
- **Register Access**: Use the `Register` class for handling RISC-V registers. Register indices and ABI names are managed here.
- **Conflict Detection**: When adding new hazard detection logic, ensure it supports both `CLASSIC` and `FORWARDING` modes in `src/instruction-scheduler/conflictsDetector.ts`.
- **Simulation**: The simulator in `src/simulator.ts` uses an `Int32Array` for registers and a `Map` for memory. Ensure new instruction logic updates these states correctly.

## 📝 Current Status & Roadmap

- ✅ Full RV32I instruction parsing and decoding.
- ✅ Pipeline hazard detection (RAW, Load, Control).
- ✅ NOP-based hazard resolution.
- ✅ Functional simulator with visual trace.
- ✅ Web interface for visualization.
- ❌ **Pending**: Recalculation of Branch/Jump target addresses after NOP insertion.
- ❌ **Pending**: Integration of WAW and WAR hazard detection into the main scheduler loop.