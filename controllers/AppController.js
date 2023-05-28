/* eslint-disable */
import redisClient from "../utils/redis";
import dbClient from "../utils/db";

class AppController {
  // Handler for the "/status" route
  static getStatus(request, response) {
    response
      .status(200)
      .json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
  }

  // Handler for the "/stats" route
  static async getStats(request, response) {
    const usersNum = await dbClient.nbUsers(); // Getting the number of users from the dbClient
    const filesNum = await dbClient.nbFiles(); // Getting the number of files from the dbClient
    response.status(200).json({ users: usersNum, files: filesNum });
  }
}

// Exporting the AppController class as a module
module.exports = AppController;
