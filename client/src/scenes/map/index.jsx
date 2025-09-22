import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { Box, useTheme } from "@mui/material";
import Header from "components/Header";
import Protected from "scenes/protected/Protected";

const getIcon = (count) =>
  L.divIcon({
    html: `<div style="
      background: red; 
      border-radius: 50%; 
      width: ${30 + count}px; 
      height: ${30 + count}px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: white; 
      font-weight: bold;
      border: 2px solid white;
    ">${count}</div>`,
  });

function Map() {
  const theme = useTheme();
  const [clusters, setClusters] = useState([]);
  const currentUser = true; // replace with Redux: useSelector((state) => state.global.currentUser)

  useEffect(() => {
    fetch("http://localhost:9000/client/crime-clusters")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setClusters(data.data);
      });
  }, []);

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="MAP" subtitle="Crime clusters by city/state in India" />
      {currentUser ? (
        <Box
          mt="40px"
          height="75vh"
          border={`1px solid ${theme.palette.secondary[200]}`}
          borderRadius="4px"
        >
          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {clusters.map((cluster) => (
              <Marker
                key={cluster.area_name}
                position={[cluster.lat, cluster.lon]}
                icon={getIcon(cluster.count)}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  {`${cluster.area_name}: ${cluster.count} crimes`}
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </Box>
      ) : (
        <Protected />
      )}
    </Box>
  );
}

export default Map;
