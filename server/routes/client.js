import express from "express";
import {
  getCrimeData,
  getGeography,
  createCrimeData,
  DeleteCrimeData,
  updateCrimeStatus,
  getCaseStats
} from "../controllers/client.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ✅ Get all crime data
router.get("/crimedata", getCrimeData);

// ✅ Get aggregated geography data (optional)
router.get("/geography", getGeography);

// ✅ Create new crime record (requires authentication)
router.post("/", auth, createCrimeData);

// ✅ Delete a crime record
router.delete("/:crimeDataId", auth, DeleteCrimeData);

// ✅ Update crime status (solved/pending)
router.put("/crime/:crimeDataId/status", updateCrimeStatus);

// ✅ Get case statistics (total, solved, pending)
router.get("/case-stats", getCaseStats);

export default router;
