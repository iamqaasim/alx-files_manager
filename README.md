# File Management API

This project is a back-end application designed to help you learn the key concepts of authentication, NodeJS, MongoDB, Redis, pagination, and background processing. The platform allows users to upload, view, and manage files, with several functionalities built using modern backend technologies.

## Table of Contents
- [Description](#description)
- [Learning Objectives](#learning-objectives)
- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [Usage](#usage)
- [Resources](#resources)
- [Requirements](#requirements)
- [Provided Files](#provided-files)
- [License](#license)

## Description

The project aims to build a simple platform for users to upload and manage files. The back-end service handles user authentication, file operations, and background processing, with a focus on using Node.js and Express.

### Key Features:
- **User authentication** via token
- **List all files** available in the system
- **Upload new files** to the platform
- **Change permission** of a file
- **View files** directly from the platform
- **Generate thumbnails** for image files

This service is a simplified version of many file management platforms, built as a learning exercise to help you understand key back-end concepts and build a full-stack application from scratch.

## Learning Objectives

By the end of this project, you should be able to explain the following:

- How to create an API using Express
- How to authenticate users in your application
- How to store and manage data in MongoDB
- How to utilize Redis to store temporary data
- How to set up and use a background worker for processing tasks

## Features

- **User Authentication**: Secure your API using tokens for user login and access control.
- **File Upload**: Allow users to upload files, with storage in MongoDB and Redis for temporary data.
- **File Permissions**: Enable the modification of file permissions after upload.
- **Thumbnail Generation**: Automatically create image thumbnails for quick previews.
- **Pagination**: Support for listing files with pagination to optimize response times for large datasets.

## Technologies

- **NodeJS**: The runtime environment for executing JavaScript on the server.
- **MongoDB**: NoSQL database for storing file metadata and other related information.
- **Redis**: Key-value store for managing temporary data and background job queues.
- **Bull**: Background processing library used for handling background tasks like image thumbnail generation.
- **Express**: Web framework for building the API.
- **Mocha**: Test framework for writing and running unit tests.
- **Nodemon**: Development tool to automatically restart the server on code changes.
- **Mime-Types**: Utility for handling file types.

## Setup

To get started with this project, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd <project-directory>
