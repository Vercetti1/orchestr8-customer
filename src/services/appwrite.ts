import { Client, Databases, Storage, Functions, ID, Query } from 'appwrite';

export const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '698ea85b0025d27750bf';
export const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';

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
export const functions = new Functions(client);

export { ID, client, Query };
