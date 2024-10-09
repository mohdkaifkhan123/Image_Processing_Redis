const express = require("express");
const connectDB = require("./config/db");
const uploadRoutes = require("./routes/upload");
const statusRoutes = require("./routes/status");

const app = express();
connectDB();

app.use(express.json());

app.use("/api", uploadRoutes);
app.use("/api", statusRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
