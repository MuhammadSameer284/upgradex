import { useState, useEffect } from "react";
import { useAuth } from "../Context/authContext.jsx";
import { getTasks, createTask, updateTask, deleteTask } from "../config/taskService.jsx";
import { getProjects } from "../config/projectService.jsx";
import { getInstructorDashboard } from "../config/dashboardService.jsx";

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
function TaskRow({ task, onToggle, onClick }) {
    const status = STATUS_STYLES[task.status];

    return (
        <div
            onClick={onClick}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all cursor-pointer"
            style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(127,119,221,0.25)"; e.currentTarget.style.background = "rgba(127,119,221,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";  e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
        >
            {/* Checkbox */}
            <button
                onClick={(e) => { e.stopPropagation(); onToggle(task._id); }}
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

// ─── Instructor Tasks Overview ───────────────────────────────────
function InstructorTasksView() {
    const [students, setStudents] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [studentTasks, setStudentTasks] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getInstructorDashboard();
                setStudents(res.data.students || []);
            } catch (err) {
                console.error('Failed to load students:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a14" }}>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Loading students...</div>
            </div>
        );
    }

    const statCards = [
        { value: students.length,                                           label: "Enrolled students", color: "#AFA9EC" },
        { value: students.filter(s => s.status === "On track").length,     label: "On track",          color: "#5DCAA5" },
        { value: students.filter(s => s.status === "Review due").length,   label: "Review due",        color: "#FAC775" },
        { value: students.filter(s => s.status === "No project").length,   label: "No project",        color: "#E86C6B" },
    ];

    return (
        <div className="min-h-screen p-5" style={{ background: "#0a0a14" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-base font-semibold text-white">Students Overview</h1>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>Monitor your enrolled students' progress</p>
                </div>
                <div className="text-[10px] px-3 py-1.5 rounded-lg" style={{ background: "rgba(29,158,117,0.1)", color: "#5DCAA5", border: "0.5px solid rgba(29,158,117,0.2)" }}>
                    <i className="ti ti-eye mr-1" aria-hidden="true" />
                    Read-only view
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-4">
                {statCards.map((s, i) => (
                    <div key={i} className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                        <div className="text-2xl font-semibold mb-0.5" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Info banner */}
            <div className="rounded-xl p-4 mb-4 flex items-center gap-3" style={{ background: "rgba(127,119,221,0.06)", border: "0.5px solid rgba(127,119,221,0.15)" }}>
                <i className="ti ti-info-circle" aria-hidden="true" style={{ fontSize: "20px", color: "#AFA9EC", flexShrink: 0 }} />
                <div>
                    <div className="text-xs font-medium text-white mb-0.5">Task management is student-only</div>
                    <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>As an instructor, students manage their own tasks. You can view their projects and code reviews from the sidebar.</div>
                </div>
            </div>

            {/* Students list */}
            {students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(127,119,221,0.1)" }}>
                        <i className="ti ti-users" aria-hidden="true" style={{ fontSize: "22px", color: "rgba(127,119,221,0.5)" }} />
                    </div>
                    <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>No enrolled students</div>
                    <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>Students can enroll by selecting you as their instructor during signup</div>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {students.map((s, i) => (
                        <div key={s._id || i}
                            className="flex items-center gap-3 p-3.5 rounded-xl transition-all"
                            style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(127,119,221,0.25)"; e.currentTarget.style.background = "rgba(127,119,221,0.04)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                        >
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
                                style={{ background: s.bg || "linear-gradient(135deg,#534AB7,#7F77DD)" }}>
                                {s.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>{s.name}</div>
                                <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{s.project}</div>
                            </div>
                            {/* Progress bar */}
                            <div className="flex items-center gap-2" style={{ width: "120px" }}>
                                <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                                    <div className="h-full rounded-full transition-all" style={{ width: `${s.progress}%`, background: "linear-gradient(90deg,#7F77DD,#1D9E75)" }} />
                                </div>
                                <span className="text-[10px] flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>{s.progress}%</span>
                            </div>
                            <span className="text-[10px] px-2.5 py-1 rounded-full flex-shrink-0"
                                style={{
                                    background: s.status === "Completed" ? "rgba(255,255,255,0.06)" : s.status === "Review due" ? "rgba(186,117,23,0.12)" : s.status === "No project" ? "rgba(224,75,74,0.12)" : "rgba(29,158,117,0.12)",
                                    color:      s.status === "Completed" ? "rgba(255,255,255,0.3)"  : s.status === "Review due" ? "#FAC775"                  : s.status === "No project" ? "#E86C6B"               : "#5DCAA5",
                                }}>{s.status}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Tasks Page ──────────────────────────────────────────────
export default function Tasks() {
    const { user } = useAuth();
    if (user?.role === 'instructor') return <InstructorTasksView />;
    const [tasks,     setTasks]     = useState([]);
    const [projects,  setProjects]  = useState([]);
    const [filter,    setFilter]    = useState("all");
    const [search,    setSearch]    = useState("");
    const [sort,      setSort]      = useState("due");
    const [showModal, setShowModal] = useState(false);
    const [mName,     setMName]     = useState("");
    const [mProject,  setMProject]  = useState("E-Commerce Platform");
    const [mPriority, setMPriority] = useState("med");
    const [mDue,      setMDue]      = useState("");

    // Edit state
    const [editTask,      setEditTask]      = useState(null);
    const [eTaskName,     setETaskName]     = useState("");
    const [eTaskProject,  setETaskProject]  = useState("E-Commerce Platform");
    const [eTaskPriority, setETaskPriority] = useState("med");
    const [eTaskDue,      setETaskDue]      = useState("");
    const [eTaskStatus,   setETaskStatus]   = useState("To Do");

    const projectOptions = [
        { name: "E-Commerce Platform", color: "#7F77DD" },
        { name: "Student Portal API",  color: "#1D9E75" },
        { name: "Weather App",         color: "#D85A30" },
    ];

    useEffect(() => {
        const fetchTasksAndProjects = async () => {
            try {
                const [tasksRes, projectsRes] = await Promise.all([
                    getTasks(),
                    getProjects()
                ]);
                setTasks(tasksRes.data);
                setProjects(projectsRes.data);
                if (projectsRes.data && projectsRes.data.length > 0) {
                    setMProject(projectsRes.data[0].name);
                }
            } catch (err) {
                console.error("Failed to load tasks and projects:", err);
            }
        };
        fetchTasksAndProjects();
    }, []);

    const handleCreateTask = async () => {
        if (!mName.trim()) return;
        
        // Find matching project from state or fallback
        const proj = projects.find(p => p.name === mProject) || projectOptions.find(p => p.name === mProject) || { color: "#7F77DD" };
        const projColor = proj.barColor || proj.color || "#7F77DD";

        try {
            const res = await createTask({
                name: mName.trim(),
                project: mProject,
                projColor,
                due: mDue || "No date",
                priority: mPriority,
                status: "To Do"
            });
            setTasks(prev => [res.data, ...prev]);
            setMName(""); setMDue(""); setMPriority("med");
            if (projects.length > 0) {
                setMProject(projects[0].name);
            } else {
                setMProject("E-Commerce Platform");
            }
            setShowModal(false);
        } catch (err) {
            console.error("Failed to create task:", err);
        }
    };

    const toggleDone = async (id) => {
        try {
            const taskToToggle = tasks.find(t => t._id === id);
            if (!taskToToggle) return;
            const updatedDone = !taskToToggle.done;
            const updatedStatus = updatedDone ? "Done" : "To Do";

            await updateTask(id, { done: updatedDone, status: updatedStatus });

            setTasks(prev => prev.map(t => {
                if (t._id !== id) return t;
                return { ...t, done: updatedDone, status: updatedStatus };
            }));
        } catch (err) {
            console.error("Failed to toggle task:", err);
        }
    };

    // ── Select Task for Editing ───────────────────────────────────
    const handleSelectTask = (t) => {
        setEditTask(t);
        setETaskName(t.name);
        setETaskProject(t.project);
        setETaskPriority(t.priority || "med");
        setETaskDue(t.due || "");
        setETaskStatus(t.status || "To Do");
    };

    // ── Update Task ───────────────────────────────────────────────
    const handleUpdateTask = async () => {
        if (!eTaskName.trim()) return;
        const proj = projects.find(p => p.name === eTaskProject) || projectOptions.find(p => p.name === eTaskProject) || { color: "#7F77DD" };
        const projColor = proj.barColor || proj.color || "#7F77DD";
        const isDone = eTaskStatus === "Done";

        try {
            const res = await updateTask(editTask._id, {
                name: eTaskName.trim(),
                project: eTaskProject,
                projColor,
                due: eTaskDue || "No date",
                priority: eTaskPriority,
                status: eTaskStatus,
                done: isDone
            });
            setTasks(prev => prev.map(t => t._id === editTask._id ? res.data : t));
            setEditTask(null);
        } catch (err) {
            console.error("Failed to update task:", err);
        }
    };

    // ── Delete Task ───────────────────────────────────────────────
    const handleDeleteTask = async () => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteTask(editTask._id);
            setTasks(prev => prev.filter(t => t._id !== editTask._id));
            setEditTask(null);
        } catch (err) {
            console.error("Failed to delete task:", err);
        }
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
                        <TaskRow key={t._id} task={t} onToggle={toggleDone} onClick={() => handleSelectTask(t)} />
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
                            options={projects.length > 0 ? projects.map(p => p.name) : projectOptions.map(p => p.name)}
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

            {/* ── Edit/View Task Modal ── */}
            {editTask && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ background: "rgba(0,0,0,0.65)" }}
                    onClick={e => { if (e.target === e.currentTarget) setEditTask(null); }}
                >
                    <div
                        className="w-80 rounded-2xl p-5"
                        style={{ background: "#12121f", border: "0.5px solid rgba(255,255,255,0.1)" }}
                    >
                        <h2 className="text-sm font-medium text-white mb-4">Edit Task</h2>

                        <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Task name</label>
                        <input
                            type="text"
                            value={eTaskName}
                            onChange={e => setETaskName(e.target.value)}
                            className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none mb-3"
                            style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
                        />

                        <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Project</label>
                        <CustomDropdown
                            options={projects.length > 0 ? projects.map(p => p.name) : projectOptions.map(p => p.name)}
                            value={eTaskProject}
                            onChange={setETaskProject}
                        />

                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Priority</label>
                                <CustomDropdown
                                    options={["High", "Medium", "Low"]}
                                    value={eTaskPriority === "high" ? "High" : eTaskPriority === "med" ? "Medium" : "Low"}
                                    onChange={v => setETaskPriority(v === "High" ? "high" : v === "Medium" ? "med" : "low")}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Due date</label>
                                <input
                                    type="text"
                                    value={eTaskDue}
                                    onChange={e => setETaskDue(e.target.value)}
                                    placeholder="e.g. Jun 20"
                                    className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none"
                                    style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
                                />
                            </div>
                        </div>

                        <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Status</label>
                        <CustomDropdown
                            options={["Backlog", "To Do", "In Progress", "Done"]}
                            value={eTaskStatus}
                            onChange={setETaskStatus}
                        />

                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <button
                                onClick={() => setEditTask(null)}
                                className="py-2 rounded-lg text-xs font-medium"
                                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "none", cursor: "pointer" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateTask}
                                className="py-2 rounded-lg text-xs font-medium text-white hover:opacity-90"
                                style={{ background: "linear-gradient(135deg,#7F77DD,#1D9E75)", border: "none", cursor: "pointer" }}
                            >
                                Save Changes
                            </button>
                        </div>

                        <button
                            onClick={handleDeleteTask}
                            className="w-full mt-2 py-2 rounded-lg text-xs font-medium text-white transition-all hover:bg-opacity-80"
                            style={{ background: "rgba(226,75,74,0.15)", border: "1px solid rgba(226,75,74,0.3)", color: "#E24B4A", cursor: "pointer" }}
                        >
                            Delete Task
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
