import React from "react";
import FlexBetween from "components/FlexBetween";
import Header from "components/Header";
import {
  LockOutlined,
  TrendingUpOutlined,
  PointOfSaleOutlined,
  MapOutlined,
  PublicOutlined,
} from "@mui/icons-material";
import { Box, Button, Typography, useTheme, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const theme = useTheme();
  const currentUser = useSelector((state) => state.global.currentUser);
  const isNonMediumScreens = useMediaQuery("(min-width: 1200px)");

  const cardStyle = (gradient) => ({
    background: gradient,
    color: "white",
    p: "2rem",
    borderRadius: "1rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
    transition: "all 0.3s ease",
    "&:hover": { transform: "translateY(-5px)", boxShadow: "0 8px 20px rgba(0,0,0,0.25)" },
  });

  return (
    <Box p="2rem" sx={{ minHeight: "100vh", backgroundColor: "#646b85ff" }}>
      {/* Header */}
      <FlexBetween mb="2rem">
        <Header title="HOME" subtitle="Welcome to your Crime Analyzer Dashboard" />
        {!currentUser ? (
          <Button variant="contained" color="primary" startIcon={<LockOutlined />}>
            Login
          </Button>
        ) : (
          <Button variant="contained" color="primary">
            Welcome, {currentUser.name || "User"}
          </Button>
        )}
      </FlexBetween>

      {/* Grid Cards */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="minmax(250px, auto)"
        gap="30px"
        sx={{
          "& > div": { gridColumn: isNonMediumScreens ? undefined : "span 12" },
        }}
      >
        {/* Crime Analysis */}
        <Box gridColumn="span 6" sx={cardStyle("linear-gradient(135deg, #1e3c72, #2a5298)")}>
          <Typography variant="h3" mb={2}>
            Crime Analysis
          </Typography>
          <Typography fontSize="1.1rem">
            Monitor trends, recurring incidents, and crime patterns. Data-driven insights help authorities plan better for safer communities.
          </Typography>
          <TrendingUpOutlined sx={{ fontSize: 80, opacity: 0.7, mt: 3, alignSelf: "center" }} />
        </Box>

        {/* Data Collection */}
        <Box gridColumn="span 6" sx={cardStyle("linear-gradient(135deg, #11998e, #38ef7d)")}>
          <Typography variant="h3" mb={2}>
            Data Collection
          </Typography>
          <Typography fontSize="1.1rem">
            Gather information from service calls, reports, and arrests. Centralized data ensures accurate analysis and actionable insights.
          </Typography>
          <PointOfSaleOutlined sx={{ fontSize: 80, opacity: 0.7, mt: 3, alignSelf: "center" }} />
        </Box>

        {/* Crime Mapping */}
        <Box gridColumn="span 6" sx={cardStyle("linear-gradient(135deg, #ff512f, #dd2476)")}>
          <Typography variant="h3" mb={2}>
            Crime Mapping
          </Typography>
          <Typography fontSize="1.1rem">
            Visualize high-crime zones and hotspots. Plan interventions, monitor risk areas, and allocate resources efficiently.
          </Typography>
          <MapOutlined sx={{ fontSize: 80, opacity: 0.7, mt: 3, alignSelf: "center" }} />
        </Box>

        {/* Analytics */}
        <Box gridColumn="span 6" sx={cardStyle("linear-gradient(135deg, #654ea3, #eaafc8)")}>
          <Typography variant="h3" mb={2}>
            Analytics
          </Typography>
          <Typography fontSize="1.1rem">
            Gain insights on crime patterns and recurring incidents. Make informed decisions to prevent crimes and improve public safety.
          </Typography>
          <TrendingUpOutlined sx={{ fontSize: 80, opacity: 0.7, mt: 3, alignSelf: "center" }} />
        </Box>

        {/* Upcoming Features */}
        <Box gridColumn="span 12" sx={cardStyle("linear-gradient(135deg, #99656eff, #d49e7fff)")}>
          <Typography variant="h3" mb={2}>
            Upcoming Features
          </Typography>
          <Typography fontSize="1.1rem">
            AI-powered crime predictions, real-time alerts, and automated trend detection are coming soon to make crime prevention smarter and faster.
          </Typography>
          <PublicOutlined sx={{ fontSize: 80, opacity: 0.7, mt: 3, alignSelf: "center" }} />
        </Box>
      </Box>

      {/* Call to Action */}
      <Box mt={6} textAlign="center">
        <Typography variant="h4" fontWeight="bold" mb={2}>
          Ready to Improve Public Safety?
        </Typography>

      </Box>
    </Box>
  );
};

export default Dashboard;
