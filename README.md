# CS5321 Project

## A security analysis of the Simple Mail Transfer Protocol with email encryption using PGP

We explored the software implementation of an email encryption and delivery program available through the browser with a local backend server, using the Pretty Good Privacy (PGP) protocol for encryption. Through the implementation, we analyze the limitations of the simple mail transfer protocol (SMTP), discuss some practical challenges with mail encryption and outline some future work.

The web application is built using [Next.js](https://nextjs.org/). The current configuration uses Gmail as the mail provider.

**Note**: Only emails with the subject line "Encrypted" will be retrieved and decrypted. Emails sent using this client will automatically add this subject line.

The following key libraries are used for the implementation

- [OpenPGP.js](github.com/openpgpjs/openpgpjs) - Key generation / PGP Encryption
- [nodemailer](github.com/nodemailer/nodemailer) - Sending of emails to mail server
- [imapflow](github.com/postalsys/imapflow) - Retrieval of email from mail server

## Getting Started

Install dependencies

```bash
npm install
# or
bun install
```

Add environment variables to .env in root folder

```bash
# For Gmail, this is your email
USER_NAME="example@gmail.com"
# For Gmail, this is your app password, see https://support.google.com/mail/answer/185833?hl=en
PASSWORD="AAAA BBBB CCCC DDDD"
```

For further configuration such as SMTP servers, see

- ImapFlow object: [imap.ts](src/app/lib/imap.ts)
- Nodemailer transporter: [mailer.ts](src/app/lib/mailer.ts)

Run the development server:

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
