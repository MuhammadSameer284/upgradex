import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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

// ─── Main Kanban Page ────────────────────────────────────────────
export default function Kanban() {
    const [columns, setColumns] = useState(initialColumns);
    const [showModal, setShowModal] = useState(false);
    const [modalCol, setModalCol] = useState("todo");
    const [taskName, setTaskName] = useState("");
    const [taskTag, setTaskTag] = useState("");
    const [activeFilter, setFilter] = useState("All");
    const [taskCount, setTaskCount] = useState(9);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // ── Drag end handler ─────────────────────────────────────────
    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const srcCol = { ...columns[source.droppableId], tasks: [...columns[source.droppableId].tasks] };
        const dstCol = { ...columns[destination.droppableId], tasks: [...columns[destination.droppableId].tasks] };
        const [moved] = srcCol.tasks.splice(source.index, 1);

        // Mark done if dropped into done column
        const updatedTask = { ...moved, done: destination.droppableId === "done" };
        dstCol.tasks.splice(destination.index, 0, updatedTask);

        setColumns(prev => ({
            ...prev,
            [source.droppableId]: srcCol,
            [destination.droppableId]: dstCol,
        }));
    };

    // ── Add task ─────────────────────────────────────────────────
    const handleAddTask = () => {
        if (!taskName.trim()) return;
        const newTask = {
            id: "t" + taskCount,
            name: taskName.trim(),
            desc: "",
            tag: taskTag.trim() || "Task",
            date: "New",
            assignee: "SA",
            assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)",
            done: modalCol === "done",
        };
        setColumns(prev => ({
            ...prev,
            [modalCol]: { ...prev[modalCol], tasks: [...prev[modalCol].tasks, newTask] },
        }));
        setTaskCount(c => c + 1);
        setTaskName("");
        setTaskTag("");
        setShowModal(false);
    };

    const filters = ["All", "My tasks", "High priority", "This week"];

    return (
        <div className="min-h-screen p-5 flex flex-col gap-4" style={{ background: "#0a0a14" }}>

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-base font-semibold text-white">Kanban Board</h1>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                        E-Commerce Platform · Sprint 2
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

                    {/* Project selector */}
                    <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                        style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                    >
                        <i className="ti ti-layout-kanban" aria-hidden="true" style={{ fontSize: "14px" }} />
                        E-Commerce
                        <i className="ti ti-chevron-down" aria-hidden="true" style={{ fontSize: "12px" }} />
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