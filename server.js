require("dotenv").config();
const express = require("express");
const dbConnection = require("./config/dbConnection");
const userRoute = require("./routes/userRoute");
const candidateRoute = require("./routes/candidateRoute");

const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// routes
app.use("/api/users", userRoute);
app.use("/api/candidates", candidateRoute);

app.listen(PORT, () => {
  dbConnection();
  console.log(`listening on http://localhost:${PORT}`);
});
