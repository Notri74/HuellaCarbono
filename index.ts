import * as fs from "fs";
import * as https from "https";
import * as crypto from "crypto";
import * as down from "./download";

type Item = {
  id: string;
  rute: string;
  date: string;
  year: string;
};

let urlGov: string =
  "https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting";

export async function main() {
  https.get(urlGov, function (res) {
    let data: string = "";

    res.on("data", function (d) {
      data += d;
    });
    res.on("end", async function () {
      let items: Item[] = [],
        list = data.split('<li class="gem-c-document-list__item  ">');
      list.shift();
      for (let i: number = 0; i < list.length; i++) {
        let date = list[i]
            .toString()
            .split('<time datetime="')[1]
            .split("T")[0],
          rute =
            "https://www.gov.uk" +
            list[i].toString().split('href="')[1].split('">')[0],
          id = crypto.createHash("md5").update(rute).digest("hex"),
          year = list[i].toString().split('">')[1].split("</a>")[0].slice(-4);

        items.push({
          id,
          date,
          rute,
          year,
        });
      }

      fs.writeFileSync("datos.json", JSON.stringify(items, null, 2));
    });

    res.on("error", function (e) {
      console.error(e);
    });
  });
}

main();
