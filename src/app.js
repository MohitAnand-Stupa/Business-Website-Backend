const express = require("express");
const app = express();
const routes = require("./routes/post.routes");

app.use(express.json());
app.use("/api/posts", routes);

module.exports = app;
