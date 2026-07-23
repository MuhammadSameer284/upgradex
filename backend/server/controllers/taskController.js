import Task from '../models/taskModel.js';

const initialTasksSeed = [
    { name: "Build auth middleware with JWT", project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 12", priority: "high", done: false, assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", status: "To Do", order: 0 },
    { name: "Design product & order schemas", project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 13", priority: "med", done: false, assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", status: "To Do", order: 1 },
    { name: "Connect MongoDB Atlas & test CRUD", project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 11", priority: "high", done: false, assignee: "AR", assigneeBg: "linear-gradient(135deg,#0F6E56,#1D9E75)", status: "In Progress", order: 0 },
    { name: "Build product listing page", project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 15", priority: "med", done: false, assignee: "SR", assigneeBg: "linear-gradient(135deg,#712B13,#D85A30)", status: "To Do", order: 2 },
    { name: "Setup email notification service", project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 18", priority: "low", done: false, assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", status: "Backlog", order: 1 },
    { name: "Create wireframes for checkout flow", project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 14", priority: "low", done: false, assignee: "SR", assigneeBg: "linear-gradient(135deg,#712B13,#D85A30)", status: "Backlog", order: 0 },
    { name: "Write API documentation", project: "Student Portal API", projColor: "#1D9E75", due: "Jun 20", priority: "low", done: false, assignee: "AR", assigneeBg: "linear-gradient(135deg,#0F6E56,#1D9E75)", status: "To Do", order: 3 },
    { name: "Setup Express server & folder structure", project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 9", priority: "med", done: true, assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", status: "Done", order: 0 },
    { name: "Initialize React + Vite frontend", project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 8", priority: "med", done: true, assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", status: "Done", order: 1 },
    { name: "Build login & signup pages", project: "E-Commerce Platform", projColor: "#7F77DD", due: "Jun 7", priority: "high", done: true, assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", status: "Done", order: 2 },
    { name: "Setup MongoDB connection", project: "Student Portal API", projColor: "#1D9E75", due: "Jun 6", priority: "med", done: true, assignee: "AR", assigneeBg: "linear-gradient(135deg,#0F6E56,#1D9E75)", status: "Done", order: 3 },
    { name: "Create wireframes for weather UI", project: "Weather App", projColor: "#D85A30", due: "Jun 4", priority: "low", done: true, assignee: "SA", assigneeBg: "linear-gradient(135deg,#534AB7,#7F77DD)", status: "Done", order: 4 },
];

// Get Tasks
export const getTasks = async (req, res) => {
    try {
        let tasks;
        if (req.user.role === 'instructor') {
            const User = (await import('../models/authModel.js')).default;
            const students = await User.find({ instructorId: req.user.id, role: 'student' });
            const studentIds = students.map(s => s._id);
            
            const { studentId } = req.query;
            const filter = studentId ? { userId: studentId } : { userId: { $in: studentIds } };
            tasks = await Task.find(filter).sort({ order: 1 });
        } else {
            // Students see their own tasks
            tasks = await Task.find({ userId: req.user.id }).sort({ order: 1 });
        }

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Create Task
export const createTask = async (req, res) => {
    try {
        const { name, project, projColor, due, priority, status } = req.body;
        if (!name) return res.status(400).json({ message: "Task name is required" });

        // Get max order for sorting
        const count = await Task.countDocuments({ userId: req.user.id, status: status || 'To Do' });

        const User = (await import('../models/authModel.js')).default;
        const user = await User.findById(req.user.id);
        const userName = user ? user.name : "Student";
        const initials = userName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

        const newTask = new Task({
            name,
            project: project || "General",
            projColor: projColor || "#7F77DD",
            due: due || "No due date",
            priority: priority || "low",
            done: status === 'Done' ? true : false,
            assignee: initials,
            assigneeBg: req.user.role === 'instructor' ? "linear-gradient(135deg,#0F6E56,#1D9E75)" : "linear-gradient(135deg,#534AB7,#7F77DD)",
            status: status || 'To Do',
            order: count,
            userId: req.user.id
        });

        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update Task
export const updateTask = async (req, res) => {
    try {
        const { name, project, projColor, due, priority, done, assignee, assigneeBg, status, order } = req.body;
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // Update fields if passed
        if (name !== undefined) task.name = name;
        if (project !== undefined) task.project = project;
        if (projColor !== undefined) task.projColor = projColor;
        if (due !== undefined) task.due = due;
        if (priority !== undefined) task.priority = priority;
        if (done !== undefined) {
            task.done = done;
            // Align status if done
            if (done) task.status = 'Done';
            else if (task.status === 'Done') task.status = 'To Do';
        }
        if (assignee !== undefined) task.assignee = assignee;
        if (assigneeBg !== undefined) task.assigneeBg = assigneeBg;
        if (status !== undefined) {
            task.status = status;
            task.done = (status === 'Done');
        }
        if (order !== undefined) task.order = order;

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Bulk Update Kanban drag and drop order
export const updateKanbanDrag = async (req, res) => {
    try {
        const { tasks } = req.body; // Array of { _id, status, order }
        if (!tasks || !Array.isArray(tasks)) {
            return res.status(400).json({ message: "Tasks array is required" });
        }

        const bulkOps = tasks.map(t => ({
            updateOne: {
                filter: { _id: t._id },
                update: {
                    status: t.status,
                    order: t.order,
                    done: t.status === 'Done'
                }
            }
        }));

        await Task.bulkWrite(bulkOps);
        res.json({ message: "Kanban board updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Delete Task
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
