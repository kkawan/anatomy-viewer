// src/components/AnimatedSymptomsForm.tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface Props {
  partName: string;
  onClose: () => void;
  patientName?: string; // opcional
  appointmentTime?: string; // opcional, ex.: "12:30"
}

type Item = {
  label: string;
  expandable?: boolean;
  options?: string[];
};

export default function AnimatedSymptomsForm({
  partName,
  onClose,
  patientName = "Kawan",
  appointmentTime = "12:30",
}: Props) {
  const shouldReduceMotion = useReducedMotion();
  const panelTitleId = useId();
  const firstControlRef = useRef<HTMLInputElement | null>(null);

  const [otherText, setOtherText] = useState("");
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState<number | null>(null);
  const [subChecked, setSubChecked] = useState<Record<string, boolean>>({});

  // Estados de "Há dor?"
  const [painIntensity, setPainIntensity] = useState<
    "" | "leve" | "moderada" | "intensa" | "muito_intensa"
  >("");
  const [painDurationChoice, setPainDurationChoice] = useState<
    | ""
    | "Menos de 1 dia"
    | "Mais de 1 dia"
    | "1 semana"
    | "2 semanas"
    | "Alguns Meses"
    | "especificar"
  >("");
  const [painDurationValue, setPainDurationValue] = useState<string>("");
  const [painDurationUnit, setPainDurationUnit] = useState<
    "minutos" | "horas" | "dias" | "semanas"
  >("horas");

  const resetPain = () => {
    setPainIntensity("");
    setPainDurationChoice("");
    setPainDurationValue("");
    setPainDurationUnit("horas");
  };

  // ✅ Lista de itens — “Outro” NÃO é mais expansível
  const items: Item[] = [
    { label: "Há dor?" },
    { label: "Há sensibilidade?" },
    {
      label: "Paralisia?",
      expandable: true,
      options: ["Total", "Parcial", "Intermitente"],
    },
    { label: "Falta de fome?" },
    { label: "Movimentos involuntários?" },
    { label: "Há Tontura?" },
    { label: "Há febre?" },
    { label: "Há dificuldade para respirar?" },
    { label: "Há tosse?" },
    { label: "Há secreção nasal?" },
    { label: "Há Cansaço?" },
    { label: "Vômito?" },
    { label: "Sangramento?" },
    { label: "Outro" }, // ← aqui!
  ];

  // ✅ Estado para o texto do “Outro”
  const [customSymptom, setCustomSymptom] = useState("");
  const otherInputRef = useRef<HTMLInputElement | null>(null);
  const outroIndex = items.findIndex((i) => i.label === "Outro");

  useEffect(() => {
    firstControlRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Foco automático no input de “Outro” quando marcado
  useEffect(() => {
    if (outroIndex >= 0 && checked[outroIndex]) {
      otherInputRef.current?.focus();
    }
  }, [checked, outroIndex]);

  const toggleCheck = (idx: number) =>
    setChecked((prev) => {
      const next = { ...prev, [idx]: !prev[idx] };
      if (idx === 0 && next[idx] === false) resetPain();
      if (idx === outroIndex && next[idx] === false) setCustomSymptom("");
      return next;
    });

  const toggleSubCheck = (key: string) =>
    setSubChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleExpand = (idx: number) =>
    setExpanded((cur) => (cur === idx ? null : idx));

  const duration = shouldReduceMotion ? 0 : 0.4;

  // Rádio "chip"
  const RadioChip = ({
    name,
    value,
    checked,
    label,
    onChange,
  }: {
    name: string;
    value: string;
    checked: boolean;
    label: string;
    onChange: () => void;
  }) => (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 12,
        border: `2px solid ${checked ? "#0059c9" : "#d4d7dd"}`,
        borderRadius: 12,
        background: checked ? "#e8f1ff" : "#fff",
        cursor: "pointer",
        minHeight: 48,
        justifyContent: "center",
        fontWeight: 700,
      }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
        aria-label={label}
      />
      <span style={{ fontSize: 16, color: "#111" }}>{label}</span>
    </label>
  );

  // 🔔 Pop-up de encerramento
  const [showClosing, setShowClosing] = useState(false);
  useEffect(() => {
    if (!showClosing) return;
    const onKey = (e: KeyboardEvent) => {
      if (["Escape", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        handleCloseClosing();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showClosing]);

  const handleCloseClosing = () => {
    setShowClosing(false);
    onClose(); // só fecha o painel depois que o usuário fecha o pop-up
  };

  return (
    <AnimatePresence>
      {/* Painel lateral */}
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={panelTitleId}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration }}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 360,
          height: "100vh",
          background: "#ffffff",
          boxShadow: "-4px 0 12px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
        }}
      >
        {/* Cabeçalho */}
        <div
          style={{
            background: "#0059c9",
            color: "#fff",
            padding: 18,
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 0.2,
          }}
        >
          <div id={panelTitleId} style={{ lineHeight: 1.2 }}>
            Você selecionou:{" "}
            <span style={{ color: "#ffeb3b" }}>{partName}</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 14, opacity: 0.95 }}>
            Marque tudo o que se aplicar. (Toque grande e fácil)
          </div>
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 24px" }}>
          {items.map((it, idx) => {
            const isChecked = !!checked[idx];
            const isExpandable = !!it.expandable;
            const isOpen = expanded === idx;
            const controlId = `symptom_${idx}`;
            const regionId = `region_${idx}`;

            return (
              <div key={idx} style={{ marginBottom: 12 }}>
                <label
                  htmlFor={controlId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 14,
                    border: "2px solid " + (isChecked ? "#0059c9" : "#d4d7dd"),
                    borderRadius: 12,
                    background: isChecked ? "#e8f1ff" : "#fff",
                    cursor: "pointer",
                    minHeight: 56,
                    boxShadow: isChecked ? "inset 0 0 0 1px #0059c9" : "none",
                  }}
                >
                  <input
                    ref={idx === 0 ? firstControlRef : undefined}
                    id={controlId}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCheck(idx)}
                    aria-describedby={
                      idx === 0 || isExpandable || idx === outroIndex
                        ? regionId
                        : undefined
                    }
                    style={{ width: 24, height: 24, accentColor: "#0059c9" }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: 18,
                      color: "#111",
                      lineHeight: 1.3,
                    }}
                  >
                    {it.label}
                  </span>

                  {isExpandable && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(idx)}
                      aria-expanded={isOpen}
                      aria-controls={regionId}
                      style={{
                        border: "2px solid #cfd3da",
                        background: "#fff",
                        borderRadius: 10,
                        padding: "8px 10px",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {isOpen ? "Ocultar" : "Detalhes"}
                    </button>
                  )}
                </label>

                {/* Detalhes de "Há dor?" */}
                {idx === 0 && (
                  <AnimatePresence initial={false}>
                    {isChecked && (
                      <motion.div
                        id={regionId}
                        role="region"
                        aria-label="Detalhes de dor"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
                        style={{
                          overflow: "hidden",
                          borderLeft: "4px solid #c2185b",
                          background: "#fff7fa",
                          borderRadius: 12,
                          marginTop: 8,
                          padding: "12px 12px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 16,
                            color: "#222",
                            marginBottom: 8,
                            fontWeight: 800,
                          }}
                        >
                          Intensidade da dor
                        </div>
                        <div
                          role="radiogroup"
                          aria-label="Intensidade da dor"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 8,
                            marginBottom: 12,
                          }}
                        >
                          <RadioChip
                            name="painIntensity"
                            value="leve"
                            checked={painIntensity === "leve"}
                            label="Leve"
                            onChange={() => setPainIntensity("leve")}
                          />
                          <RadioChip
                            name="painIntensity"
                            value="moderada"
                            checked={painIntensity === "moderada"}
                            label="Moderada"
                            onChange={() => setPainIntensity("moderada")}
                          />
                          <RadioChip
                            name="painIntensity"
                            value="intensa"
                            checked={painIntensity === "intensa"}
                            label="Intensa"
                            onChange={() => setPainIntensity("intensa")}
                          />
                          <RadioChip
                            name="painIntensity"
                            value="muito_intensa"
                            checked={painIntensity === "muito_intensa"}
                            label="Muito intensa"
                            onChange={() => setPainIntensity("muito_intensa")}
                          />
                        </div>

                        <div
                          style={{
                            fontSize: 16,
                            color: "#222",
                            marginBottom: 8,
                            fontWeight: 800,
                          }}
                        >
                          Há quanto tempo?
                        </div>
                        <div
                          role="radiogroup"
                          aria-label="Duração da dor"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 8,
                          }}
                        >
                          {[
                            "Menos de 1 dia",
                            "Mais de 1 dia",
                            "1 semana",
                            "2 semanas",
                            "Alguns Meses",
                            "especificar",
                          ].map((opt) => (
                            <RadioChip
                              key={opt}
                              name="painDuration"
                              value={opt}
                              checked={painDurationChoice === (opt as any)}
                              label={
                                opt === "especificar" ? "Especificar" : opt
                              }
                              onChange={() => setPainDurationChoice(opt as any)}
                            />
                          ))}
                        </div>

                        <AnimatePresence initial={false}>
                          {painDurationChoice === "especificar" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{
                                duration: shouldReduceMotion ? 0 : 0.2,
                              }}
                              style={{
                                overflow: "hidden",
                                marginTop: 10,
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 8,
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  alignItems: "center",
                                }}
                              >
                                <label
                                  htmlFor="pain_value"
                                  style={{
                                    fontSize: 14,
                                    color: "#333",
                                    minWidth: 70,
                                  }}
                                >
                                  Quantidade
                                </label>
                                <input
                                  id="pain_value"
                                  type="number"
                                  min={0}
                                  inputMode="numeric"
                                  value={painDurationValue}
                                  onChange={(e) =>
                                    setPainDurationValue(e.target.value)
                                  }
                                  placeholder="Ex.: 3"
                                  style={{
                                    width: "100%",
                                    padding: 12,
                                    fontSize: 16,
                                    border: "2px solid #cfd3da",
                                    borderRadius: 12,
                                  }}
                                />
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  alignItems: "center",
                                }}
                              >
                                <label
                                  htmlFor="pain_unit"
                                  style={{
                                    fontSize: 14,
                                    color: "#333",
                                    minWidth: 70,
                                  }}
                                >
                                  Unidade
                                </label>
                                <select
                                  id="pain_unit"
                                  value={painDurationUnit}
                                  onChange={(e) =>
                                    setPainDurationUnit(
                                      e.target.value as
                                        | "minutos"
                                        | "horas"
                                        | "dias"
                                        | "semanas"
                                    )
                                  }
                                  style={{
                                    width: "100%",
                                    padding: 12,
                                    fontSize: 16,
                                    border: "2px solid #cfd3da",
                                    borderRadius: 12,
                                    background: "#fff",
                                  }}
                                >
                                  <option value="minutos">minutos</option>
                                  <option value="horas">horas</option>
                                  <option value="dias">dias</option>
                                  <option value="semanas">semanas</option>
                                </select>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {/* Expansível "Paralisia?" */}
                {isExpandable && (
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={regionId}
                        role="region"
                        aria-label={`Opções de ${it.label.replace("?", "")}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
                        style={{
                          overflow: "hidden",
                          borderLeft: "4px solid #0059c9",
                          background: "#f7f9fc",
                          borderRadius: 12,
                          marginTop: 8,
                          padding: "10px 12px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 16,
                            color: "#222",
                            marginBottom: 8,
                            fontWeight: 700,
                          }}
                        >
                          Selecione o tipo:
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 8,
                          }}
                        >
                          {it.options?.map((opt) => {
                            const key = `paralisia_${opt}`;
                            const sel = !!subChecked[key];
                            return (
                              <label
                                key={opt}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  padding: 12,
                                  border:
                                    "2px solid " +
                                    (sel ? "#0059c9" : "#d4d7dd"),
                                  borderRadius: 12,
                                  background: sel ? "#e8f1ff" : "#fff",
                                  cursor: "pointer",
                                  minHeight: 48,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={sel}
                                  onChange={() => toggleSubCheck(key)}
                                  style={{
                                    width: 22,
                                    height: 22,
                                    accentColor: "#0059c9",
                                  }}
                                  aria-label={opt}
                                />
                                <span style={{ fontSize: 16, color: "#111" }}>
                                  {opt}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {/* ✅ Campo animado para "Outro" quando marcado */}
                {idx === outroIndex && (
                  <AnimatePresence initial={false}>
                    {isChecked && (
                      <motion.div
                        id={regionId}
                        role="region"
                        aria-label="Descrição de outro sintoma"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
                        style={{
                          overflow: "hidden",
                          borderLeft: "4px solid #6a1b9a",
                          background: "#faf5ff",
                          borderRadius: 12,
                          marginTop: 8,
                          padding: "10px 12px",
                        }}
                      >
                        <label
                          htmlFor="symptom_other"
                          style={{ fontSize: 16, color: "#222", fontWeight: 700 }}
                        >
                          Descreva o sintoma:
                        </label>
                        <input
                          ref={otherInputRef}
                          id="symptom_other"
                          type="text"
                          value={customSymptom}
                          onChange={(e) => setCustomSymptom(e.target.value)}
                          placeholder="Ex.: coceira, formigamento, etc."
                          style={{
                            width: "100%",
                            marginTop: 8,
                            padding: 12,
                            fontSize: 16,
                            border: "2px solid #cfd3da",
                            borderRadius: 12,
                            background: "#fff",
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}

          {/* Outra informação (histórico) */}
          <div
            style={{
              marginTop: 18,
              paddingTop: 12,
              borderTop: "1px solid #e6e9ef",
            }}
          >
            <label
              htmlFor="other_notes"
              style={{ fontSize: 16, color: "#222", fontWeight: 700 }}
            >
              Já apresentou outras doenças anteriormente?
            </label>
            <div style={{ fontSize: 14, color: "#444", marginTop: 4 }}>
              Descreva algo importante que não está na lista.
            </div>
            <input
              id="other_notes"
              type="text"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Ex.: Diabetes, Hipertensão, Asma, etc..."
              style={{
                width: "100%",
                marginTop: 8,
                padding: 12,
                fontSize: 16,
                border: "2px solid #cfd3da",
                borderRadius: 12,
              }}
            />
          </div>
        </div>

        {/* Rodapé */}
        <div
          style={{
            padding: 16,
            borderTop: "1px solid #e6e9ef",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 10,
            background: "#fff",
          }}
        >
          <button
            onClick={() => setShowClosing(true)}
            aria-label="Concluir e exibir mensagem"
            style={{
              width: "100%",
              padding: 16,
              background: "#0059c9",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 18,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Concluir
          </button>
          <button
            type="button"
            onClick={() => {
              setChecked({});
              setExpanded(null);
              setSubChecked({});
              setOtherText("");
              setCustomSymptom(""); // limpa “Outro”
              resetPain();
              firstControlRef.current?.focus();
            }}
            aria-label="Limpar seleção"
            style={{
              width: "100%",
              padding: 14,
              background: "#eef2f7",
              color: "#111",
              border: "2px solid #cfd3da",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Limpar respostas
          </button>
        </div>
      </motion.aside>

      {/* 🔶 Pop-up de encerramento (sobreposição) */}
      <AnimatePresence>
        {showClosing && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Mensagem de encerramento"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              zIndex: 999, // acima do painel
            }}
            onClick={handleCloseClosing}
            onTouchStart={handleCloseClosing}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              style={{
                width: "100%",
                maxWidth: 520,
                background: "#ffffff",
                borderRadius: 18,
                boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
                padding: 24,
                textAlign: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: "#111",
                  lineHeight: 1.25,
                }}
              >
                Muito obrigado,{" "}
                <span style={{ color: "#0059c9" }}>{patientName}</span>!
              </div>
              <p
                style={{
                  marginTop: 12,
                  fontSize: 18,
                  color: "#222",
                  lineHeight: 1.5,
                }}
              >
                Você será chamado em breve.
                <br />
                Sua consulta está marcada para <strong>{appointmentTime}</strong>.
              </p>
              <button
                onClick={handleCloseClosing}
                onTouchStart={handleCloseClosing}
                autoFocus
                style={{
                  marginTop: 18,
                  width: "100%",
                  padding: 16,
                  fontSize: 18,
                  fontWeight: 800,
                  background: "#0059c9",
                  color: "#fff",
                  border: "none",
                  borderRadius: 14,
                  cursor: "pointer",
                }}
              >
                OK, entendi
              </button>
              <div style={{ marginTop: 10, fontSize: 14, color: "#555" }}>
                Se precisar de ajuda, chame nossa equipe.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
