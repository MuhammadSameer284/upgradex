import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { register } from "../config/authService.jsx";

function Signup() {
    const navigate = useNavigate();

    const [role, setRole]             = useState("student");
    const [passStrength, setPassStrength] = useState(0);
    const [name, setName]             = useState("");
    const [email, setEmail]           = useState("");
    const [password, setPassword]     = useState("");
    const [error, setError]           = useState("");

    const handlePassword = (e) => {
        setPassword(e.target.value);
        const len = e.target.value.length;
        setPassStrength(Math.min(len * 8, 100));
    };

    const strengthColor =
        passStrength < 35 ? "#E24B4A" : passStrength < 70 ? "#EF9F27" : "#1D9E75";

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await register({ name, email, password, role });

            // Save token using correct key
            localStorage.setItem("upgradex_token", res.data.token);

            // Save full user object
            localStorage.setItem("upgradex_user", JSON.stringify(res.data.user));

            // Redirect based on role from backend response
            if (res.data.user.role === "instructor") {
                navigate("/instructor/dashboard");
            } else {
                navigate("/dashboard");
            }

        } catch (error) {
            setError(error.response?.data?.message || "Registration Failed!");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: "#0a0a14" }}>
            <form onSubmit={handleRegister}>

                <div className="fixed top-0 right-0 w-64 h-64 rounded-full opacity-25 blur-[80px] pointer-events-none"
                    style={{ background: "#AFA9EC" }} />
                <div className="fixed bottom-0 left-0 w-48 h-48 rounded-full opacity-20 blur-[80px] pointer-events-none"
                    style={{ background: "#5DCAA5" }} />

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

                    <div className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.07) 0%,transparent 60%)" }} />

                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: "linear-gradient(135deg,#7F77DD,#1D9E75)" }}>
                            UX
                        </div>
                        <span className="text-white font-semibold text-base tracking-tight">
                            Upgrade<span style={{ color: "#7F77DD" }}>X</span>
                        </span>
                    </div>

                    <h1 className="text-xl font-semibold text-white text-center mb-5">Create account</h1>

                    {/* Role Picker */}
                    <div className="grid grid-cols-2 gap-2 mb-5">
                        {[
                            { key: "student",    label: "🎓 Student"      },
                            { key: "instructor", label: "👨‍🏫 Instructor" },
                        ].map(r => (
                            <button type="button" key={r.key} onClick={() => setRole(r.key)}
                                className="py-2 rounded-xl text-xs font-medium transition-all"
                                style={{
                                    background: role === r.key ? "rgba(127,119,221,0.15)" : "rgba(255,255,255,0.04)",
                                    border: role === r.key ? "0.5px solid rgba(127,119,221,0.5)" : "0.5px solid rgba(255,255,255,0.1)",
                                    color: role === r.key ? "#AFA9EC" : "rgba(255,255,255,0.35)",
                                    cursor: "pointer",
                                }}>
                                {r.label}
                            </button>
                        ))}
                    </div>

                    {/* Fields */}
                    <div className="space-y-4">
                        <div className="relative">
                            <input type="text" id="name" placeholder=" " required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="peer w-full rounded-xl px-4 pt-6 pb-2 text-sm text-white outline-none"
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "0.5px solid rgba(255,255,255,0.12)",
                                }} />
                            <label htmlFor="name"
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-xs pointer-events-none transition-all duration-200
                                peer-focus:top-3 peer-focus:translate-y-0 peer-focus:text-[10px]
                                peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-[10px]"
                                style={{ color: "rgba(255,255,255,0.35)" }}>
                                Full name
                            </label>
                        </div>

                        <div className="relative">
                            <input type="email" id="email" placeholder=" " required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="peer w-full rounded-xl px-4 pt-6 pb-2 text-sm text-white outline-none"
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
                            <input type="password" value={password} id="password"
                                onChange={handlePassword}
                                placeholder=" " required
                                className="peer w-full rounded-xl px-4 pt-6 pb-2 text-sm text-white outline-none"
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
                            <div className="h-0.5 rounded-full mt-1.5 overflow-hidden"
                                style={{ background: "rgba(255,255,255,0.07)" }}>
                                <div className="h-full rounded-full transition-all duration-300"
                                    style={{ width: `${passStrength}%`, background: strengthColor }} />
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-xs mt-3 text-center" style={{ color: "#E24B4A" }}>{error}</p>}

                    <button type="submit" className="w-full py-3 rounded-xl font-semibold text-sm text-white mt-5 transition-all hover:-translate-y-0.5"
                        style={{ background: "linear-gradient(135deg,#7F77DD 0%,#1D9E75 100%)", border: "none", cursor: "pointer" }}>
                        Create Account →
                    </button>

                    <p className="text-center text-xs mt-5" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Already on UpgradeX?{" "}
                        <NavLink to="/login" className="font-semibold" style={{ color: "#7F77DD" }}>
                            Sign in
                        </NavLink>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default Signup;
