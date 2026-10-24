const pool = require("../db.js");

async function getAll() {
    const [rows] = await pool.query("SELECT * FROM products ORDER BY id");
    return rows;
}

async function getById(id) {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    return rows[0];
}

async function create(name, price) {
    const [result] = await pool.query("INSERT INTO products (name, price) VALUES (?, ?)", [name, price]);
    return await getById(result.insertId);
}

async function update(id, name, price) {
    const [result] = await pool.query("UPDATE products SET name=?, price=? WHERE id = ?", [name, price, id]);
    return result.affectedRows;
}

async function remove(id) {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);
    return result.affectedRows;
}

async function setImage(id, image) {
    const [result] = await pool.query("UPDATE products SET image=? WHERE id=?", [image, id]);
    return result.affectedRows;
}

module.exports = { getAll, getById, create, update, remove, setImage };