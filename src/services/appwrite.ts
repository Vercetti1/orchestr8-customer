import { Client, Databases, Storage, ID, Query } from 'appwrite';

export const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '698b8e310019590672cd';
export const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1';

export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'orchestr8-db';

export const COLLECTIONS = {
    USERS: 'users',
    ORDERS: 'orders'
};

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

export const databases = new Databases(client);
export const storage = new Storage(client);

export { ID, client, Query };
