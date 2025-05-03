"use client";

import { useEffect, useRef, useState } from "react";
import * as openpgp from "openpgp";
import { checkForNewEmails, CustomFetchMessageObject } from "./lib/imap";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { sendMail } from "./lib/mailer";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import EncryptedEmail from "./components/encryptedEmail";

export default function Home() {
  const [privateKeyArmored, setPrivateKey] = useState("");
  const [publicKeyArmored, setPublicKey] = useState("");
  const [emails, setEmails] = useState<CustomFetchMessageObject[]>([]);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    const runOnce = () => {
      checkForNewEmails().then((data) => setEmails(data));
    };
    runOnce();
    const interval = setInterval(() => {
      checkForNewEmails().then((data) => setEmails(data));
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  async function getKey() {
    const newKeys = await openpgp.generateKey({
      userIDs: [{ name: "Test", email: "test@test.com" }],
    });

    setPrivateKey(newKeys.privateKey);
    setPublicKey(newKeys.publicKey);
  }

  async function encrypt(plainText: string): Promise<string> {
    const plainTextMessage = await openpgp.createMessage({
      text: plainText,
    });

    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });

    const privateKey = await openpgp.readPrivateKey({
      armoredKey: privateKeyArmored,
    });

    const encrypted = await openpgp.encrypt({
      message: plainTextMessage,
      encryptionKeys: publicKey,
      signingKeys: privateKey,
    });
    // console.log(encrypted); // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'

    return encrypted;
  }

  async function onSubmit(formData: FormData) {
    const plainText = formData.get("plainText")?.toString();
    if (!plainText) {
      return;
    }
    const encryptedText = await encrypt(plainText);

    const from = formData.get("sender")?.toString();
    const receivers = formData.get("receivers")?.toString();

    if (!receivers || !from) {
      toast.current?.show({
        severity: "error",
        summary: "Invalid Data",
        detail: "Invalid Data",
        life: 3000,
      });
      return;
    }

    await sendMail(from, encryptedText, receivers)
      .then(() => {
        toast.current?.show({
          severity: "success",
          summary: "Sent",
          detail: "Sent Email",
          life: 3000,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className="flex items-center max-w-screen-xl mx-auto p-4">
      <Toast ref={toast} />
      <div className="grid grid-cols-2 gap-2 w-full">
        <div className="p-8">
          <div className="text-2xl my-6">Encrypted Mailer</div>
          <form action={onSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="fname">From:</label>
              <InputText id="sender" name="sender"></InputText>
              <label htmlFor="fname">To:</label>
              <InputText id="receivers" name="receivers"></InputText>
              <label htmlFor="plainText">Plain Text:</label>
              <InputTextarea id="plainText" name="plainText"></InputTextarea>
              <label htmlFor="plainText">Public Key:</label>
              <InputTextarea
                value={publicKeyArmored}
                onChange={(e) => setPublicKey(e.target.value)}
              ></InputTextarea>
              <Button type="submit" label="Send"></Button>
            </div>
          </form>
          <div className="flex flex-col gap-2 pt-2">
            <label htmlFor="plainText">Private Key:</label>
            <InputTextarea
              value={privateKeyArmored}
              onChange={(e) => setPrivateKey(e.target.value)}
            ></InputTextarea>
          </div>
          <div className="max-w-[800px] m-auto mt-2">
            <Button label="Generate Keys" onClick={getKey}></Button>
          </div>
        </div>
        <Card title="Inbox">
          {emails.map((email) => {
            return (
              <EncryptedEmail
                key={email.uid}
                privateKey={privateKeyArmored}
                email={email}
              ></EncryptedEmail>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
