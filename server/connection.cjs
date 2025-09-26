const { MongoClient } = require('mongodb');

// Replace with your actual connection string
const uri = "mongodb+srv://jatibay28:6N80LtTNrimXw9zt@srapsystem.j0zimkj.mongodb.net/?retryWrites=true&w=majority&appName=SRAPSystem";

// Create a new MongoClient (clean version without deprecated options)
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db("SRAP");

    // List collections in SRAP
    const collections = await db.listCollections().toArray();
    console.log("📁 Collections in 'SRAP':");
    collections.forEach(col => console.log(` - ${col.name}`));

  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  } finally {
    await client.close();
  }
}

connectDB();
