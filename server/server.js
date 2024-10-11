// server.js
import express from "express";
import http from "http";
import cors from "cors";
import apiRoutes, { setSocketIO } from "./routes/apiRoutes.js";
import { Server } from "socket.io";
import { handleSocketConnection } from "./scoket/socketController.js";

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(cors());

// Use the API routes
app.use("/api", apiRoutes);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});



// Handle socket connections
handleSocketConnection(io);

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
