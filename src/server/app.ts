import "dotenv/config";
import express from "express";
import ViteExpress from "vite-express";
import { sendMail } from "./mailer.ts";

const app = express();

app.post("/sendmail", async (req, res) => {
  const { sender, encryptedText, receivers } = req.body.data;

  await sendMail(sender, encryptedText, receivers);
  res.end();
});

ViteExpress.listen(app, 3000, () => {
  console.log("Server is listening on port 3000...");
});
