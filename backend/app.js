require("dotenv").config();

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { sendEmail } = require("./sendMail");

const app = express();
const PORT = process.env.PORT || 3000;

// Crear carpeta uploads si no existe (para producción como Render)
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 Carpeta 'uploads/' creada");
}

// Permite peticiones JSON y CORS
app.use(express.json());
app.use(cors());

// Sirve los archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Configuración de Multer para la subida de archivos (límite 25MB)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

// Ruta POST para procesar la subida y enviar el email
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se ha subido ningún archivo." });
    }
    const filePath = req.file.path;
    const originalFilename = req.file.originalname;

    // Envía el email con el archivo adjunto
    const result = await sendEmail(filePath, originalFilename);

    // Elimina el archivo temporal después de enviar
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error al eliminar el archivo:", err);
    });

    res.json({ message: "Email enviado correctamente.", result });
  } catch (error) {
    console.error("Error al enviar el email:", error);
    res.status(500).json({ error: "Fallo al enviar el email." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
