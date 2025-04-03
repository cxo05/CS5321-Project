import nodemailer from "nodemailer";

const USER_NAME = process.env.USER_NAME;
const PASSWORD = process.env.PASSWORD;

const gmail_transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: USER_NAME,
    pass: PASSWORD,
  },
});

export async function sendMail(
  from: string,
  plainText: string,
  receivers: string
) {
  const bodyText = `
    ${plainText}
  `;

  // send mail with defined transport object
  const info = await gmail_transporter.sendMail({
    from: from, // sender address
    to: receivers.split(","), // list of receivers
    subject: "Encrypted email", // Subject line
    text: bodyText,
  });

  console.log("Message sent: %s", info.messageId);
}
