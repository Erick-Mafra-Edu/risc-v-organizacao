import express from "express";
import cors from "cors";
import path from "path";
import * as fs from "fs";
import fileUpload from "express-fileupload";
import { InstructionDetector } from "./instructionDetector";
import { conflictsDetectorPipelineClassico, forwardConflicts } from "./instruction-scheduler/conflictsDetector";
import { Instruction } from "./instructionsType";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "../public")));

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "Server running" });
});

// Read file endpoint (file upload)
app.post("/api/read-file", (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file as fileUpload.UploadedFile;

    try {
        const content = file.data.toString('utf-8');
        res.json({ 
            content, 
            filename: file.name,
            size: file.size 
        });
    } catch (error) {
        res.status(500).json({ error: `Error reading file: ${(error as Error).message}` });
    }
});

// Process instructions endpoint
app.post("/api/process", (req, res) => {
    try {
        const { hexInstructions } = req.body;

        if (!hexInstructions || !Array.isArray(hexInstructions)) {
            return res.status(400).json({ error: "Invalid input: hexInstructions must be an array" });
        }

        const instructions: Instruction[] = [];
        const results = [];

        // Parse each hex instruction
        for (const hex of hexInstructions) {
            try {
                const detector = new InstructionDetector(hex.trim());
                const instruction = detector.detectInstruction();
                instructions.push(instruction);
                results.push({
                    hex,
                    parsed: instruction.formatedString(),
                    type: instruction.getType(),
                    reads: instruction.reads(),
                    writes: instruction.writes()
                });
            } catch (error) {
                results.push({
                    hex,
                    error: (error as Error).message
                });
            }
        }

        res.json({ instructions: results });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Detect conflicts endpoint
app.post("/api/detect-conflicts", (req, res) => {
    try {
        const { hexInstructions, mode = "CLASSIC" } = req.body;

        if (!hexInstructions || !Array.isArray(hexInstructions)) {
            return res.status(400).json({ error: "Invalid input: hexInstructions must be an array" });
        }

        const instructions: Instruction[] = [];

        // Parse instructions
        for (const hex of hexInstructions) {
            const detector = new InstructionDetector(hex.trim());
            const instruction = detector.detectInstruction();
            instructions.push(instruction);
        }

        // Detect conflicts with selected mode
        let conflictingInstructions = conflictsDetectorPipelineClassico(instructions, mode as "CLASSIC" | "FORWARDING");
        
        // Apply forwarding filter if FORWARDING mode is selected
        if (mode === "FORWARDING") {
            conflictingInstructions = forwardConflicts(conflictingInstructions);
        }

        const conflictResults = conflictingInstructions.map(conflict => ({
            parsed: conflict.INSTRUCTION.formatedString(),
            type: conflict.INSTRUCTION.getType(),
            reads: conflict.INSTRUCTION.reads(),
            writes: conflict.INSTRUCTION.writes(),
            conflictType: conflict.Type,
            index: conflict.Index,
            needsStall: conflict.NeedsStall,
            stallCycles: conflict.StallCycles
        }));

        res.json({
            total: hexInstructions.length,
            withConflicts: conflictResults.length,
            conflicts: conflictResults,
            mode: mode
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 RISC-V Server running on http://localhost:${PORT}`);
    console.log(`📝 API endpoints:`);
    console.log(`   - GET  /api/health`);
    console.log(`   - POST /api/read-file (multipart/form-data with 'file' field)`);
    console.log(`   - POST /api/process (body: { hexInstructions: [] })`);
    console.log(`   - POST /api/detect-conflicts (body: { hexInstructions: [] })`);
});
