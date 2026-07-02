import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { login } from "../config/authService";

function Login() {
    const navigate = useNavigate();
    const [role, setRole] = useState("student");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await login({ email, password, role });
            console.log('Logged In', res.data);
            localStorage.setItem('token', res.data.token);
            if (res.data.role === 'instructor') {
                navigate('/instructor/dashboard');
            } else {
                navigate('/');
            }
        } catch (error) {
            setError(error.response?.data?.message || "Login Failed!");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: "#0a0a14" }}>

            <form onSubmit={handleLogin}>

                {/* Background orbs */}
                <div className="fixed top-0 left-0 w-72 h-72 rounded-full opacity-30 blur-[80px] pointer-events-none"
                    style={{ background: "#7F77DD" }} />
                <div className="fixed bottom-0 right-0 w-56 h-56 rounded-full opacity-25 blur-[80px] pointer-events-none"
                    style={{ background: "#1D9E75" }} />

                {/* 3D Card */}
                <div className="relative w-full w-sm rounded-2xl p-8 transition-transform duration-100"
                    style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "0.5px solid rgba(255,255,255,0.12)",
                        backdropFilter: "blur(12px)",
                        transformStyle: "preserve-3d",
                    }}
                    onMouseMove={e => {
                        const r = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - r.left) / r.width - 0.5) * 18;
                        const y = -((e.clientY - r.top) / r.height - 0.5) * 18;
                        e.currentTarget.style.transform =
                            `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) translateZ(8px)`;
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform =
                            "perspective(600px) rotateX(0) rotateY(0) translateZ(0)";
                    }}>

                    {/* Shine overlay */}
                    <div className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.07) 0%,transparent 60%)" }} />

                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: "linear-gradient(135deg,#7F77DD,#1D9E75)" }}>
                            UX
                        </div>
                        <span className="text-white font-semibold text-base tracking-tight">
                            Upgrade<span style={{ color: "#7F77DD" }}>X</span>
                        </span>
                    </div>

                    <h1 className="text-xl font-semibold text-white text-center mb-1">Welcome back</h1>
                    <p className="text-center text-xs mb-5" style={{ color: "rgba(255,255,255,0.35)" }}>
                        Sign in to your workspace
                    </p>

                    {/* Role Toggle — ✅ type="button" added */}
                    <div className="flex rounded-full p-1 mb-5" style={{ background: "rgba(255,255,255,0.05)" }}>
                        {["student", "instructor"].map(r => (
                            <button type="button" key={r} onClick={() => setRole(r)}
                                className="flex-1 py-2 rounded-full text-xs font-medium capitalize transition-all"
                                style={{
                                    background: role === r ? "rgba(127,119,221,0.25)" : "transparent",
                                    color: role === r ? "#AFA9EC" : "rgba(255,255,255,0.35)",
                                    border: "none", cursor: "pointer",
                                }}>
                                {r === "student" ? "🎓" : "👨‍🏫"} {r.charAt(0).toUpperCase() + r.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Fields — ✅ split into separate inputs, add value/onChange yourself */}
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                placeholder=" "
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="peer w-full rounded-xl px-4 pt-6 pb-2 text-sm text-white outline-none transition-all"
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "0.5px solid rgba(255,255,255,0.12)",
                                }} />
                            <label htmlFor="email"
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none transition-all duration-200
                                peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px]
                                peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-[10px]"
                                style={{ color: "rgba(255,255,255,0.35)" }}>
                                Email address
                            </label>
                        </div>

                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                placeholder=" "
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="peer w-full rounded-xl px-4 pt-6 pb-2 text-sm text-white outline-none transition-all"
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "0.5px solid rgba(255,255,255,0.12)",
                                }} />
                            <label htmlFor="password"
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none transition-all duration-200
                                peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px]
                                peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-[10px]"
                                style={{ color: "rgba(255,255,255,0.35)" }}>
                                Password
                            </label>
                        </div>
                    </div>

                    {/* ✅ Error message display */}
                    {error && <p className="text-xs mt-3 text-center" style={{ color: "#E24B4A" }}>{error}</p>}

                    <a className="block text-right text-xs mt-2 mb-4 cursor-pointer"
                        style={{ color: "rgba(127,119,221,0.8)" }}>
                        Forgot password?
                    </a>

                    {/* ✅ type="submit" added */}
                    <button type="submit" className="w-full py-3 rounded-xl font-semibold text-sm text-white relative overflow-hidden transition-all hover:-translate-y-0.5"
                        style={{ background: "linear-gradient(135deg,#7F77DD 0%,#1D9E75 100%)", border: "none", cursor: "pointer" }}>
                        Sign In →
                    </button>

                    {/* <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>or continue with</span>
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                    </div> */}

                    {/* <div className="grid grid-cols-2 gap-2">
                        {["Google", "GitHub"].map(p => (
                            <button type="button" key={p} className="py-2 rounded-xl text-xs transition-all"
                                style={{
                                    background: "rgba(255,255,255,0.04)",
                                    border: "0.5px solid rgba(255,255,255,0.1)",
                                    color: "rgba(255,255,255,0.5)", cursor: "pointer",
                                }}>
                                {p === "Google" ? "G" : "⌥"} {p}
                            </button>
                        ))}
                    </div> */}

                    <p className="text-center text-xs mt-5" style={{ color: "rgba(255,255,255,0.3)" }}>
                        New to UpgradeX?{" "}
                        <NavLink to="/signup" className="font-semibold" style={{ color: "#7F77DD" }}>
                            Sign up free
                        </NavLink>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default Login;