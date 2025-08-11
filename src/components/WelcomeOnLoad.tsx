// src/components/WelcomeOnLoad.tsx
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  oncePerSession?: boolean;
};

export default function WelcomeOnLoad({ oncePerSession = false }: Props) {
  const [visible, setVisible] = useState(false);
  const [cpf, setCpf] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (oncePerSession && sessionStorage.getItem("telth_welcome_seen") === "1") return;
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, [oncePerSession]);

  const dismiss = () => {
    if (oncePerSession && typeof window !== "undefined") {
      sessionStorage.setItem("telth_welcome_seen", "1");
    }
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Boas-vindas"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 1000,
          }}
          // ❌ Removido onClick e onTouchStart
          // ✅ Use Pointer Events para cobrir mouse + toque
          onPointerDown={dismiss}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            style={{
              width: "100%",
              maxWidth: 480,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 12px 36px rgba(0,0,0,0.25)",
              padding: 24,
              textAlign: "center",
            }}
            // ❗ Impede que o toque/click interno feche o modal
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 26, fontWeight: 800, color: "#111", lineHeight: 1.25 }}>
              Bem-vindo ao <span style={{ color: "#007aff" }}>Telth</span>
            </div>
            <p style={{ marginTop: 12, fontSize: 20, color: "#222", lineHeight: 1.4 }}>
              O que você está sentindo hoje?
            </p>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <label
                htmlFor="welcome_cpf"
                style={{ fontSize: 18, color: "#222", fontWeight: 800, textAlign: "center" }}
              >
                CPF
              </label>
              <input
                id="welcome_cpf"
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                style={{
                  marginTop: 10,
                  width: "100%",
                  maxWidth: 320,
                  padding: 16,
                  fontSize: 20,
                  textAlign: "center",
                  letterSpacing: 1.5,
                  border: "2px solid #cfd3da",
                  borderRadius: 12,
                  background: "#fff",
                }}
              />
            </div>

            <button
              onClick={dismiss}
              // pode manter onTouchStart se quiser resposta mais imediata no botão,
              // mas não é necessário quando usamos Pointer Events
              style={{
                marginTop: 16,
                width: "100%",
                padding: "16px 20px",
                fontSize: 18,
                fontWeight: 700,
                background: "#007aff",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
              }}
            >
              Toque para começar
            </button>
            <div style={{ marginTop: 10, fontSize: 14, color: "#555" }}>
              Você também pode tocar fora da caixa para fechar.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
