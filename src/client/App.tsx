import axios from "axios";
import { generateKey } from "openpgp/lightweight";
import * as openpgp from "openpgp";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useState } from "react";

function App() {
  const [privateKeyArmored, setPrivateKey] = useState("");
  const [publicKeyArmored, setPublicKey] = useState("");

  async function getKey() {
    const newKeys = await generateKey({
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
      message: plainTextMessage, // input as Message object
      encryptionKeys: publicKey,
      signingKeys: privateKey, // optional
    });
    console.log(encrypted); // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'

    // const message = await openpgp.readMessage({
    //   armoredMessage: encrypted, // parse armored message
    // });
    // const { data: decrypted, signatures } = await openpgp.decrypt({
    //   message,
    //   verificationKeys: publicKey,
    //   decryptionKeys: privateKey,
    // });
    // console.log(decrypted);

    return encrypted;
  }

  async function onSubmit(formData: FormData) {
    const plainText = formData.get("plainText")?.toString();
    if (!plainText) {
      return;
    }
    const encryptedText = encrypt(plainText);

    axios
      .post("/sendmail", {
        data: {
          sender: formData.get("sender"),
          encryptedText: encryptedText,
          receivers: formData.get("receivers"),
        },
      })
      .then((response) => {
        // if (response.status == 200) {
        //   navigate("/thank-you");
        // } else {
        //   toastRef.current!.show({
        //     severity: "error",
        //     summary: "Error",
        //     life: 3000,
        //   });
        // }
        // setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <div>
      <div>
        <div className="max-w-[800px] m-auto">
          <div className="text-2xl my-6">Encrypted Mailer</div>
          <form action={onSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="fname">Sender:</label>
              <InputText id="sender" name="sender"></InputText>
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
        </div>
        <div className="max-w-[800px] m-auto mt-2">
          <Button label="Generate Keys" onClick={getKey}></Button>
          {privateKeyArmored && <div>{privateKeyArmored}</div>}
        </div>
      </div>
    </div>
  );
}

export default App;
