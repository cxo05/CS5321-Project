"use server";

import { FetchMessageObject, ImapFlow } from "imapflow";
import { ParsedMail, simpleParser } from "mailparser";

const USER_NAME = process.env.USER_NAME!;
const PASSWORD = process.env.PASSWORD!;

export interface CustomFetchMessageObject {
  uid: number;
  envelope: FetchMessageObject["envelope"];
  source: ParsedMail;
}

export async function checkForNewEmails(): Promise<CustomFetchMessageObject[]> {
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: USER_NAME,
      pass: PASSWORD,
    },
    logger: false,
  });

  await client.connect();
  console.log("Email Client Connected");
  let lock = await client.getMailboxLock("INBOX");
  let encryptedMessages = [];
  try {
    const unseen = await client.search({
      // seq: "*:2",
      seen: false,
      or: [{ subject: "Encrypted" }],
    }); // Get unseen encrypted emails

    if (unseen.length === 0) {
      console.log("No new emails.");
      return [];
    }

    for await (let msg of client.fetch(unseen, {
      envelope: true,
      source: true,
      bodyStructure: true,
    })) {
      let parsed = await simpleParser(msg.source);

      const newMsg: CustomFetchMessageObject = {
        uid: msg.uid,
        envelope: msg.envelope,
        source: parsed,
      };

      encryptedMessages.push(newMsg);
      // Mark email as read
      // await client.messageFlagsAdd(msg.uid, ["\\Seen"]);
    }
  } catch (err) {
    console.error("Error checking emails:", err);
  } finally {
    lock.release();
  }

  // log out and close connection
  await client
    .logout()
    .then(() => {
      console.log("Logged Out");
    })
    .catch((err) => {
      console.log(err);
    });
  return encryptedMessages;
}
