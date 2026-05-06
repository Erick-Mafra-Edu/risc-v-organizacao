# ✅ RISC-V Pipeline Simulator - Checklist

## 📥 Parser / Entrada
- [x] Ler arquivo de instruções (HEX/BIN)
- [x] Converter para objetos de instrução

## 🧠 Decodificação
- [x] Identificar opcode
- [x] Classificar tipo (ALU, LOAD, STORE, BRANCH, JUMP)
- [x] Implementar `reads()`
- [x] Implementar `writes()`

## 🔍 Detecção de Conflitos

### Dados
- [x] Detectar RAW
- [x] Detectar LOAD hazard
- [ ] Detectar WAW (extra)
- [ ] Detectar WAR (extra)

### Controle
- [x] Detectar BRANCH
- [x] Detectar JUMP

### Modos de Pipeline
- [x] Sem forwarding (CLASSIC)
- [x] Com forwarding (FORWARDING)

---

## 🧱 Resolução de Conflitos

### Dados
- [x] Inserir NOPs (sem forwarding)
- [x] Inserir NOPs (com forwarding)

### Controle
- [x] Inserir NOPs para branch/jump

---

## 🔄 Integração
- [x] Criar função única de análise completa (dados + controle)
- [x] Unificar saída (original + conflitos + resolvido)

---

## 📍 Recalcular Endereços (IMPORTANTE)
- [x] Mapear índices antigos → novos
- [x] Recalcular imediato de BRANCH
- [x] Recalcular imediato de JUMP

---

## 📊 Estatísticas
- [x] Contar instruções originais
- [x] Contar instruções após NOPs
- [x] Calcular sobrecusto (NOPs inseridos)
- [x] Comparar CLASSIC vs FORWARDING

---

## 🌐 Interface Web
- [x] Input de instruções
- [x] Exibir instruções parseadas
- [x] Mostrar conflitos
- [x] Mostrar resolução com NOPs
- [x] Exibir comparação entre modos
- [x] Exibir detalhes de cada hazard

---

## 📝 Relatório (para entrega)
- [ ] Tabela de conflitos detectados
- [ ] Explicação dos hazards
- [x] Comparação sem vs com forwarding
- [x] Impacto no número de instruções
