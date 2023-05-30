/* eslint-disable */
import sha1 from "sha1";
import Queue from "bull";
import dbClient from "../utils/db";
import { ObjectID } from "mongodb";
import redisClient from '../utils/redis';

// Create a new instance of the userQueue using Redis
const userQueue = new Queue("userQueue", "redis://127.0.0.1:6379");

class UsersController {
  static postNew(request, response) {
    const { email } = request.body;
    const { password } = request.body;

    if (!email) {
      response.status(400).json({ error: "Missing email" });
      return;
    }
    if (!password) {
      response.status(400).json({ error: "Missing password" });
      return;
    }

    const users = dbClient.db.collection("users");
    users.findOne({ email }, (err, user) => {
      if (user) {
        response.status(400).json({ error: "Already exist" });
      } else {
        const hashedPassword = sha1(password);
        users
          .insertOne({
            email,
            password: hashedPassword,
          })
          .then((result) => {
            response.status(201).json({ id: result.insertedId, email });
            userQueue.add({ userId: result.insertedId });
          })
          .catch((error) => console.log(error));
      }
    });
  }

  static async getMe(request, response) {
    const token = request.header("X-Token"); // Retrieve the token from the request header
    const key = `auth_${token}`; // Construct the key for Redis lookup
    const userId = await redisClient.get(key); // Retrieve the user ID from Redis using the key

    if (userId) {
      // Access the "users" collection in the database
      const users = dbClient.db.collection("users");
      // Create a MongoDB ObjectID using the user ID
      const idObject = new ObjectID(userId);
      // Find the user in the database by their ID
      users.findOne({ _id: idObject }, (err, user) => {
        // If a user is found
        if (user) {
          response.status(200).json({ id: userId, email: user.email });
        } else {
          response.status(401).json({ error: "Unauthorized" });
        }
      });
    } else {
      console.log("Hupatikani!");
      response.status(401).json({ error: "Unauthorized" });
    }
  }
}

module.exports = UsersController;
