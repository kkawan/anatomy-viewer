// src/components/AnimatedSymptomsForm.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  partName: string;
  onClose: () => void;
}

export default function AnimatedSymptomsForm({ partName, onClose }: Props) {
  const [otherText, setOtherText] = useState("");

  const items = [
    { label: "Há dor?", expandable: false },
    { label: "Há sensibilidade?", expandable: false },
    { label: "Paralisia?", expandable: true },
    { label: "Formigueiro?", expandable: false },
    { label: "Movimentos involuntários?", expandable: false },
    { label: "Falta de movimento?", expandable: false },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.4 }}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 320,
          height: "100vh",
          background: "#fff",
          boxShadow: "-4px 0 12px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
        }}
      >
        <div style={{
          background: "#007aff",
          color: "#fff",
          padding: 16,
          fontSize: 18,
          fontWeight: 600,
        }}>
          Ao Clicar: <strong>{partName}</strong>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px" }}>
          {items.map((it, idx) => (
            <div key={idx} style={{ marginBottom: 12 }}>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input type="checkbox" style={{ marginRight: 8 }} />
                <span style={{ flex: 1 }}>{it.label}</span>
                {it.expandable && <span style={{ fontSize: 12, color: "#999" }}>▶</span>}
              </label>
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 14, color: "#444" }}>Outra opção</label>
            <input
              type="text"
              value={otherText}
              onChange={e => setOtherText(e.target.value)}
              placeholder="Um texto (informações adicionais)"
              style={{
                width: "100%",
                marginTop: 4,
                padding: 8,
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            />
          </div>
        </div>

        <div style={{ padding: 16, borderTop: "1px solid #eee" }}>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: 12,
              background: "#eee",
              border: "none",
              borderRadius: 4,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
