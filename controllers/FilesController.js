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
    const token = request.header("X-Token");
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (userId) {
      const users = dbClient.db.collection("users");
      const idObject = new ObjectID(userId);
      const user = await users.findOne({ _id: idObject });
      if (!user) {
        return null;
      }
      return user;
    }
    return null;
  }

  static async postUpload(request, response) {
    const user = await FilesController.getUser(request);
    if (!user) {
      return response.status(401).json({ error: "Unauthorized" });
    }
    const { name } = request.body;
    const { type } = request.body;
    const { parentId } = request.body;
    const isPublic = request.body.isPublic || false;
    const { data } = request.body;
    if (!name) {
      return response.status(400).json({ error: "Missing name" });
    }
    if (!type) {
      return response.status(400).json({ error: "Missing type" });
    }
    if (type !== "folder" && !data) {
      return response.status(400).json({ error: "Missing data" });
    }

    const files = dbClient.db.collection("files");
    if (parentId) {
      const idObject = new ObjectID(parentId);
      const file = await files.findOne({ _id: idObject, userId: user._id });
      if (!file) {
        return response.status(400).json({ error: "Parent not found" });
      }
      if (file.type !== "folder") {
        return response.status(400).json({ error: "Parent is not a folder" });
      }
    }
    if (type === "folder") {
      files
        .insertOne({
          userId: user._id,
          name,
          type,
          parentId: parentId || 0,
          isPublic,
        })
        .then((result) =>
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
      const filePath = process.env.FOLDER_PATH || "/tmp/files_manager";
      const fileName = `${filePath}/${uuidv4()}`;
      const buff = Buffer.from(data, "base64");
      // const storeThis = buff.toString('utf-8');
      try {
        try {
          await fs.mkdir(filePath);
        } catch (error) {
          // pass. Error raised when file already exists
        }
        await fs.writeFile(fileName, buff, "utf-8");
      } catch (error) {
        console.log(error);
      }
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
  static async getShow(req, res) {
    try {
      const {id} = req.params;
      const token = req.header.authorization;

      // Retrieve the user based on the token
      const users = dbClient.db.collection('users');
      const user = await users.findOne({token});
      if (!user) {
        return res.status(401).json({ error: "unauthorized" });
      }
      const files = dbClient.db.collection('files');
      const file = await files.findOne({ _id: id, userId: user._id });
      if (!file) {
        return res.status(404).json({ error: "Not found" });
      }
      return res.json(file);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  static async getIndex(req, res) {
    try {
      const token = req.header('X-Token');
      const parentId = req.query.parentId || 0;
      const page = parseInt(req.query.page) || 0;

      const users = dbClient.db.collection('users');
      const user = await users.findOne({ token });
      if (!user) {
        return res.status(401).json({ error: "unauthorized" });
      }
      const files = dbClient.db.collection('files');
      const file = await files.aggregate([
        { $match:  { userId: user._id, parentId } },
	{ $skip: page * 20 },
	{ $limit: 20 }
      ]);
      return res.json(files);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

	

module.exports = FilesController;
