"use client";

import { useEffect, useState } from "react";
import { CustomFetchMessageObject } from "../lib/imap";
import * as openpgp from "openpgp";
import { Divider } from "primereact/divider";

export default function EncryptedEmail({
  email,
  privateKey,
}: {
  email: CustomFetchMessageObject;
  privateKey: string;
}) {
  const [decryptedMessage, setDecryptedMessage] = useState("Unable to decrypt");

  useEffect(() => {
    const decryptMessage = async () => {
      const pKey = await openpgp.readPrivateKey({
        armoredKey: privateKey,
      });

      const message = await openpgp.readMessage({
        armoredMessage: email.source.text, // parse armored message
      });

      const { data: decrypted, signatures } = await openpgp.decrypt({
        message,
        decryptionKeys: pKey,
      });

      setDecryptedMessage(decrypted);
    };
    decryptMessage();
  });

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="font-bold">From</div>
          <div>{email.envelope.sender.at(0)?.address}</div>
        </div>
        <div className="flex gap-2">
          <div className="font-bold">Subject</div>
          <div>{email.envelope.subject}</div>
        </div>
        <div className="font-bold">Encrypted Text</div>
        <div>{email.source.text}</div>
        <div className="font-bold">Decrypted Text</div>
        <div>{decryptedMessage}</div>
      </div>
      <Divider></Divider>
    </>
  );
}
