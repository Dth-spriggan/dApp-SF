import axios from "axios";
import FormData from "form-data";
import fs from "fs";

async function main() {

  const form = new FormData();

  form.append("address", "0xa71019efa29190c0A3CDf717755480B3e3c69a58");
  form.append("chain", "23295");

  form.append("files", fs.createReadStream("./metadata.json"));
  form.append("files", fs.createReadStream("./contracts/Counter.sol"));

  const res = await axios.post(
    "https://sourcify.dev/server/verify",
    form,
    { headers: form.getHeaders() }
  );

  console.log(res.data);
}

main();