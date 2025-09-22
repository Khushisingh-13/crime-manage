import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

import clientRoutes from "./routes/client.js";
import generalRoutes from "./routes/general.js";
import managementRoutes from "./routes/management.js";
import reportsRoutes from "./routes/reports.js";
import userRouter from "./routes/userRouter.js";

import User from "./models/User.js";



/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Log the MongoDB URI to check if it's loaded correctly
console.log("MongoDB URI:", 'mongodb+srv://khushisingh7628_db_user:THLTTstGM1H8iif4@crime.xmo78xg.mongodb.net/?retryWrites=true&w=majority&appName=crime');

mongoose.set("strictQuery", false); // Add this line to suppress the warning

/* ROUTES */
app.use("/client", clientRoutes);
app.use("/general", generalRoutes);
app.use("/management", managementRoutes);
app.use("/reports", reportsRoutes);
app.use("/user", userRouter);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 9000;

mongoose
  .connect(
    "mongodb+srv://khushisingh7628_db_user:THLTTstGM1H8iif4@crime.xmo78xg.mongodb.net/?retryWrites=true&w=majority&appName=crime",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    app.listen(PORT, () => console.log(`server port: ${PORT}`));

    /* ONLY ADD DATA ONE TIME */
    // User.insertMany(dataUser);
  })
  .catch((error) => console.log(`${error} did not connect`));
