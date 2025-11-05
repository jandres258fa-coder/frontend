"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginResponse = {
  id: number;
  nombre: string;
  puntaje_total: number;
};

export default function Page() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validEmail = (e: string) => /\S+@\S+\.\S+/.test(e);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!correo || !password) {
      setError("Completa todos los campos.");
      return;
    }
    if (!validEmail(correo)) {
      setError("Ingresa un correo válido.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data: LoginResponse | any = await res.json();

      if (!res.ok) {
        setError(data?.msg || data?.error || "Error en el inicio de sesión.");
        setLoading(false);
        return;
      }

      console.log(data)
      localStorage.setItem("user", JSON.stringify(data));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      setLoading(false);

      // Redirige al juego (ruta /slot)
      router.push("/slot");
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar al servidor.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-b from-yellow-100 to-pink-200">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm mx-auto bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md"
        aria-labelledby="login-heading"
      >
        <h1
          id="login-heading"
          className="text-3xl font-extrabold mb-6 text-center text-amber-500"
        >
          🎰 Fruit Spin Challenge
        </h1>

        <h2 className="text-lg font-semibold text-center mb-4 text-gray-700">
          Iniciar sesión
        </h2>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correo
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="correo@ejemplo.com"
            required
            autoComplete="email"
          />
        </label>

        <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </label>

        {error && (
          <div className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-linear-to-r from-pink-500 to-red-500 text-white font-semibold shadow hover:scale-[1.02] transition-transform disabled:opacity-60"
          aria-busy={loading}
        >
          {loading ? "Conectando..." : "Entrar"}
        </button>

        <p className="mt-4 text-xs text-center text-gray-600">
          ¿No tienes cuenta?{" "}
          <a href="/registro" className="text-yellow-600 underline">
            Regístrate
          </a>
        </p>
      </form>
    </main>
  );
}
