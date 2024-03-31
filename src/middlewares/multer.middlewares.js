import multer from "multer";
import path from "path";
import fs from "fs";

// Uploading files Middleware
// It uploads files in public/route/year/month/day/filename
const uploadMiddleware = (folderName) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Get current date
      const currentDate = new Date();
      // Extract year, month, and day from the current date
      const year = String(currentDate.getFullYear());
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      // Set destination path
      const destinationPath = path.join(
        "./public",
        folderName,
        year,
        month,
        day
      );

      // Create directory if it doesn't exist
      fs.mkdirSync(destinationPath, { recursive: true });

      cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
      let extArray = file.mimetype.split("/");
      let extension = extArray[extArray.length - 1];
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, folderName + "-" + uniqueSuffix + "." + extension);
    },
  });

  return multer({ storage: storage });
};

export default uploadMiddleware;
