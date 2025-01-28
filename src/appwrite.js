import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

// Validate environment variables
// Add this before client initialization
if (!PROJECT_ID || !DATABASE_ID || !COLLECTION_ID) {
    throw new Error("Missing Appwrite environment variables!");
}

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(PROJECT_ID);

console.log("Appwrite client initialized:", client.config);

const database = new Databases(client);

export const updateSearchTerm = async (searchTerm, movie) => {
    try {
        // Check for existing search term
        const result = await database.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.equal("searchTerm", searchTerm)]
        );

        if (result.documents.length > 0) {
            // Update existing document atomically
            const doc = result.documents[0];
            await database.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                doc.$id,
                { count: doc.count +1, } // Atomic update
            );
        } else {
            // Create new document
            await database.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {
                    searchTerm,
                    count: 1,
                    movie_id: movie.id,
                    poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
                }
            );
        }
    } catch (error) {
        console.error("Appwrite operation failed:", error);
        throw error; // Propagate error to caller
    }
};

