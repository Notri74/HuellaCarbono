import * as https from "https";
import * as download from "download";
import * as fs from "fs";

type Item = {
  id: string;
  rute: string;
  date: string;
  year: string;
};

async function excelDownloader(item: Item) {
  let excelRute: string = "";

  return new Promise((resolve) => {
    https.get(item.rute, function (res) {
      let data: string = "";
      res.on("data", function (d) {
        data += d;
      });
      res.on("end", async function () {
        const rute = data.split('<div class="attachment-details">');
        rute.shift();

        for (let i: number = 0; i < rute.length; i++) {
          excelRute = rute[i].split('href="')[1].split('">')[0];

          if (excelRute.toLowerCase().includes("flat")) {
            await download(excelRute, "downloads", {
              filename: item.year + "." + excelRute.split(".").pop(),
            });
          }
        }
        //@ts-ignore
        resolve();
      });
    });
  });
}

export async function downloadFunction() {
  const data: Item[] = await JSON.parse(
    fs.readFileSync("./datos.json").toString()
  );
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    await excelDownloader(item);
  }
}
downloadFunction();
