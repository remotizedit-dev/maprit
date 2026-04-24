const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

async function testConnection() {
  try {
    const configPath = path.join(__dirname, 'firebase-applet-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    console.log("Config loaded:", {
      projectId: config.projectId,
      databaseId: config.firestoreDatabaseId
    });

    const app = initializeApp({
      projectId: config.projectId
    });

    const db = getFirestore(app, config.firestoreDatabaseId || '(default)');
    
    console.log("Attempting to list collections...");
    const collections = await db.listCollections();
    console.log("Success! Found collections:", collections.map(c => c.id));
    
  } catch (error) {
    console.error("Connection failed!");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    if (error.details) console.error("Details:", error.details);
  }
}

testConnection();
