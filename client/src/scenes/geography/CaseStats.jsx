import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, LinearProgress, Box } from "@mui/material";
import { useSelector } from "react-redux";

const CaseStats = () => {
  const [stats, setStats] = useState({ total: 0, solved: 0, pending: 0 });
  const crimes = useSelector((state) => state.global.crimeDatas); // redux store

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:9000/client/case-stats");
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (err) {
      console.error("Failed to fetch case stats:", err);
    }
  };

  // Fetch stats on mount and whenever crimes change
  useEffect(() => {
    fetchStats();
  }, [crimes]);

  const solvedPercent = stats.total ? (stats.solved / stats.total) * 100 : 0;

  return (
    <Box display="flex" gap={2}>
      <Card sx={{ flex: 1, bgcolor: "#788379ff" }}>
        <CardContent>
          <Typography variant="h6">Solved Cases</Typography>
          <Typography variant="h4" color="green">{stats.solved}</Typography>
        </CardContent>
      </Card>

      <Card sx={{ flex: 1, bgcolor: "#8d7579ff" }}>
        <CardContent>
          <Typography variant="h6">Pending Cases</Typography>
          <Typography variant="h4" color="red">{stats.pending}</Typography>
        </CardContent>
      </Card>

      <Card sx={{ flex: 1, bgcolor: "#475763ff" }}>
        <CardContent>
          <Typography variant="h6">Total Cases</Typography>
          <Typography variant="h4" color="blue">{stats.total}</Typography>
          <Box mt={2}>
            <LinearProgress variant="determinate" value={solvedPercent} />
            <Typography variant="body2">
              {solvedPercent.toFixed(1)}% solved
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CaseStats;
