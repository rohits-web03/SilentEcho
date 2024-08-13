import mongoose from "mongoose";

interface connectionObject {
    isConnected?: number
}

const connection: connectionObject = {}

const db_connect = async (): Promise<void> => {
    if(connection.isConnected){
        console.log("Already connected to database");
        return;
    }
    try{
        const db = await mongoose.connect(process.env.MONGODB_URL || '');
        connection.isConnected = db.connections[0].readyState;
        console.log("Connected to the DB Successfully");
    } catch(error){
        console.log("Error connecting to the DB: ",error);
        process.exit(1);
    }
}

export default db_connect;