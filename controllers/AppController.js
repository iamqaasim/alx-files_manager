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
    const usersNum = await dbClient.nbUsers();
    const filesNum = await dbClient.nbFiles();
    response.status(200).json({ users: usersNum, files: filesNum });
  }
}

// Exporting the AppController class as a module
module.exports = AppController;
