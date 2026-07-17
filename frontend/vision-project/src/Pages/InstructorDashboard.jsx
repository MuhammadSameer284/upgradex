import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/authContext.jsx";

const STATS = [
    { value: 12, label: "Total students", color: "#AFA9EC" },
    { value: 8, label: "Active projects", color: "#5DCAA5" },
    { value: 5, label: "Pending reviews", color: "#FAC775" },
    { value: 3, label: "Calls today", color: "#E86C6B" },
];

const STUDENTS = [
    { initials: "SA", name: "Sameer Ahmed", project: "E-Commerce Platform", progress: 65, status: "On track", statusBg: "rgba(29,158,117,0.12)", statusColor: "#5DCAA5", bg: "linear-gradient(135deg,#534AB7,#7F77DD)" },
    { initials: "AR", name: "Ali Raza", project: "Student Portal API", progress: 40, status: "On track", statusBg: "rgba(29,158,117,0.12)", statusColor: "#5DCAA5", bg: "linear-gradient(135deg,#0F6E56,#1D9E75)" },
    { initials: "SR", name: "Sara Raza", project: "Weather App", progress: 90, status: "Review due", statusBg: "rgba(186,117,23,0.12)", statusColor: "#FAC775", bg: "linear-gradient(135deg,#712B13,#D85A30)" },
    { initials: "MK", name: "Maria Khan", project: "Chat Bot", progress: 20, status: "Behind", statusBg: "rgba(224,75,74,0.12)", statusColor: "#E86C6B", bg: "linear-gradient(135deg,#633806,#EF9F27)" },
];

const REVIEWS = [
    { student: "Sameer Ahmed", project: "E-Commerce Platform", file: "authController.js", time: "2h ago", bg: "linear-gradient(135deg,#534AB7,#7F77DD)", initials: "SA" },
    { student: "Sara Raza", project: "Weather App", file: "App.jsx", time: "5h ago", bg: "linear-gradient(135deg,#712B13,#D85A30)", initials: "SR" },
];

export default function InstructorDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    return (
        <div className="min-h-screen p-6" style={{ background: "#0a0a14" }}>

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>{today}</div>
                    <h1 className="text-xl font-semibold text-white">
                        Good morning, <span style={{ color: "#7F77DD" }}>
                            {user?.name?.split(" ")[0] || "Instructor"}
                        </span> 👋
                    </h1>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                        Instructor Dashboard · Batch 42
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/video")}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white"
                        style={{ background: "linear-gradient(135deg,#7F77DD,#1D9E75)", border: "none", cursor: "pointer" }}
                    >
                        <i className="ti ti-video" aria-hidden="true" style={{ fontSize: "14px" }} />
                        Schedule call
                    </button>

                    <button
                        onClick={() => { logout(); navigate("/login"); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs"
                        style={{ background: "rgba(224,75,74,0.1)", color: "#E86C6B", border: "0.5px solid rgba(224,75,74,0.2)", cursor: "pointer" }}
                    >
                        <i className="ti ti-logout" aria-hidden="true" style={{ fontSize: "14px" }} />
                        Logout
                    </button>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-4 gap-3 mb-5">
                {STATS.map((s, i) => (
                    <div key={i} className="rounded-xl p-4"
                        style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                        <div className="text-2xl font-semibold mb-0.5" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">

                {/* ── Student Progress ── */}
                <div className="rounded-xl p-4"
                    style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                            Student progress
                        </span>
                        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>Batch 42</span>
                    </div>

                    {STUDENTS.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                                style={{ background: s.bg }}>
                                {s.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                                        {s.name}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full"
                                        style={{ background: s.statusBg, color: s.statusColor }}>
                                        {s.status}
                                    </span>
                                </div>
                                <div className="text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                                    {s.project}
                                </div>
                                <div className="h-0.5 rounded-full overflow-hidden"
                                    style={{ background: "rgba(255,255,255,0.07)" }}>
                                    <div className="h-full rounded-full"
                                        style={{ width: `${s.progress}%`, background: "#7F77DD" }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Pending Reviews ── */}
                <div className="rounded-xl p-4"
                    style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                            Pending code reviews
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(224,75,74,0.12)", color: "#E86C6B" }}>
                            {REVIEWS.length} open
                        </span>
                    </div>

                    {REVIEWS.map((r, i) => (
                        <div key={i}
                            className="flex items-center gap-3 p-3 rounded-xl mb-2 cursor-pointer transition-all"
                            style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)"; e.currentTarget.style.background = "rgba(127,119,221,0.05)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                            onClick={() => navigate("/review")}
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                                style={{ background: r.bg }}>
                                {r.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium mb-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                                    {r.student}
                                </div>
                                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                                    {r.project} · {r.file}
                                </div>
                            </div>
                            <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>{r.time}</div>
                        </div>
                    ))}

                    {REVIEWS.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <i className="ti ti-check" aria-hidden="true" style={{ fontSize: "24px", color: "#1D9E75" }} />
                            <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>All reviews done!</div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Quick actions ── */}
            <div className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                <div className="text-sm font-medium mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>
                    Quick actions
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { icon: "ti-code", label: "Review code", path: "/review", color: "#7F77DD", bg: "rgba(127,119,221,0.12)" },
                        { icon: "ti-layout-kanban", label: "View Kanban", path: "/kanban", color: "#5DCAA5", bg: "rgba(29,158,117,0.12)" },
                        { icon: "ti-video", label: "Start call", path: "/video", color: "#FAC775", bg: "rgba(186,117,23,0.12)" },
                        { icon: "ti-briefcase", label: "All portfolios", path: "/portfolio", color: "#E86C6B", bg: "rgba(224,75,74,0.12)" },
                    ].map((a, i) => (
                        <button key={i} onClick={() => navigate(a.path)}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                            style={{ background: a.bg, border: "none", cursor: "pointer" }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                        >
                            <i className={`ti ${a.icon}`} aria-hidden="true" style={{ fontSize: "22px", color: a.color }} />
                            <span className="text-xs font-medium" style={{ color: a.color }}>{a.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}