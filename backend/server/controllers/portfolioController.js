import Portfolio from '../models/portfolioModel.js';

const initialPortfolioSeed = [
    { initials: "EC", name: "E-Commerce Platform", desc: "Full-stack online store with cart, payments and order tracking built with MERN stack.", tech: ["React", "Node.js", "MongoDB", "Stripe"], gradFrom: "#534AB7", gradTo: "#7F77DD", bg: "rgba(83,74,183,0.15)", date: "Jun 2026", github: "#", demo: "#" },
    { initials: "SP", name: "Student Portal API",  desc: "REST API for student records, grades and attendance management with JWT authentication.", tech: ["Express", "MongoDB", "JWT", "Node.js"],  gradFrom: "#0F6E56", gradTo: "#1D9E75", bg: "rgba(15,110,86,0.15)",  date: "May 2026", github: "#", demo: "#" },
    { initials: "WA", name: "Weather App",         desc: "Real-time weather dashboard with 7-day forecast using OpenWeather API.",                 tech: ["React", "OpenWeather API", "Tailwind"], gradFrom: "#712B13", gradTo: "#D85A30", bg: "rgba(113,43,19,0.15)", date: "Apr 2026", github: "#", demo: "#" },
    { initials: "CB", name: "Chat Bot",            desc: "AI-powered FAQ bot for Aptech student support using OpenAI API.",                        tech: ["Python", "Flask", "OpenAI", "REST API"],gradFrom: "#085041", gradTo: "#5DCAA5", bg: "rgba(8,80,65,0.15)",   date: "Mar 2026", github: "#", demo: "#" },
    { initials: "LM", name: "Library Management",  desc: "Book inventory and borrowing system for Aptech library with admin panel.",                tech: ["React", "Express", "MySQL"],            gradFrom: "#633806", gradTo: "#EF9F27", bg: "rgba(99,56,6,0.15)",   date: "Feb 2026", github: "#", demo: "#" },
];

// Get portfolios
export const getPortfolios = async (req, res) => {
    try {
        let portfolios;
        if (req.user.role === 'instructor') {
            // Instructors see all portfolios, or filter by userId in query
            const { studentId } = req.query;
            const filter = studentId ? { userId: studentId } : {};
            portfolios = await Portfolio.find(filter);
        } else {
            // Students see their own portfolios
            portfolios = await Portfolio.find({ userId: req.user.id });
        }

        res.json(portfolios);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Create a portfolio item
export const createPortfolio = async (req, res) => {
    try {
        const { name, desc, tech, github, demo, date } = req.body;
        if (!name) return res.status(400).json({ message: "Project name is required" });

        const newPortfolio = new Portfolio({
            name,
            initials: name.slice(0, 2).toUpperCase(),
            desc: desc || "",
            tech: tech || [],
            gradFrom: "#534AB7",
            gradTo: "#7F77DD",
            bg: "rgba(83,74,183,0.15)",
            date: date || "Jun 2026",
            github: github || "#",
            demo: demo || "#",
            userId: req.user.id
        });

        await newPortfolio.save();
        res.status(201).json(newPortfolio);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update a portfolio item
export const updatePortfolio = async (req, res) => {
    try {
        const { name, desc, tech, github, demo, date } = req.body;
        const portfolio = await Portfolio.findById(req.params.id);
        if (!portfolio) return res.status(404).json({ message: "Portfolio item not found" });

        if (name !== undefined) {
            portfolio.name = name;
            portfolio.initials = name.slice(0, 2).toUpperCase();
        }
        if (desc !== undefined) portfolio.desc = desc;
        if (tech !== undefined) portfolio.tech = tech;
        if (github !== undefined) portfolio.github = github;
        if (demo !== undefined) portfolio.demo = demo;
        if (date !== undefined) portfolio.date = date;

        await portfolio.save();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Delete a portfolio item
export const deletePortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findByIdAndDelete(req.params.id);
        if (!portfolio) return res.status(404).json({ message: "Portfolio item not found" });
        res.json({ message: "Portfolio item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
