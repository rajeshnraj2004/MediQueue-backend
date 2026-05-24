import mongoose from "mongoose";
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '8.8.4.4'])

const ConnectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URL,{})
        console.log("MongoDB Database Connected Successfully...✅✅✅");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

export default ConnectDB;