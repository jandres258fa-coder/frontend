"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PropsJugadores {
  id: number;
  nombre: string;
  puntaje_total: number;
}

export default function RankingTable({ jugadores }: { jugadores: PropsJugadores[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed md:absolute bottom-4 md:top-24 right-4 bg-black/60 backdrop-blur-xl rounded-xl border border-red-700/50 shadow-[0_0_15px_rgba(255,0,0,0.4)] w-[90%] md:w-64 overflow-hidden transition-all">
      {/* Encabezado */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 bg-red-950/50 hover:bg-red-900/50 transition-colors"
      >
        <h3 className="text-white font-bold text-sm tracking-wide">🏆 Ranking</h3>
        <span className="text-white md:hidden">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {/* Contenido */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          open ? "max-h-96" : "max-h-0 md:max-h-[500px]"
        }`}
      >
        <table className="w-full text-[13px] text-gray-300">
          <thead className="bg-red-950/40 text-[11px] uppercase text-gray-400">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Jugador</th>
              <th className="px-3 py-2 text-right">Pts</th>
            </tr>
          </thead>
          <tbody>
            {jugadores.length > 0 ? (
              jugadores.map((j, i) => (
                <tr
                  key={j.id}
                  className={`${
                    i % 2 === 0 ? "bg-white/5" : "bg-transparent"
                  } hover:bg-red-900/30 transition-colors`}
                >
                  <td className="px-3 py-2 text-red-300 font-semibold whitespace-nowrap">
                    #{i + 1}
                  </td>
                  <td className="px-3 py-2 truncate">{j.nombre}</td>
                  <td className="px-3 py-2 text-right text-yellow-400 font-semibold">
                    {j.puntaje_total}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-3 text-gray-400 italic text-sm"
                >
                  Sin jugadores aún...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
