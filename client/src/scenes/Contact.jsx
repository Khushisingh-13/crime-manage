import React, { useState, useRef } from "react";



export default function Contact({
  // default numbers are placeholders — replace per country/region
  emergencyNumbers = {
    police: "+112", // replace with local police number
    ambulance: "+112",
    fire: "+112",
  },
  // API endpoint to POST SOS data (replace with your backend)
  sosEndpoint = "/api/sos",
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [lastLocation, setLastLocation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const sosButtonRef = useRef(null);

  // helper: call a phone number using tel: (works on mobile devices)
  const callNumber = (num) => {
    // open tel: link — desktop browsers will try to open a softphone app
    window.location.href = `tel:${num}`;
  };

  // request current position with a Promise wrapper
  const getCurrentPosition = (options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }) =>
    new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

  // Send location (or SOS payload) to backend
  const sendLocationToAuthorities = async (position) => {
    setLoading(true);
    setMessage(null);
    try {
      const payload = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        userAgent: navigator.userAgent,
      };

      // call your backend — ensure this endpoint is protected and rate-limited
      const res = await fetch(sosEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // include auth header if needed: 'Authorization': 'Bearer ...'
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server responded with ${res.status}`);
      }

      setLastLocation(payload);
      setMessage("SOS sent — authorities notified.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to send SOS. Please try calling local services.");
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  // Primary handler for SOS button.
  // Gives a small confirmation modal to prevent accidental presses.
  const handleSOS = async () => {
    setModalOpen(true);
  };

  // Called when user confirms modal
  const confirmSOS = async () => {
    setModalOpen(false);
    setLoading(true);
    setMessage(null);

    try {
      const pos = await getCurrentPosition();

      // If Web Share API is available, offer the user to share their location with contacts
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Emergency — please help",
            text: `I'm in an emergency. My location: https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`,
          });
        } catch (shareErr) {
          // user may cancel share — it's okay, continue to send to authorities
          console.info("Share cancelled or failed:", shareErr);
        }
      }

      // Send to the backend
      await sendLocationToAuthorities(pos);
    } catch (err) {
      console.error(err);
      setMessage("Unable to obtain location. Please ensure location services are enabled.");
      setLoading(false);
    }
  };

  // quick action to copy location URL to clipboard
  const copyLocationToClipboard = async () => {
    try {
      const pos = await getCurrentPosition();
      const url = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
      await navigator.clipboard.writeText(url);
      setMessage("Location copied to clipboard.");
      setLastLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
    } catch (err) {
      console.error(err);
      setMessage("Could not copy location — enable location services and allow clipboard access.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-400">Emergency Contacts & SOS</h1>
          <p className="text-sm text-gray-300">Quick access to police, ambulance & location sharing</p>
        </header>

        {/* Card */}
        <section className="bg-gray-900 rounded-2xl shadow-lg p-6 sm:p-8 border border-blue-800/30">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Left column: Quick Calls */}
            <div className="sm:col-span-2">
              <h2 className="text-lg font-semibold text-blue-300 mb-3">Quick Actions</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => callNumber(emergencyNumbers.police)}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-300/30 transition shadow"
                  aria-label="Call Police"
                >
                  <div className="text-xs text-gray-200">Police</div>
                  <div className="text-lg font-bold">{emergencyNumbers.police}</div>
                </button>

                <button
                  onClick={() => callNumber(emergencyNumbers.ambulance)}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-300/30 transition shadow"
                  aria-label="Call Ambulance"
                >
                  <div className="text-xs text-gray-200">Ambulance</div>
                  <div className="text-lg font-bold">{emergencyNumbers.ambulance}</div>
                </button>

                <button
                  onClick={() => callNumber(emergencyNumbers.fire)}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-300/30 transition shadow"
                  aria-label="Call Fire Department"
                >
                  <div className="text-xs text-gray-200">Fire Dept</div>
                  <div className="text-lg font-bold">{emergencyNumbers.fire}</div>
                </button>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={copyLocationToClipboard}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-blue-700 text-blue-200 bg-black/30 hover:bg-black/20 focus:outline-none focus:ring-4 focus:ring-blue-300/20"
                >
                  Copy My Location
                </button>

                <button
                  onClick={() => {
                    // trigger native share if available
                    (async () => {
                      try {
                        const pos = await getCurrentPosition();
                        const url = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
                        if (navigator.share) {
                          await navigator.share({ title: "My location", text: "My current location", url });
                        } else {
                          await navigator.clipboard.writeText(url);
                          setMessage("Location copied to clipboard — share it with your contact.");
                        }
                      } catch (err) {
                        console.error(err);
                        setMessage("Could not share location — enable location services.");
                      }
                    })();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-blue-700 text-blue-200 bg-black/30 hover:bg-black/20 focus:outline-none focus:ring-4 focus:ring-blue-300/20"
                >
                  Share Location
                </button>
              </div>
            </div>

            {/* Right column: SOS button + status */}
            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-300">Hold to confirm</p>
              </div>

              {/* Large SOS button */}
              <button
                ref={sosButtonRef}
                onClick={handleSOS}
                // accessible label
                aria-label="Send SOS"
                className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-red-600 to-blue-600 hover:scale-105 transform transition shadow-2xl flex items-center justify-center"
              >
                <span className="absolute inset-0 rounded-full opacity-30 bg-gradient-to-br from-blue-700 to-black" />
                <span className="relative z-10 text-white text-3xl font-extrabold">SOS</span>
              </button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">Tap to open SOS confirmation</p>
              </div>
            </div>
          </div>

          {/* status / message */}
          <div className="mt-6">
            {loading && (
              <div className="text-sm text-blue-200">Sending SOS…</div>
            )}
            {message && (
              <div className="text-sm text-gray-200 bg-black/40 p-3 rounded-md mt-2">{message}</div>
            )}

            {lastLocation && (
              <div className="mt-3 text-xs text-gray-400">Last sent location: {lastLocation.lat.toFixed(5)}, {lastLocation.lng.toFixed(5)} (±{Math.round(lastLocation.accuracy)}m)</div>
            )}
          </div>
        </section>

        {/* Footer / Safety notes */}
        <footer className="mt-6 text-xs text-gray-500">
          <p>
            This page requests location permission to share your position with emergency services. Replace placeholder
            numbers and integrate a secure backend endpoint to forward the SOS payload.
          </p>
        </footer>
      </div>

      {/* Confirmation Modal (simple, accessible) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setModalOpen(false)} aria-hidden />

          <div
            role="dialog"
            aria-modal="true"
            className="relative max-w-lg w-full bg-gray-900 rounded-xl p-6 border border-blue-800/40 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-blue-200">Confirm SOS</h3>
            <p className="mt-2 text-sm text-gray-300">Are you sure you want to send your location to emergency services?</p>

            <div className="mt-4 flex gap-3 justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-md bg-black/30 border border-gray-700 text-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-300/20"
              >
                Cancel
              </button>

              <button
                onClick={confirmSOS}
                className="px-4 py-2 rounded-md bg-gradient-to-r from-red-600 to-blue-500 text-white font-semibold focus:outline-none focus:ring-4 focus:ring-red-300/20"
              >
                Yes — Send SOS
              </button>
            </div>

            <div className="mt-3 text-xs text-gray-400">
              Tip: If you're on mobile, use the quick call buttons for faster response while the SOS is processed.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
