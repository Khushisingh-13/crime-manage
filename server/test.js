import mongoose from "mongoose";
import CrimeData from "./models/crimeData.js"; // Adjust path as needed
import crimeData from "./data/index.js"; // Your crime data array

// MongoDB connection URL - replace with your actual connection string
const MONGO_URI = "mongodb+srv://khushisingh7628_db_user:THLTTstGM1H8iif4@crime.xmo78xg.mongodb.net/?retryWrites=true&w=majority&appName=crime";

const importData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Optional: Clear existing data
    await CrimeData.deleteMany({});
    console.log("Existing data cleared");

    // Transform the data to match your schema
    const transformedData = crimeData.map((item) => ({
      dr_no: item.dr_no,
      date_rptd: item.date_rptd,
      date_occ: item.date_occ,
      time_occ: item.time_occ,
      area: item.area,
      area_name: item.area_name,
      rpt_dist_no: item.rpt_dist_no,
      part_1_2: item.part_1_2,
      crm_cd: item.crm_cd,
      crm_cd_desc: item.crm_cd_desc,
      mocodes: item.mocodes,
      vict_age: item.vict_age,
      vict_sex: item.vict_sex,
      vict_descent: item.vict_descent,
      premis_cd: item.premis_cd,
      premis_desc: item.premis_desc,
      weapon_used_cd: item.weapon_used_cd || null,
      weapon_desc: item.weapon_desc || null,
      status: item.status,
      status_desc: item.status_desc,
      crm_cd_1: item.crm_cd_1 || null,
      crm_cd_2: item.crm_cd_2 || null,
      crm_cd_3: null, // Not in your sample data
      crm_cd_4: null, // Not in your sample data
      location: item.location,
      crossStreet: null, // Not in your sample data
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));

    // Insert the transformed data
    const result = await CrimeData.insertMany(transformedData);
    console.log(`${result.length} documents inserted successfully`);

    process.exit(0);
  } catch (error) {
    console.error("Error importing data:", error);
    process.exit(1);
  }
};

importData();
