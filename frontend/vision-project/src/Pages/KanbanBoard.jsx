import { useState, useEffect } from "react";
import { useAuth } from "../Context/authContext.jsx";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getTasks, createTask, updateKanbanDrag } from "../config/taskService.jsx";
import { getProjects } from "../config/projectService.jsx";
import { getInstructorDashboard } from "../config/dashboardService.jsx";

// ─── Initial Data ───────────────────────────────────────────────
const initialColumns = {
    backlog: {
        id: "backlog",
        label: "Backlog",
        dotColor: "#888780",
        labelColor: "rgba(255,255,255,0.5)",
        countBg: "rgba(255,255,255,0.07)",
        countColor: "rgba(255,255,255,0.3)",
        colBg: "rgba(255,255,255,0.02)",
        colBorder: "rgba(255,255,255,0.06)",
        tagBg: "rgba(136,135,128,0.15)",
        tagColor: "#B4B2A9",
        cardBg: "rgba(255,255,255,0.03)",
        tasks: [
            { id: "t5", name: "Create wireframes for checkout flow", desc: "Low-fi screens for cart → payment → confirm", tag: "Design", date: "Jun 14", assignee: "SR", assigneeBg: "#888780" },
            { id: "t6", name: "Setup email notification service", desc: "", tag: "Backend", date: "Jun 18", assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)" },
        ],
    },
    todo: {
        id: "todo",
        label: "To Do",
        dotColor: "#7F77DD",
        labelColor: "#AFA9EC",
        countBg: "rgba(127,119,221,0.15)",
        countColor: "#AFA9EC",
        colBg: "rgba(127,119,221,0.03)",
        colBorder: "rgba(127,119,221,0.1)",
        tagBg: "rgba(127,119,221,0.15)",
        tagColor: "#AFA9EC",
        cardBg: "rgba(127,119,221,0.05)",
        tasks: [
            { id: "t1", name: "Build auth middleware with JWT", desc: "Protect private routes, refresh tokens", tag: "Auth", date: "Jun 12", assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", priority: "high" },
            { id: "t2", name: "Design product & order schemas", desc: "", tag: "Database", date: "Jun 13", assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", priority: "med" },
            { id: "t3", name: "Build product listing page", desc: "", tag: "Frontend", date: "Jun 15", assignee: "SR", assigneeBg: "linear-gradient(135deg,#712B13,#D85A30)" },
        ],
    },
    inprogress: {
        id: "inprogress",
        label: "In Progress",
        dotColor: "#EF9F27",
        labelColor: "#FAC775",
        countBg: "rgba(186,117,23,0.15)",
        countColor: "#FAC775",
        colBg: "rgba(186,117,23,0.03)",
        colBorder: "rgba(186,117,23,0.1)",
        tagBg: "rgba(186,117,23,0.15)",
        tagColor: "#FAC775",
        cardBg: "rgba(186,117,23,0.05)",
        tasks: [
            { id: "t4", name: "Connect MongoDB Atlas & test CRUD", desc: "Users, products, orders collections", tag: "Backend", date: "Jun 11", assignee: "AR", assigneeBg: "linear-gradient(135deg,#0F6E56,#1D9E75)", priority: "high" },
        ],
    },
    done: {
        id: "done",
        label: "Done",
        dotColor: "#1D9E75",
        labelColor: "#5DCAA5",
        countBg: "rgba(29,158,117,0.15)",
        countColor: "#5DCAA5",
        colBg: "rgba(29,158,117,0.03)",
        colBorder: "rgba(29,158,117,0.1)",
        tagBg: "rgba(29,158,117,0.15)",
        tagColor: "#5DCAA5",
        cardBg: "rgba(29,158,117,0.04)",
        tasks: [
            { id: "t7", name: "Setup Express server & folder structure", desc: "", tag: "Setup", date: "Jun 9", assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", done: true },
            { id: "t8", name: "Initialize React + Vite frontend", desc: "", tag: "Setup", date: "Jun 8", assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", done: true },
        ],
    },
};

const COLUMN_ORDER = ["backlog", "todo", "inprogress", "done"];

// ─── Priority dot ────────────────────────────────────────────────
function PriorityDot({ priority }) {
    if (!priority) return null;
    const color = priority === "high" ? "#E24B4A" : "#EF9F27";
    return <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} title={priority + " priority"} />;
}

// ─── Task Card ───────────────────────────────────────────────────
function TaskCard({ task, col, index }) {
    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="rounded-xl p-3 mb-2 transition-all"
                    style={{
                        background: col.cardBg,
                        border: "0.5px solid rgba(255,255,255,0.07)",
                        opacity: task.done ? 0.7 : 1,
                        transform: snapshot.isDragging ? "rotate(2deg) scale(1.02)" : "none",
                        boxShadow: snapshot.isDragging ? "0 8px 24px rgba(0,0,0,0.4)" : "none",
                        cursor: "grab",
                        ...provided.draggableProps.style,
                    }}
                >
                    {/* Tag */}
                    <span
                        className="inline-block text-[10px] px-2 py-0.5 rounded-full mb-2"
                        style={{ background: col.tagBg, color: col.tagColor }}
                    >
                        {task.tag}
                    </span>

                    {/* Name */}
                    <div
                        className="text-xs font-medium mb-1.5 leading-snug"
                        style={{
                            color: task.done ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.75)",
                            textDecoration: task.done ? "line-through" : "none",
                        }}
                    >
                        {task.name}
                    </div>

                    {/* Description */}
                    {task.desc && (
                        <div className="text-[11px] mb-2.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
                            {task.desc}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                                <i className={`ti ${task.done ? "ti-check" : "ti-calendar"}`} aria-hidden="true" style={{ fontSize: "12px" }} />
                                {task.date}
                            </div>
                            <PriorityDot priority={task.priority} />
                        </div>
                        <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-semibold text-white flex-shrink-0"
                            style={{ background: task.assigneeBg }}
                        >
                            {task.assignee}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}

// ─── Instructor Kanban View ──────────────────────────────────
function InstructorKanbanView() {
    const [students, setStudents] = useState([]);
    const [loading,  setLoading]  = useState(true);

    useEffect(() => {
        getInstructorDashboard()
            .then(res => setStudents(res.data.students || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const cols = [
        { label: 'On track',   color: '#5DCAA5', bg: 'rgba(29,158,117,0.08)',  border: 'rgba(29,158,117,0.15)',  students: students.filter(s => s.status === 'On track')   },
        { label: 'Review due', color: '#FAC775', bg: 'rgba(186,117,23,0.08)',  border: 'rgba(186,117,23,0.15)',  students: students.filter(s => s.status === 'Review due') },
        { label: 'Completed',  color: '#AFA9EC', bg: 'rgba(127,119,221,0.08)', border: 'rgba(127,119,221,0.15)', students: students.filter(s => s.status === 'Completed')  },
        { label: 'No project', color: '#E86C6B', bg: 'rgba(224,75,74,0.08)',   border: 'rgba(224,75,74,0.15)',   students: students.filter(s => s.status === 'No project') },
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a14' }}>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading board...</div>
        </div>
    );

    return (
        <div className="min-h-screen p-5 flex flex-col gap-4" style={{ background: '#0a0a14' }}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-base font-semibold text-white">Kanban Board</h1>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Students' project status overview</p>
                </div>
                <div className="text-[10px] px-3 py-1.5 rounded-lg" style={{ background: 'rgba(29,158,117,0.1)', color: '#5DCAA5', border: '0.5px solid rgba(29,158,117,0.2)' }}>
                    <i className="ti ti-eye mr-1" aria-hidden="true" />
                    Read-only · Instructor view
                </div>
            </div>

            {students.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-20 text-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(127,119,221,0.1)' }}>
                        <i className="ti ti-layout-kanban" aria-hidden="true" style={{ fontSize: '22px', color: 'rgba(127,119,221,0.5)' }} />
                    </div>
                    <div className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>No enrolled students yet</div>
                    <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Students who select you during signup will appear here</div>
                </div>
            ) : (
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, 1fr)', flex: 1 }}>
                    {cols.map(col => (
                        <div key={col.label} className="rounded-xl p-3 flex flex-col gap-2" style={{ background: col.bg, border: `0.5px solid ${col.border}` }}>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.color }} />
                                <span className="text-xs font-medium" style={{ color: col.color }}>{col.label}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>{col.students.length}</span>
                            </div>
                            {col.students.map((s, i) => (
                                <div key={s._id || i} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                                            style={{ background: s.bg || 'linear-gradient(135deg,#534AB7,#7F77DD)' }}>
                                            {s.initials}
                                        </div>
                                        <div className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>{s.name}</div>
                                    </div>
                                    <div className="text-[10px] mb-1.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.project}</div>
                                    <div className="w-full h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                        <div style={{ width: `${s.progress}%`, height: '100%', background: col.color, borderRadius: '9px' }} />
                                    </div>
                                    <div className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>{s.progress}% complete</div>
                                </div>
                            ))}
                            {col.students.length === 0 && (
                                <div className="flex-1 flex items-center justify-center py-6 text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>None</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Kanban Page ────────────────────────────────────────────
export default function Kanban() {
    const { user } = useAuth();
    if (user?.role === 'instructor') return <InstructorKanbanView />;
    const [columns, setColumns] = useState({
        backlog: { id: "backlog", label: "Backlog", dotColor: "#888780", labelColor: "rgba(255,255,255,0.5)", countBg: "rgba(255,255,255,0.07)", countColor: "rgba(255,255,255,0.3)", colBg: "rgba(255,255,255,0.02)", colBorder: "rgba(255,255,255,0.06)", tagBg: "rgba(136,135,128,0.15)", tagColor: "#B4B2A9", cardBg: "rgba(255,255,255,0.03)", tasks: [] },
        todo: { id: "todo", label: "To Do", dotColor: "#7F77DD", labelColor: "#AFA9EC", countBg: "rgba(127,119,221,0.15)", countColor: "#AFA9EC", colBg: "rgba(127,119,221,0.03)", colBorder: "rgba(127,119,221,0.1)", tagBg: "rgba(127,119,221,0.15)", tagColor: "#AFA9EC", cardBg: "rgba(127,119,221,0.05)", tasks: [] },
        inprogress: { id: "inprogress", label: "In Progress", dotColor: "#EF9F27", labelColor: "#FAC775", countBg: "rgba(186,117,23,0.15)", countColor: "#FAC775", colBg: "rgba(186,117,23,0.03)", colBorder: "rgba(186,117,23,0.1)", tagBg: "rgba(186,117,23,0.15)", tagColor: "#FAC775", cardBg: "rgba(186,117,23,0.05)", tasks: [] },
        done: { id: "done", label: "Done", dotColor: "#1D9E75", labelColor: "#5DCAA5", countBg: "rgba(29,158,117,0.15)", countColor: "#5DCAA5", colBg: "rgba(29,158,117,0.03)", colBorder: "rgba(29,158,117,0.1)", tagBg: "rgba(29,158,117,0.15)", tagColor: "#5DCAA5", cardBg: "rgba(29,158,117,0.04)", tasks: [] }
    });
    const [allTasks, setAllTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("All");
    const [showModal, setShowModal] = useState(false);
    const [modalCol, setModalCol] = useState("todo");
    const [taskName, setTaskName] = useState("");
    const [taskTag, setTaskTag] = useState("");
    const [activeFilter, setFilter] = useState("All");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [projDropdownOpen, setProjDropdownOpen] = useState(false);

    const getMappedColumns = (flatTasks) => {
        const cols = {
            backlog: { id: "backlog", label: "Backlog", dotColor: "#888780", labelColor: "rgba(255,255,255,0.5)", countBg: "rgba(255,255,255,0.07)", countColor: "rgba(255,255,255,0.3)", colBg: "rgba(255,255,255,0.02)", colBorder: "rgba(255,255,255,0.06)", tagBg: "rgba(136,135,128,0.15)", tagColor: "#B4B2A9", cardBg: "rgba(255,255,255,0.03)", tasks: [] },
            todo: { id: "todo", label: "To Do", dotColor: "#7F77DD", labelColor: "#AFA9EC", countBg: "rgba(127,119,221,0.15)", countColor: "#AFA9EC", colBg: "rgba(127,119,221,0.03)", colBorder: "rgba(127,119,221,0.1)", tagBg: "rgba(127,119,221,0.15)", tagColor: "#AFA9EC", cardBg: "rgba(127,119,221,0.05)", tasks: [] },
            inprogress: { id: "inprogress", label: "In Progress", dotColor: "#EF9F27", labelColor: "#FAC775", countBg: "rgba(186,117,23,0.15)", countColor: "#FAC775", colBg: "rgba(186,117,23,0.03)", colBorder: "rgba(186,117,23,0.1)", tagBg: "rgba(186,117,23,0.15)", tagColor: "#FAC775", cardBg: "rgba(186,117,23,0.05)", tasks: [] },
            done: { id: "done", label: "Done", dotColor: "#1D9E75", labelColor: "#5DCAA5", countBg: "rgba(29,158,117,0.15)", countColor: "#5DCAA5", colBg: "rgba(29,158,117,0.03)", colBorder: "rgba(29,158,117,0.1)", tagBg: "rgba(29,158,117,0.15)", tagColor: "#5DCAA5", cardBg: "rgba(29,158,117,0.04)", tasks: [] }
        };

        flatTasks.forEach(task => {
            let colKey = 'todo';
            if (task.status === 'Backlog') colKey = 'backlog';
            else if (task.status === 'To Do') colKey = 'todo';
            else if (task.status === 'In Progress') colKey = 'inprogress';
            else if (task.status === 'Done') colKey = 'done';

            const dndTask = {
                ...task,
                id: task._id,
                tag: task.priority || "Task",
                date: task.due || "No date"
            };
            cols[colKey].tasks.push(dndTask);
        });

        Object.keys(cols).forEach(k => {
            cols[k].tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
        });

        return cols;
    };

    useEffect(() => {
        const fetchKanbanTasks = async () => {
            try {
                const [tasksRes, projectsRes] = await Promise.all([
                    getTasks(),
                    getProjects()
                ]);
                setAllTasks(tasksRes.data);
                setProjects(projectsRes.data);
            } catch (err) {
                console.error("Failed to load Kanban tasks:", err);
            }
        };
        fetchKanbanTasks();
    }, []);

    useEffect(() => {
        const filteredTasks = allTasks.filter(t => selectedProject === "All" || t.project === selectedProject);
        const mapped = getMappedColumns(filteredTasks);
        setColumns(mapped);
    }, [allTasks, selectedProject]);

    // ── Drag end handler ─────────────────────────────────────────
    const onDragEnd = async (result) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const srcCol = { ...columns[source.droppableId], tasks: [...columns[source.droppableId].tasks] };
        const dstCol = { ...columns[destination.droppableId], tasks: [...columns[destination.droppableId].tasks] };
        const [moved] = srcCol.tasks.splice(source.index, 1);

        // Mark done if dropped into done column
        const updatedTask = { ...moved, done: destination.droppableId === "done" };

        let newStatus = 'To Do';
        if (destination.droppableId === 'backlog') newStatus = 'Backlog';
        else if (destination.droppableId === 'todo') newStatus = 'To Do';
        else if (destination.droppableId === 'inprogress') newStatus = 'In Progress';
        else if (destination.droppableId === 'done') newStatus = 'Done';

        updatedTask.status = newStatus;
        dstCol.tasks.splice(destination.index, 0, updatedTask);

        setColumns(prev => ({
            ...prev,
            [source.droppableId]: srcCol,
            [destination.droppableId]: dstCol,
        }));

        // Sync with allTasks
        setAllTasks(prev => prev.map(t => {
            if (t._id === moved._id) {
                return { ...t, status: newStatus, done: newStatus === 'Done' };
            }
            return t;
        }));

        const bulkTasks = [];
        srcCol.tasks.forEach((t, index) => {
            bulkTasks.push({ _id: t._id, status: t.status, order: index });
        });
        dstCol.tasks.forEach((t, index) => {
            bulkTasks.push({ _id: t._id, status: t.status, order: index });
        });

        try {
            await updateKanbanDrag(bulkTasks);
        } catch (err) {
            console.error("Failed to persist drag reorder:", err);
        }
    };

    // ── Add task ─────────────────────────────────────────────────
    const handleAddTask = async () => {
        if (!taskName.trim()) return;

        let targetStatus = 'To Do';
        if (modalCol === 'backlog') targetStatus = 'Backlog';
        else if (modalCol === 'todo') targetStatus = 'To Do';
        else if (modalCol === 'inprogress') targetStatus = 'In Progress';
        else if (modalCol === 'done') targetStatus = 'Done';

        const defaultProj = projects.length > 0 ? projects[0].name : "E-Commerce Platform";
        const projName = selectedProject === "All" ? defaultProj : selectedProject;

        try {
            const res = await createTask({
                name: taskName.trim(),
                project: projName,
                status: targetStatus,
                priority: taskTag.trim().toLowerCase() || "med"
            });

            setAllTasks(prev => [...prev, res.data]);

            setTaskName("");
            setTaskTag("");
            setShowModal(false);
        } catch (err) {
            console.error("Failed to add task on Kanban:", err);
        }
    };

    const filters = ["All", "My tasks", "High priority", "This week"];

    return (
        <div className="min-h-screen p-5 flex flex-col gap-4" style={{ background: "#0a0a14" }}>

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-base font-semibold text-white">Kanban Board</h1>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                        {selectedProject === "All" ? "All Projects" : selectedProject} · Sprint 2
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Team avatars */}
                    <div className="flex items-center">
                        {[
                            { initials: "SA", bg: "linear-gradient(135deg,#534AB7,#7F77DD)", name: "Sameer" },
                            { initials: "AR", bg: "linear-gradient(135deg,#0F6E56,#1D9E75)", name: "Ali" },
                            { initials: "SR", bg: "linear-gradient(135deg,#712B13,#D85A30)", name: "Sara" },
                        ].map((m, i) => (
                            <div
                                key={i}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white transition-transform hover:scale-110 hover:z-10"
                                style={{ background: m.bg, border: "1.5px solid #0a0a14", marginLeft: i === 0 ? 0 : "-6px" }}
                                title={m.name}
                            >
                                {m.initials}
                            </div>
                        ))}
                    </div>

                    <div className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />

                    {/* Project selector (dynamic) */}
                    <div className="relative">
                        <div
                            onClick={() => setProjDropdownOpen(v => !v)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer select-none"
                            style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                        >
                            <i className="ti ti-layout-kanban" aria-hidden="true" style={{ fontSize: "14px" }} />
                            {selectedProject === "All" ? "All Projects" : selectedProject.length > 12 ? selectedProject.slice(0, 12) + "…" : selectedProject}
                            <i className="ti ti-chevron-down" aria-hidden="true" style={{ fontSize: "12px", transform: projDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                        </div>
                        {projDropdownOpen && (
                            <div
                                className="absolute right-0 top-8 rounded-xl z-30 overflow-hidden"
                                style={{ background: "#13131f", border: "0.5px solid rgba(255,255,255,0.1)", minWidth: "160px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
                            >
                                {["All", ...projects.map(p => p.name)].map(name => (
                                    <button
                                        key={name}
                                        onClick={() => { setSelectedProject(name); setProjDropdownOpen(false); }}
                                        className="w-full text-left px-3 py-2 text-xs transition-all"
                                        style={{
                                            background: selectedProject === name ? "rgba(127,119,221,0.12)" : "transparent",
                                            color: selectedProject === name ? "#AFA9EC" : "rgba(255,255,255,0.5)",
                                            border: "none", cursor: "pointer",
                                            borderLeft: selectedProject === name ? "2px solid #7F77DD" : "2px solid transparent"
                                        }}
                                    >
                                        {name === "All" ? "All Projects" : name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add task */}
                    <button
                        onClick={() => { setModalCol("todo"); setShowModal(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg,#7F77DD,#1D9E75)", border: "none", cursor: "pointer" }}
                    >
                        <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: "14px" }} />
                        Add task
                    </button>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="flex items-center gap-2 flex-wrap">
                {filters.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className="px-3 py-1.5 rounded-full text-xs transition-all"
                        style={{
                            background: activeFilter === f ? "rgba(127,119,221,0.15)" : "rgba(255,255,255,0.04)",
                            border: activeFilter === f ? "0.5px solid rgba(127,119,221,0.35)" : "0.5px solid rgba(255,255,255,0.08)",
                            color: activeFilter === f ? "#AFA9EC" : "rgba(255,255,255,0.35)",
                            cursor: "pointer",
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* ── Board ── */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
                    {COLUMN_ORDER.map(colId => {
                        const col = columns[colId];
                        return (
                            <div
                                key={colId}
                                className="rounded-xl p-3 flex flex-col"
                                style={{
                                    background: col.colBg,
                                    border: `0.5px solid ${col.colBorder}`,
                                    minHeight: "420px",
                                }}
                            >
                                {/* Column header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.dotColor }} />
                                        <span className="text-xs font-medium" style={{ color: col.labelColor }}>{col.label}</span>
                                        <span
                                            className="text-[10px] px-1.5 py-0.5 rounded-full"
                                            style={{ background: col.countBg, color: col.countColor }}
                                        >
                                            {col.tasks.length}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => { setModalCol(colId); setShowModal(true); }}
                                        className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
                                        style={{ background: "transparent", border: "none", cursor: "pointer" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                        aria-label={`Add task to ${col.label}`}
                                    >
                                        <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: "14px", color: "rgba(255,255,255,0.2)" }} />
                                    </button>
                                </div>

                                {/* Droppable area */}
                                <Droppable droppableId={colId}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="flex-1 transition-all rounded-lg"
                                            style={{
                                                background: snapshot.isDraggingOver ? "rgba(127,119,221,0.05)" : "transparent",
                                                minHeight: "60px",
                                            }}
                                        >
                                            {col.tasks.map((task, index) => (
                                                <TaskCard key={task.id} task={task} col={col} index={index} />
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>

                                {/* Add card button */}
                                <button
                                    onClick={() => { setModalCol(colId); setShowModal(true); }}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-all mt-1"
                                    style={{
                                        background: "transparent",
                                        border: "0.5px dashed rgba(255,255,255,0.1)",
                                        color: "rgba(255,255,255,0.2)",
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(127,119,221,0.3)"; e.currentTarget.style.color = "rgba(127,119,221,0.6)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.2)"; }}
                                >
                                    <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: "13px" }} />
                                    Add task
                                </button>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            {/* ── Add Task Modal ── */}
            {showModal && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                    onClick={e => {
                        if (e.target === e.currentTarget) {
                            setShowModal(false);
                            setDropdownOpen(false);
                        }
                    }}
                >
                    <div
                        className="w-80 rounded-2xl p-5"
                        style={{ background: "#13131f", border: "0.5px solid rgba(255,255,255,0.1)" }}
                    >
                        <h2 className="text-sm font-medium text-white mb-4">Add new task</h2>

                        <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Task name</label>
                        <input
                            type="text"
                            value={taskName}
                            onChange={e => setTaskName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleAddTask()}
                            placeholder="e.g. Build login page"
                            className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none mb-3"
                            style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
                            autoFocus
                        />

                        <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Column</label>
                        {/* Custom Column Dropdown */}
                        <div className="relative mb-3">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs text-white transition-all"
                                style={{
                                    background: "rgba(255,255,255,0.05)",
                                    border: "0.5px solid rgba(255,255,255,0.1)",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(127,119,221,0.4)"}
                                onMouseLeave={e => e.currentTarget.style.borderColor = dropdownOpen ? "rgba(127,119,221,0.4)" : "rgba(255,255,255,0.1)"}
                            >
                                <span>{columns[modalCol].label}</span>
                                <i
                                    className="ti ti-chevron-down"
                                    aria-hidden="true"
                                    style={{
                                        fontSize: "13px",
                                        color: "rgba(255,255,255,0.3)",
                                        transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                                        transition: "transform 0.2s",
                                    }}
                                />
                            </button>

                            {dropdownOpen && (
                                <div
                                    className="absolute left-0 right-0 top-full mt-1 rounded-lg overflow-hidden z-50"
                                    style={{
                                        background: "#13131f",
                                        border: "0.5px solid rgba(255,255,255,0.1)",
                                    }}
                                >
                                    {COLUMN_ORDER.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => { setModalCol(c); setDropdownOpen(false); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-all"
                                            style={{
                                                background: modalCol === c ? "rgba(127,119,221,0.15)" : "transparent",
                                                color: modalCol === c ? "#AFA9EC" : "rgba(255,255,255,0.5)",
                                                border: "none",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={e => { if (modalCol !== c) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                                            onMouseLeave={e => { if (modalCol !== c) e.currentTarget.style.background = "transparent"; }}
                                        >
                                            <div
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{ background: columns[c].dotColor }}
                                            />
                                            {columns[c].label}
                                            {modalCol === c && (
                                                <i className="ti ti-check ml-auto" aria-hidden="true" style={{ fontSize: "12px", color: "#AFA9EC" }} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <label className="block text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>Tag</label>
                        <input
                            type="text"
                            value={taskTag}
                            onChange={e => setTaskTag(e.target.value)}
                            placeholder="e.g. Frontend, Backend, Auth"
                            className="w-full rounded-lg px-3 py-2 text-xs text-white outline-none mb-4"
                            style={{ background: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.1)" }}
                        />

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="py-2 rounded-lg text-xs font-medium transition-all"
                                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "none", cursor: "pointer" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddTask}
                                className="py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                                style={{ background: "linear-gradient(135deg,#7F77DD,#1D9E75)", border: "none", cursor: "pointer" }}
                            >
                                Add task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}