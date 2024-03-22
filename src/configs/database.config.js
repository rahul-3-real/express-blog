import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    const databaseName = "blog";
    const connectionUrl = `${mongoUrl}/${databaseName}`;

    const instance = await mongoose.connect(connectionUrl);
    console.log(`😊 Database connected on HOST :: ${instance.connection.host}`);
    return instance;
    return instance;
  } catch (error) {
    console.log(`😒 Error connecting Database :: ${error}`);
  }
};

export default connectDB;
