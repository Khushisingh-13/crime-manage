import CrimeData from "../models/crimeData.js";
import { iso1A3Code } from "@ideditor/country-coder";
import tryCatch from "./utils/tryCatch.js";
import localData from "../data/index.js"; // ✅ load your local file

// ✅ Get case statistics (Total / Solved / Pending)
// Get case statistics
export const getCaseStats = tryCatch(async (req, res) => {
  const total = await CrimeData.countDocuments();
  const solved = await CrimeData.countDocuments({ status: "Solved" });
  const pending = await CrimeData.countDocuments({ status: "Pending" });

  res.status(200).json({
    success: true,
    stats: { total, solved, pending },
  });
});




// ✅ Get Crime Data with pagination, sorting, and search
export const getCrimeData = tryCatch(async (req, res) => {
  const page = parseInt(req.query.page) || 0;   // 0-based page index
  const pageSize = parseInt(req.query.pageSize) || 20;
  const { sort = "{}", search = "" } = req.query;

  // ✅ Safe sort parsing
  let sortFormatted = {};
  try {
    const sortParsed = JSON.parse(sort);
    if (sortParsed.field) {
      sortFormatted = {
        [sortParsed.field]: sortParsed.sort === "asc" ? 1 : -1,
      };
    }
  } catch (err) {
    sortFormatted = {};
  }

  // ✅ Search filter
  const searchFilter = search
    ? {
        $or: [
          { crm_cd_desc: { $regex: search, $options: "i" } },
          { area_name: { $regex: search, $options: "i" } },
          { premis_desc: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  // ✅ Fetch from MongoDB
  const [crimeData, total] = await Promise.all([
    CrimeData.find(searchFilter)
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize),
    CrimeData.countDocuments(searchFilter),
  ]);

  // ✅ If MongoDB is empty, fallback to local file
  if (total === 0) {
    const filteredLocal = search
      ? localData.filter(
          (item) =>
            item.crm_cd_desc?.toLowerCase().includes(search.toLowerCase()) ||
            item.area_name?.toLowerCase().includes(search.toLowerCase()) ||
            item.premis_desc?.toLowerCase().includes(search.toLowerCase())
        )
      : localData;

    const sortedLocal = sortFormatted.field
      ? [...filteredLocal].sort((a, b) => {
          const field = Object.keys(sortFormatted)[0];
          const order = sortFormatted[field];
          if (a[field] < b[field]) return -1 * order;
          if (a[field] > b[field]) return 1 * order;
          return 0;
        })
      : filteredLocal;

    const paginatedLocal = sortedLocal.slice(
      page * pageSize,
      (page + 1) * pageSize
    );

    return res.status(200).json({
      success: true,
      result: {
        crimeData: paginatedLocal,
        total: sortedLocal.length,
        page,
        pageSize,
        source: "local", // ✅ helpful to know where data came from
      },
    });
  }

  res.status(200).json({
    success: true,
    result: { crimeData, total, page, pageSize, source: "mongodb" },
  });
});

// ✅ Create new crime record
// Create new crime record
export const createCrimeData = tryCatch(async (req, res) => {
 const { status, ...rest } = req.body; // ignore frontend status
const newCrimeData = new CrimeData({
  ...rest,
  uid,
  uName,
  uPhoto,
  status: "Pending",
});


  await newCrimeData.save();

  res.status(201).json({ success: true, result: newCrimeData });
});



// ✅ Delete crime record
export const DeleteCrimeData = tryCatch(async (req, res) => {
  const deleted = await CrimeData.findByIdAndDelete(req.params.crimeDataId);
  if (!deleted) {
    return res.status(404).json({ success: false, message: "Crime data not found" });
  }
  res.status(200).json({ success: true, result: { _id: deleted._id } });
});

// ✅ Update crime record
// server/controllers/client.js
// Update crime status (Pending / Solved)
export const updateCrimeStatus = tryCatch(async (req, res) => {
  const { status } = req.body; 
  const updated = await CrimeData.findByIdAndUpdate(
    req.params.crimeDataId,
    { status },
    { new: true }
  );
  res.status(200).json({ success: true, result: updated });
});




// ✅ Get geography data (simplified, no crg)
export const getGeography = tryCatch(async (req, res) => {
  const crimeData = await CrimeData.find();
  const sourceData = crimeData.length > 0 ? crimeData : localData;

  // ✅ Aggregate by area_name (or area)
  const mappedLocations = sourceData.reduce((acc, { area_name }) => {
    if (!area_name) return acc; // skip if missing
    acc[area_name] = (acc[area_name] || 0) + 1;
    return acc;
  }, {});

  const formattedLocations = Object.entries(mappedLocations).map(
    ([id, value]) => ({ id, value })
  );

  res.status(200).json({ success: true, data: formattedLocations });
});
