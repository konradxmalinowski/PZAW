const model = require("../models/productModel");

async function list(req, res) {
    const products = await model.getAll();
    res.status(200).json(products);
}

async function one(req, res) {
    const id = Number(req.params.id);
    const product = await model.getById(id);

    if (!product) {
        return res.status(404).json({ message: "Nie znaleziono produktu" });
    }

    res.status(200).json(product);
}

async function add(req, res) {
    const { name, price } = req.body;

    if (!name || price == null || Number(price) <= 0) {
        return res.status(400).json({ message: "Nieprawidłowe dane" });
    }

    const product = await model.create(name, price);

    res.status(201).json(product);
}

async function edit(req, res) {
    const id = Number(req.params.id);
    const { name, price } = req.body;

    if (!name || price == null || Number(price) <= 0) {
        return res.status(400).json({ message: "Nieprawidłowe dane" });
    }

    const changed = await model.update(id, name, price);

    if (!changed) {
        return res.status(404).json({ message: "Nie znaleziono produktu" });
    }

    res.status(200).json({ message: "Produkt zaktualizowany" });
}

async function remove(req, res) {
    const id = Number(req.params.id);

    const deleted = await model.remove(id);

    if (!deleted) {
        return res.status(404).json({ message: "Nie znaleziono produktu" });
    }

    res.status(200).json({ message: "Produkt usunięty" });
}

async function uploadImage(req, res) {
    const id = Number(req.params.id);

    if (!req.file) {
        return res.status(400).json({ message: "Nie przesłano zdjęcia" });
    }

    const product = await model.getById(id);

    if (!product) {
        return res.status(404).json({ message: "Nie znaleziono produktu" });
    }

    await model.setImage(id, req.file.filename);

    res.status(200).json({
        message: "Zdjęcie dodane",
        filename: req.file.filename
    });
}

module.exports = {
    list,
    one,
    add,
    edit,
    remove,
    uploadImage
};