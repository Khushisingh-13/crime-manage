// server/routes/crime.js
import express from "express";
import { crimeData } from "../data/crimeData.js";

const router = express.Router();

router.get("/all", (req, res) => {
  res.json(crimeData); // ye frontend ko bhej dega
});

export default router;
