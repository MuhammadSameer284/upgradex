import { useRef, useState, useEffect } from "react";
import { usePDF } from "react-to-pdf";
import { useAuth } from "../Context/authContext.jsx";
import { getPortfolios } from "../config/portfolioService.jsx";
import { getUserProfile } from "../config/userService.jsx";
import { getProjects } from '../config/projectService.jsx';

const PROJECTS = [
    { id: 1, initials: "EC", name: "E-Commerce Platform", desc: "Full-stack online store with cart, payments and order tracking built with MERN stack.", tech: ["React", "Node.js", "MongoDB", "Stripe"], gradFrom: "#534AB7", gradTo: "#7F77DD", bg: "rgba(83,74,183,0.15)", date: "Jun 2026", github: "#", demo: "#" },
    { id: 2, initials: "SP", name: "Student Portal API",  desc: "REST API for student records, grades and attendance management with JWT authentication.", tech: ["Express", "MongoDB", "JWT", "Node.js"],  gradFrom: "#0F6E56", gradTo: "#1D9E75", bg: "rgba(15,110,86,0.15)",  date: "May 2026", github: "#", demo: "#" },
    { id: 3, initials: "WA", name: "Weather App",         desc: "Real-time weather dashboard with 7-day forecast using OpenWeather API.",                 tech: ["React", "OpenWeather API", "Tailwind"], gradFrom: "#712B13", gradTo: "#D85A30", bg: "rgba(113,43,19,0.15)", date: "Apr 2026", github: "#", demo: "#" },
    { id: 4, initials: "CB", name: "Chat Bot",            desc: "AI-powered FAQ bot for Aptech student support using OpenAI API.",                        tech: ["Python", "Flask", "OpenAI", "REST API"],gradFrom: "#085041", gradTo: "#5DCAA5", bg: "rgba(8,80,65,0.15)",   date: "Mar 2026", github: "#", demo: "#" },
    { id: 5, initials: "LM", name: "Library Management",  desc: "Book inventory and borrowing system for Aptech library with admin panel.",                tech: ["React", "Express", "MySQL"],            gradFrom: "#633806", gradTo: "#EF9F27", bg: "rgba(99,56,6,0.15)",   date: "Feb 2026", github: "#", demo: "#" },
];

const STATS = [
    { value: 5,  label: "Projects completed", color: "#AFA9EC" },
    { value: 12, label: "Technologies used",  color: "#5DCAA5" },
    { value: 3,  label: "Months of learning", color: "#FAC775" },
    { value: 24, label: "Tasks completed",    color: "#E86C6B" },
];

const SKILLS = ["React", "Node.js", "MongoDB", "Express", "Socket.io", "Tailwind CSS", "JWT", "REST APIs"];

function getInitials(name) {
    if (!name) return "UX";
    return name.split(" ").filter(w => w.length > 0).map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function ProjectCard({ project }) {
    return (
        <div
            className="rounded-xl overflow-hidden transition-all"
            style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "none"; }}
        >
            <div className="h-20 flex items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0d0d1e,#1a1a2e)" }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 45% 50%, ${project.bg}, transparent 65%)` }} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white relative z-10" style={{ background: `linear-gradient(135deg,${project.gradFrom},${project.gradTo})` }}>
                    {project.initials}
                </div>
            </div>
            <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>{project.name}</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1" style={{ background: "rgba(29,158,117,0.12)", color: "#5DCAA5" }}>✓ Done</span>
                </div>
                <p className="text-[10px] leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>{project.desc}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                    {project.tech.map(t => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>{t}</span>
                    ))}
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                        {[
                            { icon: "ti-brand-github", href: project.github, label: "GitHub"    },
                            { icon: "ti-external-link", href: project.demo,  label: "Live demo" },
                        ].map(l => (
                            <a key={l.icon} href={l.href} aria-label={l.label}
                                className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
                                style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.08)", textDecoration: "none" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(127,119,221,0.15)"; e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                            >
                                <i className={`ti ${l.icon}`} aria-hidden="true" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }} />
                            </a>
                        ))}
                    </div>
                    <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>{project.date}</span>
                </div>
            </div>
        </div>
    );
}

function ShareModal({ onClose }) {
    const [copied, setCopied] = useState(false);
    const { user } = useAuth();
    const slug = user?.name?.toLowerCase().replace(/\s+/g, "-") || "user";
    const url  = `upgradex.app/portfolio/${slug}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(url).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: "rgba(0,0,0,0.65)" }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-80 rounded-2xl p-5" style={{ background: "#13131f", border: "0.5px solid rgba(255,255,255,0.1)" }}>
                <h2 className="text-sm font-medium text-white mb-4">Share your portfolio</h2>
                <div className="flex gap-2 mb-4">
                    <input readOnly value={url} className="flex-1 rounded-lg px-3 py-2 text-xs outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }} />
                    <button onClick={handleCopy} className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                        style={{ background: copied ? "rgba(29,158,117,0.2)" : "rgba(127,119,221,0.2)", color: copied ? "#5DCAA5" : "#AFA9EC", border: "none", cursor: "pointer" }}>
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                        { icon: "ti-brand-linkedin", label: "LinkedIn" },
                        { icon: "ti-brand-github",   label: "GitHub"   },
                        { icon: "ti-mail",           label: "Email"    },
                        { icon: "ti-link",           label: "Copy link" },
                    ].map(o => (
                        <button key={o.label} className="p-3 rounded-xl text-center transition-all"
                            style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", cursor: "pointer" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)"; e.currentTarget.style.background = "rgba(127,119,221,0.06)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                        >
                            <i className={`ti ${o.icon}`} aria-hidden="true" style={{ fontSize: "20px", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "4px" }} />
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{o.label}</span>
                        </button>
                    ))}
                </div>
                <button onClick={onClose} className="w-full py-2 rounded-lg text-xs transition-all" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "none", cursor: "pointer" }}>
                    Close
                </button>
            </div>
        </div>
    );
}

// ── Instructor Portfolio View ─────────────────────────────────────
function InstructorPortfolioView({ user }) {
    return (
        <div className="min-h-screen p-5" style={{ background: "#0a0a14" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-base font-semibold text-white">Portfolio</h1>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>Student portfolio overview</p>
                </div>
                <div className="text-[10px] px-3 py-1.5 rounded-lg" style={{ background: "rgba(29,158,117,0.1)", color: "#5DCAA5", border: "0.5px solid rgba(29,158,117,0.2)" }}>
                    <i className="ti ti-eye mr-1" aria-hidden="true" />
                    Instructor view
                </div>
            </div>

            {/* Info banner */}
            <div className="rounded-xl p-5 mb-5 flex items-start gap-4" style={{ background: "rgba(127,119,221,0.06)", border: "0.5px solid rgba(127,119,221,0.15)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(127,119,221,0.12)" }}>
                    <i className="ti ti-briefcase" aria-hidden="true" style={{ fontSize: "20px", color: "#AFA9EC" }} />
                </div>
                <div>
                    <div className="text-sm font-medium text-white mb-1">Portfolio is a student workspace</div>
                    <div className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                        Students build and share their portfolios here. As an instructor, you can review student work via{" "}
                        <span style={{ color: "#AFA9EC" }}>Code Reviews</span> or monitor progress on the{" "}
                        <span style={{ color: "#5DCAA5" }}>Kanban Board</span>.
                    </div>
                </div>
            </div>

            {/* Instructor profile card */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                        style={{ background: "linear-gradient(135deg,#0F6E56,#1D9E75)" }}>
                        {user?.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "IN"}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-white">{user?.name || "Instructor"}</div>
                        <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{user?.email}</div>
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded-full mt-1.5" style={{ background: "rgba(29,158,117,0.12)", color: "#5DCAA5", border: "0.5px solid rgba(29,158,117,0.2)" }}>
                            Instructor
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: "ti-code", label: "Review student code", color: "#AFA9EC", bg: "rgba(127,119,221,0.1)", href: "/review" },
                        { icon: "ti-layout-kanban", label: "View student progress", color: "#5DCAA5", bg: "rgba(29,158,117,0.1)", href: "/kanban" },
                        { icon: "ti-video", label: "Schedule a call", color: "#FAC775", bg: "rgba(186,117,23,0.1)", href: "/video" },
                    ].map((a, i) => (
                        <a key={i} href={a.href}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                            style={{ background: a.bg, textDecoration: "none" }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                        >
                            <i className={`ti ${a.icon}`} aria-hidden="true" style={{ fontSize: "22px", color: a.color }} />
                            <span className="text-xs font-medium text-center" style={{ color: a.color }}>{a.label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function Portfolio() {
    const { user }              = useAuth();
    if (user?.role === "instructor") return <InstructorPortfolioView user={user} />;
    const [showShare, setShowShare] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exported,  setExported]  = useState(false);
    const [projects,  setProjects]  = useState(PROJECTS);
    const [skills,    setSkills]    = useState(SKILLS);
    const [stats,     setStats]     = useState(STATS);
    const [bio,       setBio]       = useState("MERN stack developer studying at Aptech.");
    const [github,    setGithub]    = useState("github.com/sameer-ahmed");
    const { toPDF, targetRef }      = usePDF({ filename: `${user?.name?.toLowerCase().replace(/\s+/g, "-") || "user"}-portfolio.pdf` });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [portfolioRes, profileRes, projectsRes] = await Promise.all([
                    getPortfolios(),
                    getUserProfile(),
                    getProjects()
                ]);

                const completedProjects = projectsRes.data.filter(p => p.status === 'completed');

                if (portfolioRes.data && portfolioRes.data.length > 0) {
                    setProjects(portfolioRes.data);
                    setStats([
                        { value: portfolioRes.data.length, label: "Projects completed", color: "#AFA9EC" },
                        { value: portfolioRes.data.reduce((acc, p) => acc + (p.tech?.length || 0), 0), label: "Technologies used", color: "#5DCAA5" },
                        { value: 3, label: "Months of learning", color: "#FAC775" },
                        { value: 24, label: "Tasks completed", color: "#E86C6B" },
                    ]);
                } else if (completedProjects.length > 0) {
                    const mapped = completedProjects.map(p => ({
                        ...p,
                        id: p._id,
                        date: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recent',
                        github: p.github || '#',
                        demo: p.demo || '#'
                    }));
                    setProjects(mapped);
                    setStats([
                        { value: mapped.length, label: "Projects completed", color: "#AFA9EC" },
                        { value: mapped.reduce((acc, p) => acc + (p.tech?.length || 0), 0), label: "Technologies used", color: "#5DCAA5" },
                        { value: 3, label: "Months of learning", color: "#FAC775" },
                        { value: mapped.length * 5, label: "Tasks completed", color: "#E86C6B" },
                    ]);
                }

                if (profileRes.data) {
                    if (profileRes.data.skills?.length > 0) setSkills(profileRes.data.skills);
                    if (profileRes.data.bio)    setBio(profileRes.data.bio);
                    if (profileRes.data.github) setGithub(profileRes.data.github);
                }
            } catch (err) {
                console.error("Failed to load portfolio data:", err);
            }
        };
        fetchData();
    }, []);

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
            <div ref={targetRef}>

                {/* ── Hero banner ── */}
                <div className="rounded-2xl p-6 mb-4 flex items-center justify-between relative overflow-hidden"
                    style={{ background: "rgba(127,119,221,0.07)", border: "0.5px solid rgba(127,119,221,0.15)" }}>
                    <div className="absolute pointer-events-none" style={{ width: "180px", height: "180px", borderRadius: "50%", background: "#7F77DD", opacity: 0.05, top: "-60px", right: "80px", filter: "blur(40px)" }} />
                    <div className="absolute pointer-events-none" style={{ width: "120px", height: "120px", borderRadius: "50%", background: "#1D9E75", opacity: 0.06, bottom: "-40px", right: "220px", filter: "blur(30px)" }} />

                    <div className="flex items-center gap-4 relative z-10">
                        {/* ✅ Avatar uses real user initials */}
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                            style={{ background: "linear-gradient(135deg,#534AB7,#7F77DD)" }}>
                            {getInitials(user?.name)}
                        </div>
                        <div>
                            {/* ✅ Name from AuthContext */}
                            <h1 className="text-lg font-semibold text-white mb-0.5">{user?.name || "Student"}</h1>
                            <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                                MERN Stack Developer · Aptech Batch 42
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {skills.map(s => (
                                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full"
                                        style={{ background: "rgba(127,119,221,0.15)", border: "0.5px solid rgba(127,119,221,0.2)", color: "#AFA9EC" }}>
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 relative z-10">
                        <button onClick={() => setShowShare(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white transition-all hover:opacity-90"
                            style={{ background: "linear-gradient(135deg,#7F77DD,#1D9E75)", border: "none", cursor: "pointer" }}>
                            <i className="ti ti-share" aria-hidden="true" style={{ fontSize: "14px" }} />
                            Share portfolio
                        </button>
                        <button onClick={handleExport} disabled={exporting}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all"
                            style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)", color: exported ? "#5DCAA5" : "rgba(255,255,255,0.5)", cursor: exporting ? "wait" : "pointer" }}>
                            <i className={`ti ${exporting ? "ti-loader-2" : exported ? "ti-check" : "ti-download"}`} aria-hidden="true"
                                style={{ fontSize: "14px", animation: exporting ? "spin 1s linear infinite" : "none" }} />
                            {exporting ? "Generating..." : exported ? "PDF Ready!" : "Export PDF"}
                        </button>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                    {stats.map((s, i) => (
                        <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                            <div className="text-2xl font-semibold mb-1" style={{ color: s.color }}>{s.value}</div>
                            <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Projects ── */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>Completed projects</h2>
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>Auto-generated from UpgradeX</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {projects.map((p, i) => <ProjectCard key={p._id || p.id || i} project={p} />)}
                </div>

                {/* ── About + Contact ── */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                        <h3 className="text-xs font-medium mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>About</h3>
                        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {bio}
                        </p>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                        <h3 className="text-xs font-medium mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>Contact</h3>
                        {[
                            { icon: "ti-mail",         value: user?.email || "sameer@aptech.com" },
                            { icon: "ti-brand-github", value: github },
                        ].map((c, i) => (
                            <div key={i} className="flex items-center gap-2.5 mb-2.5">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(127,119,221,0.1)" }}>
                                    <i className={`ti ${c.icon}`} aria-hidden="true" style={{ fontSize: "14px", color: "#AFA9EC" }} />
                                </div>
                                <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{c.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            {showShare && <ShareModal onClose={() => setShowShare(false)} />}
        </div>
    );
}
