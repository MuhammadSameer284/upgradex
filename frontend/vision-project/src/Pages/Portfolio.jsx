import { useRef, useState } from "react";
import { usePDF } from "react-to-pdf";

// ─── Data (later comes from backend based on logged-in user) ─────
const STUDENT = {
    name: "Muhammad Sameer",
    initials: "MS",
    role: "MERN Stack Developer",
    batch: "Aptech Batch 42",
    email: "sameer@aptech.com",
    github: "github.com/sameer-ahmed",
    skills: ["React", "Node.js", "MongoDB", "Express", "Socket.io", "Tailwind CSS", "JWT", "REST APIs"],
};

const PROJECTS = [
    {
        id: 1, initials: "EC", name: "E-Commerce Platform",
        desc: "Full-stack online store with cart, payments and order tracking built with MERN stack.",
        tech: ["React", "Node.js", "MongoDB", "Stripe"],
        gradFrom: "#534AB7", gradTo: "#7F77DD",
        bg: "rgba(83,74,183,0.15)", date: "Jun 2026",
        github: "#", demo: "#",
    },
    {
        id: 2, initials: "SP", name: "Student Portal API",
        desc: "REST API for student records, grades and attendance management with JWT authentication.",
        tech: ["Express", "MongoDB", "JWT", "Node.js"],
        gradFrom: "#0F6E56", gradTo: "#1D9E75",
        bg: "rgba(15,110,86,0.15)", date: "May 2026",
        github: "#", demo: "#",
    },
    {
        id: 3, initials: "WA", name: "Weather App",
        desc: "Real-time weather dashboard with 7-day forecast using OpenWeather API.",
        tech: ["React", "OpenWeather API", "Tailwind CSS"],
        gradFrom: "#712B13", gradTo: "#D85A30",
        bg: "rgba(113,43,19,0.15)", date: "Apr 2026",
        github: "#", demo: "#",
    },
    {
        id: 4, initials: "CB", name: "Chat Bot",
        desc: "AI-powered FAQ bot for Aptech student support using OpenAI API.",
        tech: ["Python", "Flask", "OpenAI", "REST API"],
        gradFrom: "#085041", gradTo: "#5DCAA5",
        bg: "rgba(8,80,65,0.15)", date: "Mar 2026",
        github: "#", demo: "#",
    },
    {
        id: 5, initials: "LM", name: "Library Management",
        desc: "Book inventory and borrowing system for Aptech library with admin panel.",
        tech: ["React", "Express", "MySQL"],
        gradFrom: "#633806", gradTo: "#EF9F27",
        bg: "rgba(99,56,6,0.15)", date: "Feb 2026",
        github: "#", demo: "#",
    },
];

const STATS = [
    { value: 5, label: "Projects completed", color: "#AFA9EC" },
    { value: 12, label: "Technologies used", color: "#5DCAA5" },
    { value: 3, label: "Months of learning", color: "#FAC775" },
    { value: 24, label: "Tasks completed", color: "#E86C6B" },
];

// ─── Project Card ─────────────────────────────────────────────────
function ProjectCard({ project }) {
    return (
        <div
            className="rounded-xl overflow-hidden transition-all"
            style={{
                background: "rgba(255,255,255,0.03)",
                border: "0.5px solid rgba(255,255,255,0.07)",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)";
                e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.transform = "none";
            }}
        >
            {/* Banner */}
            <div
                className="h-20 flex items-center justify-center relative overflow-hidden"
                style={{ background: "linear-gradient(135deg,#0d0d1e,#1a1a2e)" }}
            >
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 45% 50%, ${project.bg}, transparent 65%)` }}
                />
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white relative z-10"
                    style={{ background: `linear-gradient(135deg,${project.gradFrom},${project.gradTo})` }}
                >
                    {project.initials}
                </div>
            </div>

            {/* Body */}
            <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                        {project.name}
                    </div>
                    <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1"
                        style={{ background: "rgba(29,158,117,0.12)", color: "#5DCAA5" }}
                    >
                        ✓ Done
                    </span>
                </div>

                <p className="text-[10px] leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {project.desc}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {project.tech.map(t => (
                        <span
                            key={t}
                            className="text-[9px] px-1.5 py-0.5 rounded-full"
                            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
                        >
                            {t}
                        </span>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                        {[
                            { icon: "ti-brand-github", href: project.github, label: "GitHub" },
                            { icon: "ti-external-link", href: project.demo, label: "Live demo" },
                        ].map(l => (
                            <a
                                key={l.icon}
                                href={l.href}
                                aria-label={l.label}
                                className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
                                style={{
                                    background: "rgba(255,255,255,0.05)",
                                    border: "0.5px solid rgba(255,255,255,0.08)",
                                    textDecoration: "none",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(127,119,221,0.15)"; e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                            >
                                <i className={`ti ${l.icon}`} aria-hidden="true" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }} />
                            </a>
                        ))}
                    </div>
                    <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                        {project.date}
                    </span>
                </div>
            </div>
        </div >
    );
}

// ─── Share Modal ─────────────────────────────────────────────────
function ShareModal({ onClose }) {
    const [copied, setCopied] = useState(false);
    const url = "upgradex.app/portfolio/sameer-ahmed";

    const handleCopy = () => {
        navigator.clipboard.writeText(url).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOptions = [
        { icon: "ti-brand-linkedin", label: "LinkedIn" },
        { icon: "ti-brand-github", label: "GitHub" },
        { icon: "ti-mail", label: "Email" },
        { icon: "ti-link", label: "Copy link" },
    ];

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: "rgba(0,0,0,0.65)" }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="w-80 rounded-2xl p-5"
                style={{ background: "#13131f", border: "0.5px solid rgba(255,255,255,0.1)" }}
            >
                <h2 className="text-sm font-medium text-white mb-4">Share your portfolio</h2>

                {/* URL row */}
                <div className="flex gap-2 mb-4">
                    <input
                        readOnly
                        value={url}
                        className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
                        style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "0.5px solid rgba(255,255,255,0.1)",
                            color: "rgba(255,255,255,0.5)",
                        }}
                    />
                    <button
                        onClick={handleCopy}
                        className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                        style={{
                            background: copied ? "rgba(29,158,117,0.2)" : "rgba(127,119,221,0.2)",
                            color: copied ? "#5DCAA5" : "#AFA9EC",
                            border: "none", cursor: "pointer",
                        }}
                    >
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>

                {/* Share options */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {shareOptions.map(o => (
                        <button
                            key={o.label}
                            className="p-3 rounded-xl text-center transition-all"
                            style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "0.5px solid rgba(255,255,255,0.08)",
                                cursor: "pointer",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)"; e.currentTarget.style.background = "rgba(127,119,221,0.06)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                        >
                            <i className={`ti ${o.icon}`} aria-hidden="true" style={{ fontSize: "20px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "4px" }} />
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{o.label}</span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-2 rounded-lg text-xs transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "none", cursor: "pointer" }}
                >
                    Close
                </button>
            </div>
        </div>
    );
}

// ─── Main Portfolio Page ─────────────────────────────────────────
export default function Portfolio() {
    const [showShare, setShowShare] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exported, setExported] = useState(false);
    const { toPDF, targetRef } = usePDF({ filename: "sameer-ahmed-portfolio.pdf" });

    const handleExport = async () => {
        setExporting(true);
        setExported(false);
        await toPDF();
        setExporting(false);
        setExported(true);
        setTimeout(() => setExported(false), 2500);
    };

    return (
        <div className="min-h-screen p-5" style={{ background: "#0a0a14" }}>

            {/* Everything inside targetRef gets exported to PDF */}
            <div ref={targetRef}>

                {/* ── Hero banner ── */}
                <div
                    className="rounded-2xl p-6 mb-4 flex items-center justify-between relative overflow-hidden"
                    style={{
                        background: "rgba(127,119,221,0.07)",
                        border: "0.5px solid rgba(127,119,221,0.15)",
                    }}
                >
                    {/* Decorative orbs */}
                    <div className="absolute pointer-events-none" style={{ width: "180px", height: "180px", borderRadius: "50%", background: "#7F77DD", opacity: 0.05, top: "-60px", right: "80px", filter: "blur(40px)" }} />
                    <div className="absolute pointer-events-none" style={{ width: "120px", height: "120px", borderRadius: "50%", background: "#1D9E75", opacity: 0.06, bottom: "-40px", right: "220px", filter: "blur(30px)" }} />

                    {/* Left — avatar + info */}
                    <div className="flex items-center gap-4 relative z-10">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                            style={{ background: "linear-gradient(135deg,#534AB7,#7F77DD)" }}
                        >
                            {STUDENT.initials}
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-white mb-0.5">{STUDENT.name}</h1>
                            <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                                {STUDENT.role} · {STUDENT.batch}
                            </p>
                            {/* Skills */}
                            <div className="flex flex-wrap gap-1.5">
                                {STUDENT.skills.map(s => (
                                    <span
                                        key={s}
                                        className="text-[10px] px-2 py-0.5 rounded-full"
                                        style={{
                                            background: "rgba(127,119,221,0.15)",
                                            border: "0.5px solid rgba(127,119,221,0.2)",
                                            color: "#AFA9EC",
                                        }}
                                    >
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right — buttons */}
                    <div className="flex flex-col gap-2 relative z-10">
                        <button
                            onClick={() => setShowShare(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white transition-all hover:opacity-90"
                            style={{ background: "linear-gradient(135deg,#7F77DD,#1D9E75)", border: "none", cursor: "pointer" }}
                        >
                            <i className="ti ti-share" aria-hidden="true" style={{ fontSize: "14px" }} />
                            Share portfolio
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all"
                            style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "0.5px solid rgba(255,255,255,0.1)",
                                color: exported ? "#5DCAA5" : "rgba(255,255,255,0.5)",
                                cursor: exporting ? "wait" : "pointer",
                            }}
                        >
                            <i
                                className={`ti ${exporting ? "ti-loader-2" : exported ? "ti-check" : "ti-download"}`}
                                aria-hidden="true"
                                style={{ fontSize: "14px", animation: exporting ? "spin 1s linear infinite" : "none" }}
                            />
                            {exporting ? "Generating..." : exported ? "PDF Ready!" : "Export PDF"}
                        </button>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                    {STATS.map((s, i) => (
                        <div
                            key={i}
                            className="rounded-xl p-4"
                            style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}
                        >
                            <div className="text-2xl font-semibold mb-1" style={{ color: s.color }}>
                                {s.value}
                            </div>
                            <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Projects section ── */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
                        Completed projects
                    </h2>
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                        Auto-generated from UpgradeX
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                    {PROJECTS.map(p => (
                        <ProjectCard key={p.id} project={p} />
                    ))}
                </div>

                {/* ── About / Contact row ── */}
                <div className="grid grid-cols-2 gap-3">

                    {/* About */}
                    <div
                        className="rounded-xl p-4"
                        style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}
                    >
                        <h3 className="text-xs font-medium mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>About</h3>
                        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                            MERN stack developer currently studying at Aptech. Passionate about building
                            real-world web applications and learning modern development practices through
                            hands-on projects in the UpgradeX platform.
                        </p>
                    </div>

                    {/* Contact */}
                    <div
                        className="rounded-xl p-4"
                        style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}
                    >
                        <h3 className="text-xs font-medium mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>Contact</h3>
                        {[
                            { icon: "ti-mail", value: STUDENT.email, label: "Email" },
                            { icon: "ti-brand-github", value: STUDENT.github, label: "GitHub" },
                        ].map(c => (
                            <div key={c.label} className="flex items-center gap-2.5 mb-2.5">
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: "rgba(127,119,221,0.1)" }}
                                >
                                    <i className={`ti ${c.icon}`} aria-hidden="true" style={{ fontSize: "14px", color: "#AFA9EC" }} />
                                </div>
                                <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                                    {c.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
            {/* End of PDF export area */}

            {/* CSS for spin animation */}
            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

            {/* ── Share Modal ── */}
            {showShare && <ShareModal onClose={() => setShowShare(false)} />}
        </div>
    );
}