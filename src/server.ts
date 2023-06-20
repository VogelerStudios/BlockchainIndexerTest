import express from "express";
import { Sequelize } from "sequelize";
import Collection from "./Collection";
import CSVParser from "./CSVParser";

console.log("Starting application");

const sequelize = new Sequelize({
  dialect: "postgres",
  database: "postgres",
  username: "postgres",
  password: "postgres",
  host: "127.0.0.1",
  port: 5432,
  // Uncomment if you don't want to see the executed SQL requests in the logs
  // logging: false,
});

// Uncomment this if you want to create the User table
// initUser(sequelize)

const app = express();

app.get("/", async (req, res) => {
  const parser = new CSVParser("/home/coderpad/app/src/nftTransfers.csv");
  // const parser = new CSVParser("/home/coderpad/app/src/sample.csv");
  const data = await parser.readCSVFile();
  const collection = new Collection(data);
  collection.getTransactions();

  collection.calculateOwnerChurn();
  const churnAvg = collection.getAverageChurnRate();
  console.log("churnAvg: ", churnAvg);

  collection.calculateHoldTime();
  // test wallet:
  const testWallet = "0x0335464fb52792d7301961e491a4f92b3023039e";
  const holdTimeByWalletTest = collection.getTokensHoldTimeByWallet(testWallet);
  console.log("holdTimeByWalletTest: ", holdTimeByWalletTest);
  const holdTimeAvg = collection.getAverageHoldTime();
  console.log("holdTimeAvg: ", holdTimeAvg);
});

const port = 3000;
const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

const shutdown = async () => {
  server.close();
  await sequelize.close();
};

process.once("SIGTERM", async function () {
  console.log("Stopping application");
  await shutdown();
  process.exit();
});
