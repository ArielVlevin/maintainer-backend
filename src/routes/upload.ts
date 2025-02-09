import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

//  Define a fixed upload folder
const UPLOADS_FOLDER = "uploads/products";

//  Ensure the folder exists
if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
}

//  Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📌 Uploading to:", UPLOADS_FOLDER);
    cb(null, UPLOADS_FOLDER);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// ✅ Multer Middleware (Handles Single File Upload)
const upload = multer({ storage });

// ✅ Image Upload Route
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const fileUrl = `/uploads/products/${req.file.filename}`;

  res.json({ imageUrl: fileUrl });
});

export default router;
