import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Delete } from "lucide-react";

const BUTTONS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
];

function evaluate(a: number, op: string, b: number): number {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b !== 0 ? a / b : NaN;
    default: return b;
  }
}

function fmt(n: number): string {
  if (isNaN(n)) return 'Erreur';
  const s = parseFloat(n.toPrecision(10)).toString();
  return s.length > 12 ? parseFloat(n.toPrecision(6)).toString() : s;
}

export const CalculatorWidget = () => {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState('');
  const [operand, setOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [calcHistory, setCalcHistory] = useState<string[]>([]);

  const handleKey = (key: string) => {
    // Number or decimal
    if (/[0-9.]/.test(key)) {
      if (key === '.' && display.includes('.') && !waiting) return;
      if (waiting) {
        setDisplay(key === '.' ? '0.' : key);
        setWaiting(false);
      } else {
        setDisplay(d => (d === '0' && key !== '.' ? key : d.length < 12 ? d + key : d));
      }
      return;
    }
    if (key === 'C') {
      setDisplay('0'); setOperand(null); setOperator(null); setWaiting(false); setHistory('');
      return;
    }
    if (key === '⌫') {
      setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0');
      return;
    }
    if (key === '±') {
      setDisplay(d => d.startsWith('-') ? d.slice(1) : d === '0' ? '0' : '-' + d);
      return;
    }
    if (key === '%') {
      setDisplay(d => fmt(parseFloat(d) / 100));
      return;
    }
    if (['+', '−', '×', '÷'].includes(key)) {
      const cur = parseFloat(display);
      if (operand !== null && operator && !waiting) {
        const result = evaluate(operand, operator, cur);
        setDisplay(fmt(result));
        setOperand(result);
        setHistory(`${fmt(result)} ${key}`);
      } else {
        setOperand(cur);
        setHistory(`${fmt(cur)} ${key}`);
      }
      setOperator(key);
      setWaiting(true);
      return;
    }
    if (key === '=') {
      if (operand !== null && operator) {
        const cur = parseFloat(display);
        const result = evaluate(operand, operator, cur);
        const expr = `${fmt(operand)} ${operator} ${fmt(cur)} = ${fmt(result)}`;
        setCalcHistory(h => [expr, ...h].slice(0, 6));
        setHistory('');
        setDisplay(fmt(result));
        setOperand(null);
        setOperator(null);
        setWaiting(false);
      }
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, string> = { '/': '÷', '*': '×', '-': '−', Enter: '=', Backspace: '⌫', Escape: 'C' };
      const key = map[e.key] || e.key;
      if (/[0-9.+÷×−=C⌫%]/.test(key) || ['÷','×','−','⌫'].includes(key)) handleKey(key);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const getBtnStyle = (btn: string) => {
    if (['÷', '×', '−', '+', '='].includes(btn)) {
      return btn === '='
        ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'
        : 'bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/20';
    }
    if (['C', '±', '%'].includes(btn)) return 'bg-white/10 hover:bg-white/15 text-gray-200';
    if (btn === '⌫') return 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10';
    return 'bg-white/5 hover:bg-white/10 text-white border border-white/[0.06]';
  };

  return (
    <div className="flex flex-col w-full max-w-xs mx-auto py-6 px-4">
      {/* Display */}
      <div className="rounded-2xl bg-black/40 border border-white/[0.07] p-5 mb-4">
        <div className="text-xs text-gray-600 h-5 text-right font-mono">{history || '\u00A0'}</div>
        <motion.div
          key={display}
          initial={{ y: -4, opacity: 0.7 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-light text-white text-right tracking-tight truncate mt-1"
        >
          {display}
        </motion.div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2.5">
        {BUTTONS.flat().map((btn, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.91 }}
            onClick={() => handleKey(btn)}
            className={`rounded-xl h-14 text-lg font-medium transition-all cursor-pointer ${
              btn === '0' ? 'col-span-1' : ''
            } ${getBtnStyle(btn)}`}
          >
            {btn === '⌫' ? <Delete className="w-4 h-4 mx-auto" /> : btn}
          </motion.button>
        ))}
      </div>

      {/* History */}
      {calcHistory.length > 0 && (
        <div className="mt-5 border-t border-white/[0.06] pt-4 space-y-1.5">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Historique</p>
          {calcHistory.map((h, i) => (
            <div key={i} className="text-xs text-gray-500 font-mono text-right">{h}</div>
          ))}
        </div>
      )}
    </div>
  );
};
