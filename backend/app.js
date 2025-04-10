//BIENVENIDO SEA USTED AL BACKEND
require("dotenv").config();

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { sendEmail } = require("./sendMail");

const app = express();
const PORT = process.env.PORT || 3000;

//UPDATEEE. PARA RENDER CREAR CARPETA UPLOADSSS
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("Carpetita 'uploads/' creada");
}

//APP USA REQUESTS EN JSON Y CORS! NADA MÁS NADA MENOS.
app.use(express.json());
app.use(cors());

//Decir a APP QUE USE LOS ARCHIVOS DEL FRONT SIN VOLVERSE LOCO
app.use(express.static(path.join(__dirname, "../frontend")));

//Como FILE de PHP pero con Multer para subir archivos maximo 25 MB
//Todo se sube a UPLOADS que se creó antes XD
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  //FILENIME PERSONALIZADO SUPER IMPORTANTE CON RANDOM PARA NO DUPLICADOS
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
    //Si no file guanajo, error 400 guanajada error
    if (!req.file) {
      return res.status(400).json({ error: "No se ha subido ningún archivo. Guanajada Error." });
    }
    const filePath = req.file.path;
    const originalFilename = req.file.originalname;

    //Resultado = espera que se mande el email con el archivo y se ENVIA wiii.
    const result = await sendEmail(filePath, originalFilename);

    //Elimina el archivo temporal después de enviar porque somos pros
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
