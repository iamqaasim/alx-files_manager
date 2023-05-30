/* eslint-disable */
import { Router } from "express";
import AppController from "../controllers/AppController";
import UsersController from "../controllers/UsersController";

// Creating a new router instance
const router = Router();

// Defining a GET route for "/status" and mapping it to the getStatus method in the AppController
router.get("/status", AppController.getStatus);

// Defining a GET route for "/stats" and mapping it to the getStats method in the AppController
router.get("/stats", AppController.getStats);

// Defining a POST route for "/users" and mapping it to the postNew method in the UsersController
router.post("/users", UsersController.postNew);

// Exporting the router module
module.exports = router;
