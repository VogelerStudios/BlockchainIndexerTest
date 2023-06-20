import fs from "fs";
import csv from "csv-parser";

class CSVParser {
  filePath: string;
  constructor(path: string = "") {
    this.filePath = path;
  }
  async readCSVFile(): Promise<object[]> {
    const results: object[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(this.filePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => resolve(results))
        .on("error", (error) => reject(error));
    });
  }
}

export default CSVParser;
