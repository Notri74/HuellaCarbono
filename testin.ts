import * as xlsx from "xlsx";
import { writeFileSync, existsSync, readFileSync, readdirSync } from "fs";
import * as crypto from "crypto";

export function getExcel() {
  function md5(text: string): string {
    return crypto.createHash("md5").update(text).digest("hex").toUpperCase();
  }

  type Lista = {
    [param: string]: Item;
  };

  type Item = {
    scope: string;
    level1: string;
    level2: string;
    level3: string;
    ColumnText: string;
    UOM: string;
    GHG: {
      [year: string]: {
        [ghg: string]: string;
      };
    };
  };

  let fileName: string[] = [];
  const files = readdirSync("./downloads");
  for (let file of files) {
    fileName.push(`./downloads/${file}`);
  }

  let results: Lista = {};

  for (let file of fileName) {
    let var_year = file.split("/")[file.split("/").length - 1].split(".")[0];

    if (parseInt(var_year) > 2014) {
      const workbook = xlsx.readFile(file);
      const worksheet1 = workbook.Sheets[workbook.SheetNames[1]];

      const data: any[][] = xlsx.utils.sheet_to_json(worksheet1, {
        range: `A6:K20000`,
        header: 1,
      });

      //* Test2
      let datos = data.filter((r) => {
        return (
          typeof r[0] !== "undefined" &&
          (typeof r[0] === "string" ? r[0] : "").trim().toUpperCase() !==
            "END" &&
          (typeof r[0] === "string" ? r[0] : "").trim() !== ""
        );
      });

      for (let i = 0; i < datos.length; i++) {
        let itemId: string = "";

        let row = datos[i];

        for (let j = 0; j < 7; j++) {
          itemId +=
            "-|tutifruti|-" +
            (typeof row[j] === "string" ? row[j] : "").toLowerCase().trim();
        }
        itemId = md5(itemId);

        let item: Item = results[itemId] || {
          scope: row[0],
          level1: row[1],
          level2: row[2],
          level3: row[3],
          ColumnText: row[5],
          UOM: row[7],
          GHG: {
            [var_year]: {
              [row[8]]: row[10],
            },
          },
        };

        if (typeof item.GHG[var_year] === "undefined") {
          item.GHG[var_year] = {};
        }
        item.GHG[var_year][row[8]] = row[10];

        if (typeof row[10] === "undefined") {
          item.GHG[var_year][row[7]] = row[8];
        }

        // Por si se quiere eliminar los años vacíos
        // if (row[10] === undefined) {
        //   delete item.GHG[var_year];
        // }

        results[itemId] = item;
      }
    }

    writeFileSync(
      "DataBaseHuellaCarbono.json",
      JSON.stringify(results, null, 2)
    );
  }
}

getExcel();
