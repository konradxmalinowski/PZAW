const express = require("express");
const multer = require("multer");
const controller = require("../controllers/productsController");

const router = express.Router();

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get("/", controller.list);

router.get("/:id", controller.one);

router.post("/", controller.add);

router.put("/:id", controller.edit);

router.delete("/:id", controller.remove);

router.post("/:id/image", upload.single("image"), controller.uploadImage);

module.exports = router;