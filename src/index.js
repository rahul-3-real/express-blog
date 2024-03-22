import "dotenv/config";
import connectServer from "./configs/server.config.js";
import connectDB from "./configs/database.config.js";

// Connections
connectDB()
  .then(() => {
    connectServer();
  })
  .catch((error) => {
    console.error(`😒 ERROR :: ${error}`);
  });
