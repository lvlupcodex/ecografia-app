//BIENVENIDO SEA USTED AL BACKEND de envio DE CORREOS CON ADJUNTO
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { google } = require("googleapis");
//Gracias a los vídeos de youtube por esto jajaj.
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({

  refresh_token: process.env.REFRESH_TOKEN,

});

async function sendEmail(filePath, originalFilename) {
  try {
    //Recuerda el access token de Google OAuth existe en la documentación
    const accessToken = await oauth2Client.getAccessToken();

    if (!accessToken || !accessToken.token) {
      throw new Error("No se pudo obtener el access token de Google. Actualiza el refresh token.");
    }
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.SENDER_EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token,
        //no con expires porque no funciona, lo he probado y no va.
      },
    });

    const now = new Date().toISOString().replace(/[:.]/g, "-");
    const randomId = crypto.randomBytes(3).toString("hex");

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      //Correo de prueba y easter egg, congratulations.
      to: "lau.ip.dev@gmail.com",
      subject: `ecografia_${now}_${randomId}`,
      text: "Ecografia Veterinarios Harta codigo_0xB1101x1F68abc707",
      attachments: [
        {
          filename: originalFilename,
          path: filePath,
        },
      ],
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("¡Genial! Correo enviado con ", mailOptions.subject);
    return result;
  } catch (error) {
    console.error("¡Nope! Error al enviar correo:", error);
    throw error;
  }
}
//NOOO TE OLVIDES DE ESTA TONTERÍA
module.exports = { sendEmail };
