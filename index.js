const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const users = require("./routes/users");
const cart = require("./routes/cart");
const order = require("./routes/orders");
const addresses = require("./routes/addresses");



app.use(cors());
app.use(express.json());
app.use("/users",users);
app.use("/cart",cart);
app.use("/order",order);
app.use("/addresses",addresses);


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});