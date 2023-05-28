/* eslint-disable */
import { MongoClient } from "mongodb";

const HOST = process.env.DB_HOST || "localhost";
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || "files_manager";
const url = `mongodb://${HOST}:${PORT}`;

class DBClient {
  constructor() {
    // Create a new instance of the MongoDB client
    this.client = new MongoClient(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    // Connect to the MongoDB server and initialize the database
    this.client
      .connect()
      .then(() => {
        this.db = this.client.db(`${DATABASE}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // check connection status and report
  isAlive() {
    return this.client.isConnected();
  }

  // Retrieve the number of users in the database
  async nbUsers() {
    const users = this.db.collection("users");
    const usersNum = await users.countDocuments();
    return usersNum;
  }

  // Retrieve the number of files in the database
  async nbFiles() {
    const files = this.db.collection("files");
    const filesNum = await files.countDocuments();
    return filesNum;
  }
}

// Create an instance of the DBClient class
const dbClient = new DBClient();

// Export the dbClient instance to be used by other modules
module.exports = dbClient;
