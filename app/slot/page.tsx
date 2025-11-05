
"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import RankingTable from "../components/tabla";
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

interface Usuario {
  id: number;
  nombre: string;
  puntaje_total: number;
}

export default function SlotMachine() {
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(["🍒", "🍋", "🍊"]);
  const [points, setPoints] = useState(0);
  const [message, setMessage] = useState("");
  const [jugadores, setJugadores] = useState<Usuario[]>([]);
  const [user, setUser] = useState<Usuario | null>(null);

  const reelsRef = [useRef(null), useRef(null), useRef(null)];

  // 🔁 Mantiene valores actuales accesibles desde callbacks
  const userRef = useRef<Usuario | null>(null);
  const jugadoresRef = useRef<Usuario[]>([]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    jugadoresRef.current = jugadores;
  }, [jugadores]);

  // 🎯 Lógica principal de "giro"
  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    setMessage("Girando... 🎰");

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!storedUser?.id) {
      setMessage("⚠️ No se encontró usuario. Inicia sesión nuevamente.");
      setSpinning(false);
      return;
    }

    try {
      socket.emit("girar", { usuarioId: storedUser.id });
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al intentar girar.");
      setSpinning(false);
    }
  };

  // 🔐 Cargar usuario y ranking
  useEffect(() => {
    const fetchAndSyncUser = async () => {
      try {
        setLoading(true);
        const stored = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        const userData = stored ? JSON.parse(stored) : null;

        if (!userData || !token) {
          console.log("No hay usuario autenticado.");
          setLoading(false);
          return;
        }

        const [profileRes, rankingRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ranking`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!profileRes.ok || !rankingRes.ok) {
          console.error("Error al cargar datos del usuario o ranking");
          setLoading(false);
          return;
        }

        const [profileData, rankingData] = await Promise.all([
          profileRes.json(),
          rankingRes.json(),
        ]);

        setUser(profileData);
        setPoints(profileData.puntaje_total || 0);
        setJugadores(rankingData);
        localStorage.setItem("user", JSON.stringify(profileData));
      } catch (error) {
        console.warn("Error leyendo usuario o APIs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSyncUser();
  }, []);

  // 🎧 Escucha resultado de giro
  useEffect(() => {
    socket.on("resultadoGiro", (data) => {
      const { combinacion, total, mensaje } = data;
      setResult(combinacion);
      setPoints(total);
      setMessage(mensaje);

      // 🎞 Animación GSAP
      reelsRef.forEach((reel, i) => {
        const el = reel.current;
        if (el) {
          gsap.fromTo(
            el,
            { y: 0, rotateX: 0 },
            {
              y: -120,
              rotateX: 720,
              duration: 0.6 + i * 0.25,
              ease: "back.out(2)",
              onComplete: () => { gsap.to(el, { y: 0, rotateX: 0 }); },
            }
          );
        }
      });

      // 🔁 Actualizar ranking si el jugador mejoró su puntaje
      const currentUser = userRef.current;
      const currentRanking = jugadoresRef.current;
      if (currentUser) {
        const updatedRanking = currentRanking.map((j) =>
          j.id === currentUser.id ? { ...j, puntaje_total: total } : j
        );
        setJugadores(updatedRanking);
      }

      setSpinning(false);
    });

    return () => { socket.off("resultadoGiro"); };
  }, []);

  // 🏆 Escucha actualizaciones del ranking global
  useEffect(() => {
    const handleRankingUpdate = (data: any) => {
      setJugadores(data);
    };
    
    socket.on("rankingUpdate", handleRankingUpdate);
    
    return () => {
      socket.off("rankingUpdate", handleRankingUpdate);
    };
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="flex flex-col md:grid md:grid-cols-2 min-h-screen text-center text-white relative overflow-hidden">
      {/* 🧑 Usuario y Título */}
      <div className="flex flex-col items-center justify-center px-6 py-10">
        <div className="absolute top-5 right-5 text-xs sm:text-sm text-gray-300 z-10 bg-gray-800/30 px-3 py-1 rounded-full">
          {user ? <>👤 <strong>{user.nombre}</strong></> : "Invitado"}
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]">
          🎰 Fruit Spin Challenge
        </h1>

        {/* 🎞 Rodillos */}
        <div className="flex gap-3 sm:gap-5 mb-8 justify-center">
          {result.map((fruit, i) => (
            <div
              key={i}
              ref={reelsRef[i]}
              className="text-5xl sm:text-7xl bg-linear-to-b from-gray-800 to-gray-700 
                         border border-red-500/50 rounded-2xl w-20 h-20 sm:w-24 sm:h-24 
                         flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.4)]"
            >
              {fruit}
            </div>
          ))}
        </div>

        {/* 🎯 Botón */}
        <button
          onClick={spin}
          disabled={spinning}
          className="text-base sm:text-lg bg-red-600 hover:bg-red-700 px-8 py-2 rounded-xl 
                     shadow-[0_0_10px_rgba(255,0,0,0.4)] transition-all disabled:opacity-50"
        >
          {spinning ? "Girando..." : "🎰 Girar"}
        </button>

        {/* 🏅 Puntaje */}
        <p className="mt-6 text-xl sm:text-2xl font-semibold text-yellow-400">
          Puntaje total: {points}
        </p>

        {message && <p className="mt-3 text-base text-red-300">{message}</p>}

        <footer className="mt-10 text-xs text-gray-500 opacity-70">
          Proyecto académico — “Fruit Spin Challenge”
        </footer>
      </div>

      {/* 🏆 Tabla de ranking */}
      <div className="absolute top-4 right-4 md:static md:flex md:items-start md:justify-end p-3">
        <RankingTable jugadores={jugadores} />
      </div>
    </div>
  );
}
