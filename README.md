

## Tekst - Backend

This repository contains the backend code for Tekst, a fast and anonymous text sharing platform. It handles the API requests and manages the data storage.

## Built With

*   Node.js
*   Express
*   JWT (JSON Web Tokens - currently used for authentication, but could be implemented for encryption in the future)
*   MongoDB
*   Socket.io
*   TypeScript

## Project Structure

```
src_input/           # TypeScript source files
├── routes/          # API routes
│   ├── ...
├── models/         # MongoDB models
│   ├── ...
├── app.ts          # Contains starter files
├── server.ts          # Main entry point
├── ...
src/                  # Compiled JavaScript files (do not edit these directly)
├── ...
```

## Getting Started

1.  Clone the repository:

    ```bash
    git clone [https://github.com/](https://github.com/)ennanuel/tekst-backend.git # Replace with your repo URL
    cd tekst-backend
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Compile TypeScript to JavaScript:

    ```bash
    npm run build
    ```

4.  Start the server:

    ```bash
    npm start
    ```

## Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```
DB_URL=[YOUR_MONGODB_CONNECTION_STRING]
FRONTEND_URL=[YOUR_FRONTEND_URL] (You can use '*' if you don't want to be specific)
PORT=[THE_PORT_YOU_WANT_THE_SERVER_TO_RUN_ON]
```

## API Endpoints

*   `GET /auth/check`: Gets details of the user.
*   `POST /auth/logout`: Logs user out.
*   `GET /spaces/user/:page`: Gets the available text spaces for a specific user.
*   `GET /spaces/explore/:page`: Gets new text spaces for the user to see.
*   `GET /spaces/space/:textSpaceId`: Gets a single text spaces details.
*   `POST /spaces/create`: Creates a new text space.
*   `PUT /spaces/edit/:textSpaceId`: Edits an existing text space.
*   `PUT /spaces/add/favorite/:textSpaceId`: Adds existing text space to favorites.
*   `PUT /spaces/remove/favorite/:textSpaceId`: Removes text space from favorites.
*   `DELETE /spaces/delete/:textSpaceId`: Deletes text space.
*   `GET /user/details/:userId`: Gets user details.
*   `POST /user/register`: Creates a new user.
*   `POST /user/login`: For logging in.
*   `PUT /user/edit/:userId`: Edits user details.
*   `DELETE /user/delete/:userId`: Deletes user details.

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues.
