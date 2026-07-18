const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '../public/firebase-messaging-sw.js');
const swTemplatePath = path.join(__dirname, '../public/firebase-messaging-sw.js');

// Read the service worker file
let swContent = fs.readFileSync(swPath, 'utf8');

// Replace environment variable placeholders with actual values
swContent = swContent.replace(/self\.__FIREBASE_API_KEY__/g, `'${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''}'`);
swContent = swContent.replace(/self\.__FIREBASE_AUTH_DOMAIN__/g, `'${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''}'`);
swContent = swContent.replace(/self\.__FIREBASE_PROJECT_ID__/g, `'${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''}'`);
swContent = swContent.replace(/self\.__FIREBASE_STORAGE_BUCKET__/g, `'${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ''}'`);
swContent = swContent.replace(/self\.__FIREBASE_MESSAGING_SENDER_ID__/g, `'${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ''}'`);
swContent = swContent.replace(/self\.__FIREBASE_APP_ID__/g, `'${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''}'`);

// Write the modified content back to the file
fs.writeFileSync(swPath, swContent);

console.log('Environment variables injected into firebase-messaging-sw.js');
