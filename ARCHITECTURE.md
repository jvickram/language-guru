# System Architecture

## Introduction
This document outlines the detailed system architecture of the Language Guru application, including the database schema, API design, and component diagrams.

## System Overview
Language Guru is designed to provide a comprehensive platform for learning various languages, utilizing interactive lessons, quizzes, and community support.

## Components of the System
- **Frontend**: React.js application for user interface.
- **Backend**: Node.js and Express.js API to handle requests.
- **Database**: MongoDB for storing user data and lesson information.
- **Authentication**: JWT for user authentication and authorization.

## Database Schema
### Users Collection
- **username**: String, unique
- **email**: String, unique
- **passwordHash**: String
- **createdAt**: Date

### Lessons Collection
- **title**: String
- **content**: String
- **language**: String
- **createdBy**: ObjectId (refers to Users)
- **createdAt**: Date

### Progress Collection
- **userId**: ObjectId (refers to Users)
- **lessonId**: ObjectId (refers to Lessons)
- **completed**: Boolean
- **score**: Number

## API Design
### Endpoints
- **GET /api/lessons**: Retrieve all lessons
- **GET /api/lessons/:id**: Retrieve a specific lesson
- **POST /api/lessons**: Create a new lesson
- **PUT /api/lessons/:id**: Update a lesson
- **DELETE /api/lessons/:id**: Delete a lesson
- **POST /api/auth/register**: Register a new user
- **POST /api/auth/login**: Login a user

## Component Diagrams
[Include component diagrams here]

## Conclusion
This architecture is designed to scale and accommodate new features as the application grows.