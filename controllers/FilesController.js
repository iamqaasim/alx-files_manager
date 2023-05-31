/* eslint-disable */
import { v4 as uuidv4 } from "uuid";
import { promises as fs } from "fs";
import { ObjectID } from "mongodb";
import Queue from "bull";
import dbClient from "../utils/db";
import redisClient from "../utils/redis";

const fileQueue = new Queue("fileQueue", "redis://127.0.0.1:6379");

class FilesController {
  static async getUser(request) {
    // Extract token from request header
    const token = request.header("X-Token");
    // Generate key for Redis lookup
    const key = `auth_${token}`;
    // Retrieve user ID from Redis
    const userId = await redisClient.get(key);

    if (userId) {
      // Access the "users" collection in the database
      const users = dbClient.db.collection("users");
      // Create ObjectID using the retrieved user ID
      const idObject = new ObjectID(userId);
      // Find the user with the specified ID
      const user = await users.findOne({ _id: idObject });

      // If no user is found, return null
      if (!user) {
        return null;
      }
      return user;
    }
    return null;
  }

  static async postUpload(request, response) {
    // Get the user from the request
    const user = await FilesController.getUser(request);

    // If user is not found return 401 Unauthorized
    if (!user) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    // Extract necessary properties from the request body
    const { name } = request.body;
    const { type } = request.body;
    const { parentId } = request.body;
    const isPublic = request.body.isPublic || false;
    const { data } = request.body;

    // If name is missing return 400 Minssing name
    if (!name) {
      return response.status(400).json({ error: "Missing name" });
    }

    // If type is missing return 400 Minssing type
    if (!type) {
      return response.status(400).json({ error: "Missing type" });
    }

    // If type is not "folder" and dta is missing return 400 Minssing data
    if (type !== "folder" && !data) {
      return response.status(400).json({ error: "Missing data" });
    }

    // Access the "files" collection in the database
    const files = dbClient.db.collection("files");

    if (parentId) {
      // Find the parent file in the database
      const idObject = new ObjectID(parentId);
      const file = await files.findOne({ _id: idObject, userId: user._id });

      // If parent file is not found return 400 Parent not found
      if (!file) {
        return response.status(400).json({ error: "Parent not found" });
      }

      // If parent file is not found in folder return 400 Parent is not found in folder
      if (file.type !== "folder") {
        return response.status(400).json({ error: "Parent is not a folder" });
      }
    }
    if (type === "folder") {
      // Insert a new folder into the database
      files
        .insertOne({
          userId: user._id,
          name,
          type,
          parentId: parentId || 0,
          isPublic,
        })
        .then((result) =>
          // Return 201 Created with the inserted folder details
          response.status(201).json({
            id: result.insertedId,
            userId: user._id,
            name,
            type,
            isPublic,
            parentId: parentId || 0,
          })
        )
        .catch((error) => {
          console.log(error);
        });
    } else {
      // Handle file upload
      const filePath = process.env.FOLDER_PATH || "/tmp/files_manager";
      const fileName = `${filePath}/${uuidv4()}`;
      const buff = Buffer.from(data, "base64");

      try {
        try {
          // Create the folder if it doesn't exist
          await fs.mkdir(filePath);
        } catch (error) {
          // pass. Error raised when file already exists
        }
        // Write the file to disk
        await fs.writeFile(fileName, buff, "utf-8");
      } catch (error) {
        console.log(error);
      }

      // Insert the file into the database
      files
        .insertOne({
          userId: user._id,
          name,
          type,
          isPublic,
          parentId: parentId || 0,
          localPath: fileName,
        })
        .then((result) => {
          // Return 201 Created with the inserted file details
          response.status(201).json({
            id: result.insertedId,
            userId: user._id,
            name,
            type,
            isPublic,
            parentId: parentId || 0,
          });
          if (type === "image") {
            fileQueue.add({
              userId: user._id,
              fileId: result.insertedId,
            });
          }
        })
        .catch((error) => console.log(error));
    }
    return null;
  }

  static async getShow(request, response) {
    // Get the user from the request
    const user = await FilesController.getUser(request);

    // If no user is found, return an unauthorized error
    if (!user) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    // Get the fileId from the request parameters
    const fileId = request.params.id;
    // Access the "files" collection in the database
    const files = dbClient.db.collection("files");
    // Create an ObjectID instance for the fileId
    const idObject = new ObjectID(fileId);
    // Find the file in the database based on its _id and userId
    const file = await files.findOne({ _id: idObject, userId: user._id });

    // If no file is found, return a not found error
    if (!file) {
      return response.status(404).json({ error: "Not found" });
    }
    return response.status(200).json(file);
  }

  static async getIndex(request, response) {
    // Get the user from the request
    const user = await FilesController.getUser(request);

    // If the user is not found, return an error response
    if (!user) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    // Get the parentId and page from the request query
    const { parentId, page } = request.query;
    const pageNum = page || 0;

    // Get the "files" collection from the database
    const files = dbClient.db.collection("files");

    // Create query variable
    let query;

    // If parentId is not provided, query files by userId only
    // else if parentId is provided, query files by userId and parentId
    if (!parentId) {
      query = { userId: user._id };
    } else {
      query = { userId: user._id, parentId: ObjectID(parentId) };
    }

    // Perform aggregation on the files collection
    files
      .aggregate([
        { $match: query }, // Match documents based on the query
        { $sort: { _id: -1 } }, // Sort the matched documents by _id in descending order
        {
          $facet: {
            metadata: [
              { $count: "total" }, // Count the total number of matched documents
              { $addFields: { page: parseInt(pageNum, 10) } }, // Add the current page number to the metadata
            ],
            data: [
              { $skip: 20 * parseInt(pageNum, 10) }, // Skip documents based on the page number and limit
              { $limit: 20 }, // Limit the number of documents to 20 per page
            ],
          },
        },
      ])
      .toArray((err, result) => {
        // Map over the data and create a new array with modified file objects
        if (result) {
          const final = result[0].data.map((file) => {
            const tmpFile = {
              ...file,
              id: file._id,
            };
            delete tmpFile._id;
            delete tmpFile.localPath;
            return tmpFile;
          });
          return response.status(200).json(final);
        }
        console.log("Error occured");
        return response.status(404).json({ error: "Not found" });
      });
    return null;
  }
}
module.exports = FilesController;
