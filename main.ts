import * as index from "./index";
import * as down from "./download";
import * as testin from "./testin";
import * as fs from "fs";

async function main() {
  index.main();
  down.downloadFunction();
  testin.getExcel();
   
  
}

