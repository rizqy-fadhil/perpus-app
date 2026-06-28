"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Email atau password salah");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left - Blue Panel */}
      <div
        className="w-7/12 flex flex-col items-center justify-center text-white px-16 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #3B82F6 0%, #1E40AF 40%, #1E3A8A 100%)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute rounded-full opacity-10"
          style={{
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
            top: "-100px",
            left: "-100px",
          }}
        />
        <div
          className="absolute rounded-full opacity-10"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
            bottom: "-50px",
            right: "-50px",
          }}
        />

        {/* Icon container */}
        <div
          className="rounded-2xl flex items-center justify-center mb-8 relative z-10"
          style={{
            width: "72px",
            height: "72px",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Image
            src="/icons/icon-buku.svg"
            width={44}
            height={44}
            alt="icon buku"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center leading-snug relative z-10">
          Selamat Datang di
          <br />
          Sistem Informasi Peminjaman Buku
        </h1>
      </div>

      {/* Right - Form Panel */}
      <div className="w-5/12 bg-gray-50 flex items-center justify-center px-12">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-1 text-gray-900">
            Masuk ke Akun Anda
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Silakan masukkan kredensial Anda untuk melanjutkan.
          </p>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          {/* Username / Email */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1.5 text-gray-800">
              Username / Email
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 gap-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <input
                type="email"
                placeholder="Masukkan username atau email"
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-1.5 text-gray-800">
              Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 gap-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            style={{
              backgroundColor: "#1E40AF",
              boxShadow: "0 4px 12px rgba(30, 64, 175, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1E3A8A";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(30, 64, 175, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#1E40AF";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(30, 64, 175, 0.3)";
            }}
          >
            Masuk
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </button>

          {/* Forgot Password */}
          <p className="text-center text-blue-600 text-sm mt-4 cursor-pointer hover:underline font-medium">
            Lupa password?
          </p>
        </div>
      </div>
    </div>
  );
}