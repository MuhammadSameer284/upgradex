import { useState } from "react";

const INITIAL_TASKS = [
    { id: 1,  name: "Build auth middleware with JWT",        project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 12", priority: "high", done: false, assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", status: "In Progress" },
    { id: 2,  name: "Design product & order schemas",        project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 13", priority: "med",  done: false, assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", status: "To Do"       },
    { id: 3,  name: "Connect MongoDB Atlas & test CRUD",     project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 11", priority: "high", done: false, assignee: "AR", assigneeBg: "linear-gradient(135deg,#0F6E56,#1D9E75)",  status: "In Progress" },
    { id: 4,  name: "Build product listing page",            project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 15", priority: "med",  done: false, assignee: "SR", assigneeBg: "linear-gradient(135deg,#712B13,#D85A30)",  status: "To Do"       },
    { id: 5,  name: "Setup email notification service",      project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 18", priority: "low",  done: false, assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", status: "Backlog"     },
    { id: 6,  name: "Create wireframes for checkout flow",   project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 14", priority: "low",  done: false, assignee: "SR", assigneeBg: "linear-gradient(135deg,#712B13,#D85A30)",  status: "Backlog"     },
    { id: 7,  name: "Write API documentation",               project: "Student Portal API",  projColor: "#1D9E75", due: "Jun 20", priority: "low",  done: false, assignee: "AR", assigneeBg: "linear-gradient(135deg,#0F6E56,#1D9E75)",  status: "To Do"       },
    { id: 8,  name: "Setup Express server & folder structure",project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 9",  priority: "med",  done: true,  assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", status: "Done"        },
    { id: 9,  name: "Initialize React + Vite frontend",      project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 8",  priority: "med",  done: true,  assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", status: "Done"        },
    { id: 10, name: "Build login & signup pages",            project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 7",  priority: "high", done: true,  assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", status: "Done"        },
    { id: 11, name: "Setup MongoDB connection",              project: "Student Portal API",  projColor: "#1D9E75", due: "Jun 6",  priority: "med",  done: true,  assignee: "AR", assigneeBg: "linear-gradient(135deg,#0F6E56,#1D9E75)",  status: "Done"        },
    { id: 12, name: "Create wireframes for weather UI",      project: "Weather App",         projColor: "#D85A30", due: "Jun 4",  priority: "low",  done: true,  assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", status: "Done"        },
];

const PRIORITY_COLORS = { high: "#E24B4A", med: "#EF9F27", low: "#888780" };

const STATUS_STYLES = {
    Backlog:       { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" },
    "To Do":       { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" },
    "In Progress": { bg: "rgba(186,117,23,0.12)",  color: "#FAC775"               },
    Done:          { bg: "rgba(29,158,117,0.12)",   color: "#5DCAA5"               },
};

// ─── Task Row ─────────────────────────────────────────────────────
function TaskRow({ task, onToggle }) {
    const status = STATUS_STYLES[task.status];

    return (
        <div
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all cursor-pointer"
            style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(127,119,221,0.25)"; e.currentTarget.style.background = "rgba(127,119,221,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";  e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
        >
            {/* Checkbox */}
            <button
                onClick={() => onToggle(task.id)}
                aria-label={task.done ? "Mark incomplete" : "Mark complete"}
                className="w-[18px] h-[18px] rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                    background: task.done ? "rgba(29,158,117,0.2)" : "transparent",
                    border:     task.done ? "0.5px solid rgba(29,158,117,0.4)" : "0.5px solid rgba(255,255,255,0.15)",
                    cursor: "pointer",
                }}
            >
                {task.done && <i className="ti ti-check" aria-hidden="true" style={{ fontSize: "11px", color: "#1D9E75" }} />}
            </button>

            {/* Priority bar */}
            <div
                className="w-[3px] h-8 rounded-full flex-shrink-0"
                style={{ background: PRIORITY_COLORS[task.priority] }}
                title={`${task.priority} priority`}
            />

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
                <div
                    className="text-xs font-medium mb-1"
                    style={{
                        color:          task.done ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.75)",
                        textDecoration: task.done ? "line-through" : "none",
                    }}
                >
                    {task.name}
                </div>
                <div className="flex items-center gap-2.5 text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                    <span
                        className="px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: `${task.projColor}22`, color: task.projColor }}
                    >
                        {task.project}
                    </span>
                    <div className="flex items-center gap-1">
                        <i className="ti ti-calendar" aria-hidden="true" style={{ fontSize: "12px" }} />
                        {task.due}
                    </div>
                </div>
            </div>

            {/* Status pill */}
            <span
                className="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                style={{ background: status.bg, color: status.color }}
            >
                {task.status}
            </span>

            {/* Assignee */}
            <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold text-white flex-shrink-0"
                style={{ background: task.assigneeBg }}
                title={task.assignee}
            >
                {task.assignee}
            </div>
        </div>
    );
}

// ─── Custom Dropdown ──────────────────────────────────────────────
function CustomDropdown({ options, value, onChange }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative mb-3">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs text-white transition-all"
                style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `0.5px solid ${open ? "rgba(127,119,221,0.4)" : "rgba(255,255,255,0.1)"}`,
                    cursor: "pointer",
                }}
            >
                <span>{value}</span>
                <i
                    className="ti ti-chevron-down"
                    aria-hidden="true"
                    style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.3)",
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                    }}
                />
            </button>

            {open && (
                <div
                    className="absolute left-0 right-0 top-full mt-1 rounded-lg overflow-hidden z-50"
                    style={{ background: "#13131f", border: "0.5px solid rgba(255,255,255,0.1)" }}
                >
                    {options.map(opt => (
                        <button
                            key={opt}
                            onClick={() => { onChange(opt); setOpen(false); }}
                            className="w-full flex items-center px-3 py-2 text-xs text-left transition-all"
                            style={{
                                background: value === opt ? "rgba(127,119,221,0.15)" : "transparent",
                                color:      value === opt ? "#AFA9EC" : "rgba(255,255,255,0.5)",
                                border: "none", cursor: "pointer",
                            }}
                            onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                            onMouseLeave={e => { if (value !== opt) e.currentTarget.style.background = "transparent"; }}
                        >
                            {value === opt && (
                                <i className="ti ti-check mr-2" aria-hidden="true" style={{ fontSize: "11px", color: "#AFA9EC" }} />
                            )}
                            {value !== opt && <span className="mr-5" />}
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Tasks Page ──────────────────────────────────────────────
export default function Tasks() {
    const [tasks,     setTasks]     = useState(INITIAL_TASKS);
    const [filter,    setFilter]    = useState("all");
    const [search,    setSearch]    = useState("");
    const [sort,      setSort]      = useState("due");
    const [showModal, setShowModal] = useState(false);
    const [mName,     setMName]     = useState("");
    const [mProject,  setMProject]  = useState("E-Commerce Platform");
    const [mPriority, setMPriority] = useState("med");
    const [mDue,      setMDue]      = useState("");
    const [idCounter, setIdCounter] = useState(13);

    const projectOptions = [
        { name: "E-Commerce Platform", color: "#7F77DD" },
        { name: "Student Portal API",  color: "#1D9E75" },
        { name: "Weather App",         color: "#D85A30" },
    ];

    const handleCreateTask = () => {
        if (!mName.trim()) return;
        const proj = projectOptions.find(p => p.name === mProject);
        const newTask = {
            id:         idCounter,
            name:       mName.trim(),
            project:    mProject,
            projColor:  proj.color,
            due:        mDue || "No date",
            priority:   mPriority,
            done:       false,
            assignee:   "SA",
            assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)",
            status:     "To Do",
        };
        setTasks(prev => [newTask, ...prev]);
        setIdCounter(c => c + 1);
        setMName(""); setMDue(""); setMPriority("med"); setMProject("E-Commerce Platform");
        setShowModal(false);
    };

    const toggleDone = (id) => {
        setTasks(prev => prev.map(t => {
            if (t.id !== id) return t;
            const done = !t.done;
            return { ...t, done, status: done ? "Done" : "To Do" };
        }));
    };

    let visible = tasks.filter(t => {
        if (filter === "pending" && t.done) return false;
        if (filter === "high" && (t.priority !== "high" || t.done)) return false;
        if (filter === "done" && !t.done) return false;
        if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    if (sort === "priority") {
        const order = { high: 0, med: 1, low: 2 };
        visible = [...visible].sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (sort === "project") {
        visible = [...visible].sort((a, b) => a.project.localeCompare(b.project));
    }

    const stats = [
        { value: tasks.length,                                               label: "Total tasks",   color: "#AFA9EC" },
        { value: tasks.filter(t => !t.done).length,                          label: "Pending",       color: "#FAC775" },
        { value: tasks.filter(t => t.priority === "high" && !t.done).length, label: "High priority", color: "#E86C6B" },
        { value: tasks.filter(t => t.done).length,                           label: "Completed",     color: "#5DCAA5" },
    ];

    const filters = [
        { key: "all",     label: "All"          },
        { key: "pending", label: "Pending"       },
        { key: "high",    label: "High priority" },
        { key: "done",    label: "Completed"     },
    ];

    return (
        <div className="min-h-screen p-5 flex flex-col gap-3.5" style={{ background: "#0a0a14" }}>

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-base font-semibold text-white">My Tasks</h1>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                        Across all projects · {tasks.length} total
                    </p>
                </div>
                {/* ✅ Fixed: removed duplicate className attribute */}
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#7F77DD,#1D9E75)", border: "none", cursor: "pointer" }}
                >
                    <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: "14px" }} />
                    New task
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-4 gap-3">
                {stats.map((s, i) => (
                    <div key={i} className="rounded-xl p-3"
                        style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                        <div className="text-xl font-semibold mb-0.5" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Toolbar ── */}
            <div className="flex items-center gap-2 flex-wrap">
                <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-48"
                    style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}
                >
                    <i className="ti ti-search" aria-hidden="true" style={{ fontSize: "15px", color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search tasks..."
                        className="bg-transparent outline-none text-xs w-full"
                        style={{ color: "#fff" }}
                    />
                </div>

                <div className="flex gap-1.5">
                    {filters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className="px-3 py-1.5 rounded-full text-xs transition-all whitespace-nowrap"
                            style={{
                                background: filter === f.key ? "rgba(127,119,221,0.15)" : "rgba(255,255,255,0.04)",
                                border:     filter === f.key ? "0.5px solid rgba(127,119,221,0.35)" : "0.5px solid rgba(255,255,255,0.08)",
                                color:      filter === f.key ? "#AFA9EC" : "rgba(255,255,255,0.35)",
                                cursor: "pointer",
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="px-3 py-2 rounded-lg text-xs outline-none cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
                >
                    <option value="due">Sort: Due date</option>
                    <option value="priority">Sort: Priority</option>
                    <option value="project">Sort: Project</option>
                </select>
            </div>

            {/* ── Task list ── */}
            {visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(127,119,221,0.1)" }}>
                        <i className="ti ti-checklist" aria-hidden="true" style={{ fontSize: "22px", color: "#7F77DD" }} />
                    </div>
                    <div className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>No tasks found</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Try a different filter or search term</div>
                </div>
            ) : (
                <div className="flex flex-col gap-1.5">
                    {visible.map(t => (
                        <TaskRow key={t.id} task={t} onToggle={toggleDone} />
                    ))}
                </div>
            )}

            {/* ── Create Task Modal ── */}
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
                        <h2 className="text-sm font-medium text-white mb-4">Create new task</h2>

                        <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Task name</label>
                        <input
                            type="text"
                            value={mName}
                            onChange={e => setMName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleCreateTask()}
                            placeholder="e.g. Build login page"
                            className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none mb-3"
                            style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
                            autoFocus
                        />

                        <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Project</label>
                        <CustomDropdown
                            options={projectOptions.map(p => p.name)}
                            value={mProject}
                            onChange={setMProject}
                        />

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Priority</label>
                                <CustomDropdown
                                    options={["High", "Medium", "Low"]}
                                    value={mPriority === "high" ? "High" : mPriority === "med" ? "Medium" : "Low"}
                                    onChange={v => setMPriority(v === "High" ? "high" : v === "Medium" ? "med" : "low")}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Due date</label>
                                <input
                                    type="text"
                                    value={mDue}
                                    onChange={e => setMDue(e.target.value)}
                                    placeholder="e.g. Jun 20"
                                    className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none"
                                    style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="py-2 rounded-lg text-xs font-medium"
                                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "none", cursor: "pointer" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateTask}
                                className="py-2 rounded-lg text-xs font-medium text-white hover:opacity-90"
                                style={{ background: "linear-gradient(135deg,#7F77DD,#1D9E75)", border: "none", cursor: "pointer" }}
                            >
                                Create task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
