# File Upload Platform

This project is a back-end platform for file uploads and management. It covers various backend technologies such as authentication, NodeJS, MongoDB, Redis, pagination, and background processing. By the end of this project, you'll be able to build a file upload service and understand how to integrate these technologies into a fully functioning platform.

## Features

- **User Authentication**: Secure authentication using tokens.
- **File Management**:
  - List all files.
  - Upload a new file.
  - Change permissions of a file.
  - View a file.
  - Generate thumbnails for image files.
  
This platform mimics real-world services, serving as a learning tool to understand how to implement these features step by step.

## Learning Objectives

By the end of this project, you will:

- Know how to create an API with Express.
- Understand how to authenticate users.
- Be able to store data in MongoDB.
- Understand how to store temporary data in Redis.
- Be able to set up and use a background worker.

## Project Structure

- **Authentication**: User authentication via token-based authentication.
- **File Management**: Functionality to upload, list, view, and manage files.
- **Thumbnail Generation**: Generate image thumbnails for file preview.
- **Background Processing**: Use a background worker for processing tasks like generating thumbnails.
- **Utils**: Helper functions are located in the `utils` folder for better code organization.

## Resources

### Read/Watch

- [Node.js getting started](https://nodejs.org/en/docs/guides/)
- [Process API Documentation](https://nodejs.org/dist/latest-v12.x/docs/api/process.html)
- [Express getting started](https://expressjs.com/en/starter/installing.html)
- [Mocha Documentation](https://mochajs.org/)
- [Nodemon Documentation](https://www.npmjs.com/package/nodemon)
- [MongoDB](https://www.mongodb.com/)
- [Bull (Background jobs)](https://github.com/OptimalBits/bull)
- [Image Thumbnail Generation](https://www.npmjs.com/package/sharp)
- [Mime-Types](https://www.npmjs.com/package/mime-types)
- [Redis](https://redis.io/)

## Requirements

- **Editors**: You can use any of the following editors:
  - vi
  - vim
  - emacs
  - Visual Studio Code
- **Operating System**: All files will be interpreted on Ubuntu 18.04 LTS using Node.js (version 12.x.x).
- **File Formatting**:
  - Ensure all files end with a new line.
  - Ensure all your JavaScript files use the `.js` extension.
  - Code will be verified using ESLint, so follow coding standards.

## Setup

1. Clone this repository to your local machine.
2. Install the dependencies:
    ```bash
    $ npm install
    ```
3. Set up the environment variables for MongoDB, Redis, and other services.
4. Run the application:
    ```bash
    $ npm run start
    ```

## Provided Files

- `package.json`: Contains the project's dependencies and scripts.
- `.eslintrc.js`: ESLint configuration for code style checks.
- `babel.config.js`: Babel configuration (if required for transpiling).
  
Ensure you run `$ npm install` to install all necessary dependencies listed in the `package.json`.
