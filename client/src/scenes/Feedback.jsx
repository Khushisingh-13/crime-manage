// Feedback.jsx
import React, { useState } from "react";

export default function Feedback({ tipsEndpoint = "/api/tips", maxFileMB = 5 }) {
  const [tip, setTip] = useState("");
  const [category, setCategory] = useState("suspicious_activity");
  const [contact, setContact] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [shareLocation, setShareLocation] = useState(false);
  const [location, setLocation] = useState(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);

  const maxBytes = maxFileMB * 1024 * 1024;

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setMessage("Only image files are allowed.");
      return;
    }
    if (f.size > maxBytes) {
      setMessage(`Max ${maxFileMB} MB allowed.`);
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const fetchLocation = async () => {
    if (!("geolocation" in navigator)) {
      setMessage("Location not supported.");
      setShareLocation(false);
      return;
    }
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true })
      );
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
      setMessage(null);
    } catch {
      setMessage("Failed to get location.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tip.trim()) {
      setMessage("Please enter your tip details.");
      return;
    }

    setSending(true);
    try {
      const form = new FormData();
      form.append("tip", tip.trim());
      form.append("category", category);
      form.append("anonymous", isAnonymous ? "true" : "false");
      if (!isAnonymous && contact) form.append("contact", contact);
      if (file) form.append("attachment", file);
      if (shareLocation && location) {
        form.append("lat", location.lat);
        form.append("lng", location.lng);
      }

      const res = await fetch(tipsEndpoint, { method: "POST", body: form });
      if (!res.ok) throw new Error("Server error");

      setTip("");
      setContact("");
      setFile(null);
      setPreviewUrl(null);
      setShareLocation(false);
      setLocation(null);
      setMessage("✅ Tip submitted successfully!");
    } catch (err) {
      setMessage("❌ Submission failed. Try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-[#0b0b0b] border border-blue-700 rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-semibold text-blue-500 mb-2">Submit an Anonymous Tip</h2>
        <p className="text-sm text-gray-300 mb-6">
          Provide details about suspicious or criminal activity. Your identity will remain anonymous.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-black border border-blue-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="suspicious_activity">Suspicious Activity</option>
              <option value="violence">Violence / Assault</option>
              <option value="theft">Theft / Robbery</option>
              <option value="drugs">Drugs / Narcotics</option>
              <option value="traffic">Traffic / Hit & Run</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Tip */}
          <div>
            <label className="block text-sm mb-1">Tip Details *</label>
            <textarea
              rows={5}
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              className="w-full bg-black border border-blue-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what you witnessed..."
            />
          </div>

          {/* Anonymous + contact */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => {
                  setIsAnonymous(e.target.checked);
                  if (e.target.checked) setContact("");
                }}
                className="accent-blue-600"
              />
              <span className="text-sm">Submit anonymously</span>
            </label>

            {!isAnonymous && (
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Your contact (optional)"
                className="flex-1 bg-black border border-blue-700 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm mb-1">Attachment (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm text-gray-300"
            />
            {previewUrl && (
              <div className="mt-3">
                <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg border border-blue-700" />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                  className="text-xs text-red-400 underline mt-1"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={shareLocation}
              onChange={async (e) => {
                setShareLocation(e.target.checked);
                if (e.target.checked) await fetchLocation();
              }}
              className="accent-blue-600"
            />
            <span className="text-sm">Share my current location</span>
          </div>

          {/* Message */}
          {message && (
            <div className="text-sm text-blue-400 bg-[#111] border border-blue-700 rounded-md p-2 text-center">
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={sending}
            className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition text-white font-medium disabled:opacity-50"
          >
            {sending ? "Submitting..." : "Submit Tip"}
          </button>
        </form>
      </div>
    </div>
  );
}
