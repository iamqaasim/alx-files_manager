/* eslint-disable */
import { Router } from "express";
import AppController from "../controllers/AppController";
import UsersController from "../controllers/UsersController";
import AuthController from "../controllers/AuthController";
import FilesController from "../controllers/FilesController";

// Creating a new router instance
const router = Router();

// Defining a GET route for "/status" and mapping it to the getStatus method in the AppController
router.get("/status", AppController.getStatus);

// Defining a GET route for "/stats" and mapping it to the getStats method in the AppController
router.get("/stats", AppController.getStats);

// Defining a POST route for "/users" and mapping it to the postNew method in the UsersController
router.post("/users", UsersController.postNew);

// Defining a GET route for "/connect" and mapping it to the getConnect method in the AuthController
router.get("/connect", AuthController.getConnect);

// Defining a GET route for "/disconnect" and mapping it to the getDisconnect method in the AuthController
router.get("/disconnect", AuthController.getDisconnect);

// Defining a GET route for "/users/me" and mapping it to the getMe method in the UsersController
router.get("/users/me", UsersController.getMe);

// Defining a POST route for "/files" and mapping it to the postUpload method in the FilesController
router.post("/files", FilesController.postUpload);

router.get("/files/:id", FilesController.getShow);

router.get("/files", FilesController.getIndex);

router.put("/files/:id/publish", FilesController.putPublish);

router.put("/files/:id/unpublish", FilesController.putUnpublish);

router.get("/files/:id/data", FilesController.getFile);

// Exporting the router module
module.exports = router;
