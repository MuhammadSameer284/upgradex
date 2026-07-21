import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects, createProject, updateProject } from "../config/projectService.jsx";
import { useAuth } from "../Context/authContext.jsx";

// ─── Static Data (later this comes from your backend API) ────────
const initialProjects = [
    {
        id: 1, initials: "EC", name: "E-Commerce Platform",
        desc: "Full-stack online store with cart, payments, and order tracking.",
        tech: ["React", "Node.js", "MongoDB", "Stripe"],
        progress: 65, status: "active",
        members: [
            { initials: "MS", bg: "linear-gradient(135deg,#534AB7,#7F77DD)" },
            { initials: "AR", bg: "linear-gradient(135deg,#0F6E56,#1D9E75)" },
            { initials: "SR", bg: "linear-gradient(135deg,#712B13,#D85A30)" },
        ],
        gradFrom: "#534AB7", gradTo: "#7F77DD", barColor: "#7F77DD",
        updated: "2h ago", tasks: 8,
    },
    {
        id: 2, initials: "SP", name: "Student Portal API",
        desc: "REST API for student records, grades, and attendance.",
        tech: ["Express", "MongoDB", "JWT"],
        progress: 40, status: "active",
        members: [
            { initials: "MS", bg: "linear-gradient(135deg,#534AB7,#7F77DD)" },
            { initials: "AR", bg: "linear-gradient(135deg,#0F6E56,#1D9E75)" },
        ],
        gradFrom: "#0F6E56", gradTo: "#1D9E75", barColor: "#1D9E75",
        updated: "5h ago", tasks: 5,
    },
    {
        id: 3, initials: "WA", name: "Weather App",
        desc: "Real-time weather dashboard with 7-day forecast.",
        tech: ["React", "OpenWeather API"],
        progress: 90, status: "review",
        members: [
            { initials: "MS", bg: "linear-gradient(135deg,#534AB7,#7F77DD)" },
        ],
        gradFrom: "#712B13", gradTo: "#D85A30", barColor: "#D85A30",
        updated: "Yesterday", tasks: 2,
    },
    {
        id: 4, initials: "CB", name: "Chat Bot",
        desc: "AI-powered FAQ bot for Aptech student support.",
        tech: ["Python", "Flask", "OpenAI"],
        progress: 100, status: "completed",
        members: [
            { initials: "SR", bg: "linear-gradient(135deg,#712B13,#D85A30)" },
            { initials: "AR", bg: "linear-gradient(135deg,#0F6E56,#1D9E75)" },
        ],
        gradFrom: "#085041", gradTo: "#5DCAA5", barColor: "#5DCAA5",
        updated: "Jun 5", tasks: 0,
    },
    {
        id: 5, initials: "PM", name: "Portfolio Maker",
        desc: "Auto-generate developer portfolios from project data.",
        tech: ["React", "Tailwind"],
        progress: 20, status: "active",
        members: [
            { initials: "MS", bg: "linear-gradient(135deg,#534AB7,#7F77DD)" },
        ],
        gradFrom: "#3C3489", gradTo: "#AFA9EC", barColor: "#AFA9EC",
        updated: "Jun 8", tasks: 12,
    },
    {
        id: 6, initials: "LM", name: "Library Management",
        desc: "Book inventory and borrowing system for Aptech library.",
        tech: ["React", "Express", "MySQL"],
        progress: 100, status: "completed",
        members: [
            { initials: "AR", bg: "linear-gradient(135deg,#0F6E56,#1D9E75)" },
            { initials: "SR", bg: "linear-gradient(135deg,#712B13,#D85A30)" },
        ],
        gradFrom: "#633806", gradTo: "#EF9F27", barColor: "#EF9F27",
        updated: "May 28", tasks: 0,
    },
];

// ─── Status config ───────────────────────────────────────────────
const statusCfg = {
    active: { label: "Active", bg: "rgba(29,158,117,0.12)", color: "#5DCAA5" },
    review: { label: "In Review", bg: "rgba(186,117,23,0.12)", color: "#FAC775" },
    completed: { label: "Completed", bg: "rgba(127,119,221,0.12)", color: "#AFA9EC" },
};

// ─── Gradient pool for new projects ─────────────────────────────
const gradPool = [
    ["#534AB7", "#7F77DD"],
    ["#0F6E56", "#1D9E75"],
    ["#712B13", "#D85A30"],
    ["#3C3489", "#AFA9EC"],
    ["#633806", "#EF9F27"],
];

// ─── Project Card ────────────────────────────────────────────────
function ProjectCard({ project, view, onClick, userRole }) {
    const s = statusCfg[project.status];
    const isGrid = view === "grid";

    return (
        <div
            onClick={onClick}
            className="rounded-2xl p-4 cursor-pointer transition-all flex gap-3"
            style={{
                background: "rgba(255,255,255,0.03)",
                border: "0.5px solid rgba(255,255,255,0.07)",
                flexDirection: isGrid ? "column" : "row",
                alignItems: isGrid ? "stretch" : "center",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)";
                e.currentTarget.style.background = "rgba(127,119,221,0.05)";
                if (isGrid) e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.transform = "none";
            }}
        >
            {/* Top row — avatar + badge */}
            <div className="flex items-start justify-between flex-shrink-0">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg,${project.gradFrom},${project.gradTo})` }}
                >
                    {project.initials}
                </div>
                <div className="flex items-center">
                    {project.isShared && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full ml-2" style={{ background: "rgba(127,119,221,0.12)", color: "#AFA9EC" }}>
                            {userRole === "instructor" ? "Shared" : "📌 Assigned"}
                        </span>
                    )}
                    <span
                        className="text-[10px] px-2 py-0.5 rounded-full ml-2"
                        style={{ background: s.bg, color: s.color }}
                    >
                        {s.label}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.8)" }}>
                    {project.name}
                </div>
                <div className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {project.desc}
                </div>

                {/* Tech tags — grid only */}
                {isGrid && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {project.tech.map(t => (
                            <span
                                key={t}
                                className="text-[10px] px-2 py-0.5 rounded-full"
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    border: "0.5px solid rgba(255,255,255,0.08)",
                                    color: "rgba(255,255,255,0.35)",
                                }}
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                )}

                {/* Progress bar — grid only, not completed */}
                {isGrid && project.status !== "completed" && (
                    <div className="mt-3">
                        <div className="flex justify-between text-[10px] mb-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                        </div>
                        <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                            <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${project.progress}%`, background: project.barColor }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div
                className="flex items-center justify-between flex-shrink-0"
                style={{
                    paddingTop: isGrid ? "10px" : 0,
                    borderTop: isGrid ? "0.5px solid rgba(255,255,255,0.06)" : "none",
                    minWidth: isGrid ? "auto" : "160px",
                }}
            >
                {/* Member avatars */}
                <div className="flex">
                    {project.members.map((m, i) => (
                        <div
                            key={i}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-semibold text-white"
                            style={{
                                background: m.bg,
                                border: "1.5px solid #0a0a14",
                                marginLeft: i === 0 ? 0 : "-5px",
                            }}
                        >
                            {m.initials}
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                        <i className="ti ti-clock" aria-hidden="true" style={{ fontSize: "12px" }} />
                        {project.updated}
                    </div>
                    {!isGrid && (
                        <div className="flex items-center gap-1 text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                            <i className="ti ti-subtask" aria-hidden="true" style={{ fontSize: "12px" }} />
                            {project.tasks} tasks
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Projects Page ──────────────────────────────────────────
export default function Projects() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [view, setView] = useState("grid");
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [mName, setMName] = useState("");
    const [mDesc, setMDesc] = useState("");
    const [mTech, setMTech] = useState("");
    const [mShared, setMShared] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await getProjects();
                setProjects(res.data);
            } catch (err) {
                console.error("Failed to fetch projects:", err);
            }
        };
        fetchProjects();
    }, []);

    // ── Filter + search ────────────────────────────────────────────
    const visible = projects.filter(p => {
        const matchFilter = filter === "all" || p.status === filter;
        const matchSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.desc.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    // ── Create project ─────────────────────────────────────────────
    const handleCreate = async () => {
        if (!mName.trim()) return;
        const tech = mTech.split(",").map(t => t.trim()).filter(Boolean);
        try {
            const res = await createProject({
                name: mName.trim(),
                desc: mDesc.trim(),
                tech: tech.length ? tech : ["React"],
                ...(user?.role === 'instructor' && { isShared: mShared })
            });
            setProjects(prev => [res.data, ...prev]);
            setMName(""); setMDesc(""); setMTech(""); setMShared(false);
            setShowModal(false);
        } catch (err) {
            console.error("Failed to create project:", err);
        }
    };

    const filters = [
        { key: "all", label: "All" },
        { key: "active", label: "Active" },
        { key: "review", label: "In Review" },
        { key: "completed", label: "Completed" },
    ];

    return (
        <div className="min-h-screen p-5 flex flex-col gap-4" style={{ background: "#0a0a14" }}>

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-base font-semibold text-white">Projects</h1>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                        {projects.length} projects · {projects.filter(p => p.status === "active").length} active
                    </p>
                </div>
                {(!user || user.role === 'instructor' || user.role === 'student') && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#7F77DD,#1D9E75)", border: "none", cursor: "pointer" }}
                    >
                        <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: "14px" }} />
                        {user?.role === 'student' ? 'Add Personal Project' : 'New Project'}
                    </button>
                )}
            </div>

            {/* ── Toolbar ── */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-48"
                    style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}
                >
                    <i className="ti ti-search" aria-hidden="true" style={{ fontSize: "15px", color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search projects..."
                        className="bg-transparent outline-none text-xs text-white w-full"
                        style={{ color: "#fff" }}
                    />
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1.5">
                    {filters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className="px-3 py-1.5 rounded-full text-xs transition-all whitespace-nowrap"
                            style={{
                                background: filter === f.key ? "rgba(127,119,221,0.15)" : "rgba(255,255,255,0.04)",
                                border: filter === f.key ? "0.5px solid rgba(127,119,221,0.35)" : "0.5px solid rgba(255,255,255,0.08)",
                                color: filter === f.key ? "#AFA9EC" : "rgba(255,255,255,0.35)",
                                cursor: "pointer",
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Grid / List toggle */}
                <div className="flex rounded-lg overflow-hidden" style={{ border: "0.5px solid rgba(255,255,255,0.08)" }}>
                    {[
                        { key: "grid", icon: "ti-layout-grid" },
                        { key: "list", icon: "ti-list" },
                    ].map(v => (
                        <button
                            key={v.key}
                            onClick={() => setView(v.key)}
                            className="w-8 h-8 flex items-center justify-center transition-all"
                            style={{
                                background: view === v.key ? "rgba(127,119,221,0.15)" : "rgba(255,255,255,0.04)",
                                border: "none",
                                cursor: "pointer",
                            }}
                            aria-label={v.key + " view"}
                        >
                            <i
                                className={`ti ${v.icon}`}
                                aria-hidden="true"
                                style={{ fontSize: "16px", color: view === v.key ? "#AFA9EC" : "rgba(255,255,255,0.3)" }}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Project Grid / List ── */}
            {visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(127,119,221,0.1)" }}
                    >
                        <i className="ti ti-folder-off" aria-hidden="true" style={{ fontSize: "22px", color: "#7F77DD" }} />
                    </div>
                    <div className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>No projects found</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Try a different filter or search term</div>
                </div>
            ) : (
                <div
                    className="gap-3"
                    style={{
                        display: "grid",
                        gridTemplateColumns: view === "grid" ? "repeat(3, minmax(0,1fr))" : "1fr",
                    }}
                >
                    {visible.map(p => (
                        <ProjectCard
                            key={p._id}
                            project={p}
                            view={view}
                            userRole={user?.role}
                            onClick={() => navigate(`/projects`)}
                        />
                    ))}
                </div>
            )}

            {/* ── Create Project Modal ── */}
            {showModal && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ background: "rgba(0,0,0,0.65)" }}
                    onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
                >
                    <div
                        className="w-80 rounded-2xl p-5"
                        style={{ background: "#12121f", border: "0.5px solid rgba(255,255,255,0.1)" }}
                    >
                        <h2 className="text-sm font-medium text-white mb-4">Create new project</h2>

                        {user?.role === 'instructor' && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Share with all students</label>
                            <button
                              type="button"
                              onClick={() => setMShared(!mShared)}
                              style={{
                                width: '38px', height: '22px', borderRadius: '99px', border: 'none', cursor: 'pointer',
                                background: mShared ? 'rgba(29,158,117,0.5)' : 'rgba(255,255,255,0.1)',
                                position: 'relative', flexShrink: 0
                              }}
                            >
                              <div style={{
                                position: 'absolute', width: '16px', height: '16px', borderRadius: '50%',
                                top: '3px', left: mShared ? '19px' : '3px',
                                background: mShared ? '#1D9E75' : '#fff',
                                transition: 'left 0.2s'
                              }} />
                            </button>
                          </div>
                        )}

                        {[
                            { label: "Project name", val: mName, set: setMName, placeholder: "e.g. Student Portal" },
                            { label: "Description", val: mDesc, set: setMDesc, placeholder: "Short description..." },
                            { label: "Tech stack (comma separated)", val: mTech, set: setMTech, placeholder: "React, Node.js, MongoDB" },
                        ].map(f => (
                            <div key={f.label}>
                                <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                                    {f.label}
                                </label>
                                <input
                                    type="text"
                                    value={f.val}
                                    onChange={e => f.set(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleCreate()}
                                    placeholder={f.placeholder}
                                    className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none mb-3"
                                    style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
                                />
                            </div>
                        ))}

                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <button
                                onClick={() => setShowModal(false)}
                                className="py-2 rounded-lg text-xs font-medium transition-all"
                                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "none", cursor: "pointer" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                className="py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                                style={{ background: "linear-gradient(135deg,#7F77DD,#1D9E75)", border: "none", cursor: "pointer" }}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}