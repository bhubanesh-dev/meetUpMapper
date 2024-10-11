// apiRoutes.js
import express from "express";
import { generateLink, submitLink } from "../controllers/linkControllers.js";

const router = express.Router();
let io; // This will be assigned in the main server file

// Assign the socket.io instance for use in submitLink
export const setSocketIO = (socketIO) => {
  io = socketIO;
};

// Route for generating a link
router.post("/app/generate-link", generateLink);

// Route for submitting a link
router.post("/submit-link", submitLink);

export default router;
