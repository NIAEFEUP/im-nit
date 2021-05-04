# im-nit
Discord bot

## Database
This bot uses a database. In order to set it up, you should follow this steps:

1. Create a mongoDB account
2. Add a project inside it and a following cluster
3. Choose to connect an application, select node.js and copy the connection string
4. Finnally, paste the string as MONGO_PATH value in the .env file (The .env format is specified on .env.template)