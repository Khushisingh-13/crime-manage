import React, { useCallback, useEffect, useState } from "react";
import L from "leaflet";
import "./ShowCrimes.css";
import useSupercluster from "use-supercluster";
import { Marker, useMap } from "react-leaflet";

const icons = {};
const fetchIcon = (count, size) => {
  if (!icons[count]) {
    icons[count] = L.divIcon({
      html: `<div class="cluster-marker" style="width: ${size}px; height: ${size}px;">
        ${count}
      </div>`,
    });
  }
  return icons[count];
};

const cuffs = new L.Icon({
  iconUrl: "/handcuffs.svg",
  iconSize: [25, 25],
});

function ShowCrimes({ crimeData }) {
  const maxZoom = 22;
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(5); // start zoomed out for India
  const map = useMap();

  // Fit map to all points
  useEffect(() => {
    if (!crimeData || crimeData.length === 0) return;
    const validPoints = crimeData.filter(c => c.lat && c.lon);
    const latLngs = validPoints.map(c => [parseFloat(c.lat), parseFloat(c.lon)]);
    if (latLngs.length > 0) {
      map.fitBounds(latLngs, { padding: [50, 50] });
    }
  }, [crimeData, map]);

  // update map bounds & zoom
  const updateMap = useCallback(() => {
    if (!map) return;
    const b = map.getBounds();
    setBounds([b.getSouthWest().lng, b.getSouthWest().lat, b.getNorthEast().lng, b.getNorthEast().lat]);
    setZoom(map.getZoom());
  }, [map]);

  useEffect(() => {
    updateMap();
    map.on("move", updateMap);
    return () => map.off("move", updateMap);
  }, [map, updateMap]);

  const points = crimeData
    .filter(c => c.lat && c.lon)
    .map((crime) => ({
      type: "Feature",
      properties: { cluster: false, crimeId: crime._id, category: crime.cd_code },
      geometry: { type: "Point", coordinates: [parseFloat(crime.lon), parseFloat(crime.lat)] },
    }));

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 75, maxZoom: 17 },
  });

  return (
    <>
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const { cluster: isCluster, point_count: pointCount } = cluster.properties;

        if (isCluster) {
          return (
            <Marker
              key={`cluster-${cluster.id}`}
              position={[latitude, longitude]}
              icon={fetchIcon(pointCount, 10 + (pointCount / points.length) * 40)}
              eventHandlers={{
                click: () => {
                  const expansionZoom = Math.min(
                    supercluster.getClusterExpansionZoom(cluster.id),
                    maxZoom
                  );
                  map.setView([latitude, longitude], expansionZoom, { animate: true });
                },
              }}
            />
          );
        }

        return <Marker key={`crime-${cluster.properties.crimeId}`} position={[latitude, longitude]} icon={cuffs} />;
      })}
    </>
  );
}

export default ShowCrimes;
