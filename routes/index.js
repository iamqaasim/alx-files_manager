/* eslint-disable */
import { Router } from "express";
import AppController from "../controllers/AppController";

// Creating a new router instance
const router = Router();

// Defining a GET route for "/status" and mapping it to the getStatus method in the AppController
router.get("/status", AppController.getStatus);

// Defining a GET route for "/stats" and mapping it to the getStats method in the AppController
router.get("/stats", AppController.getStats);

// Exporting the router module
module.exports = router;
