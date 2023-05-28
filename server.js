import express from "express";
import router from "./routes/index";

// Setting the port number
const port = parseInt(process.env.PORT, 10) || 5000;

// Creating an instance of the express application
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());
// Mounting the router middleware at the root URL
app.use("/", router);

// Starting the server and listening on the specified port
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});

// Exporting the app as the default module
export default app;
