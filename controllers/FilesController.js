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
    const user = await FilesController.getUser(request);
    if (!user) {
      return response.status(401).json({ error: "Unauthorized" });
    }
    const fileId = request.params.id;
    const files = dbClient.db.collection("files");
    const idObject = new ObjectID(fileId);
    const file = await files.findOne({ _id: idObject, userId: user._id });
    if (!file) {
      return response.status(404).json({ error: "Not found" });
    }
    return response.status(200).json(file);
  }

  static async getIndex(request, response) {
    const user = await FilesController.getUser(request);
    if (!user) {
      return response.status(401).json({ error: "Unauthorized" });
    }
    const { parentId, page } = request.query;
    const pageNum = page || 0;
    const files = dbClient.db.collection("files");
    let query;
    if (!parentId) {
      query = { userId: user._id };
    } else {
      query = { userId: user._id, parentId: ObjectID(parentId) };
    }
    files
      .aggregate([
        { $match: query },
        { $sort: { _id: -1 } },
        {
          $facet: {
            metadata: [
              { $count: "total" },
              { $addFields: { page: parseInt(pageNum, 10) } },
            ],
            data: [{ $skip: 20 * parseInt(pageNum, 10) }, { $limit: 20 }],
          },
        },
      ])
      .toArray((err, result) => {
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
          // console.log(final);
          return response.status(200).json(final);
        }
        console.log("Error occured");
        return response.status(404).json({ error: "Not found" });
      });
    return null;
  }

  static async putPublish(request, response) {
    const user = await FilesController.getUser(request);
    if (!user) {
      return response.status(401).json({ error: "Unauthorized" });
    }
    const { id } = request.params;
    const files = dbClient.db.collection("files");
    const idObject = new ObjectID(id);
    const newValue = { $set: { isPublic: true } };
    const options = { returnOriginal: false };
    files.findOneAndUpdate(
      { _id: idObject, userId: user._id },
      newValue,
      options,
      (err, file) => {
        if (!file.lastErrorObject.updatedExisting) {
          return response.status(404).json({ error: "Not found" });
        }
        return response.status(200).json(file.value);
      }
    );
    return null;
  }

  static async putUnpublish(request, response) {
    const user = await FilesController.getUser(request);
    if (!user) {
      return response.status(401).json({ error: "Unauthorized" });
    }
    const { id } = request.params;
    const files = dbClient.db.collection("files");
    const idObject = new ObjectID(id);
    const newValue = { $set: { isPublic: false } };
    const options = { returnOriginal: false };
    files.findOneAndUpdate(
      { _id: idObject, userId: user._id },
      newValue,
      options,
      (err, file) => {
        if (!file.lastErrorObject.updatedExisting) {
          return response.status(404).json({ error: "Not found" });
        }
        return response.status(200).json(file.value);
      }
    );
    return null;
  }

  static async getFile(request, response) {
    const { id } = request.params;
    const files = dbClient.db.collection("files");
    const idObject = new ObjectID(id);
    files.findOne({ _id: idObject }, async (err, file) => {
      if (!file) {
        return response.status(404).json({ error: "Not found" });
      }
      console.log(file.localPath);
      if (file.isPublic) {
        if (file.type === "folder") {
          return response
            .status(400)
            .json({ error: "A folder doesn't have content" });
        }
        try {
          let fileName = file.localPath;
          const size = request.param("size");
          if (size) {
            fileName = `${file.localPath}_${size}`;
          }
          const data = await fs.readFile(fileName);
          const contentType = mime.contentType(file.name);
          return response
            .header("Content-Type", contentType)
            .status(200)
            .send(data);
        } catch (error) {
          console.log(error);
          return response.status(404).json({ error: "Not found" });
        }
      } else {
        const user = await FilesController.getUser(request);
        if (!user) {
          return response.status(404).json({ error: "Not found" });
        }
        if (file.userId.toString() === user._id.toString()) {
          if (file.type === "folder") {
            return response
              .status(400)
              .json({ error: "A folder doesn't have content" });
          }
          try {
            let fileName = file.localPath;
            const size = request.param("size");
            if (size) {
              fileName = `${file.localPath}_${size}`;
            }
            const contentType = mime.contentType(file.name);
            return response
              .header("Content-Type", contentType)
              .status(200)
              .sendFile(fileName);
          } catch (error) {
            console.log(error);
            return response.status(404).json({ error: "Not found" });
          }
        } else {
          console.log(
            `Wrong user: file.userId=${file.userId}; userId=${user._id}`
          );
          return response.status(404).json({ error: "Not found" });
        }
      }
    });
  }
}

module.exports = FilesController;
