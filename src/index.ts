require("dotenv").config();
import express from "express";
import router from "./routes";
import path from "path";
import cookieParser from "cookie-parser";
const cors = require("cors");

const app = express();
app.use(cors());

app.use("/static", express.static(path.join(__dirname, "../", "static")));
app.use(cookieParser());
app.use("/", router);
app.set("view engine", "ejs");

app.listen(process.env.PORT ?? 3000, () =>
  console.log(`server on http://localhost:${process.env.PORT ?? 3000}`)
);
