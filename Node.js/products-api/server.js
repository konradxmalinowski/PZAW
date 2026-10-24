const express = require("express");
const products = require("./routes/products");

const app = express();

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/products", products);

app.use((req, res) => {
    res.status(404).json({ message: "Nie znaleziono endpointu" });
});

app.listen(3000, () => {
    console.log("Serwer działa na http://localhost:3000");
});