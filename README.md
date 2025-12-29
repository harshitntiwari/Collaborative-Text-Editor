# CollabText - A Real-Time Collaborative Text Editor

This is a real-time text editor built for performance and scale. It supports conflict resolution in case of concurrent edits making it literally "collaborative".
The users can collaborate in real time while the issues related to overlapping edits are handled by the application.

## Functionality

The application currently supports the following basic functionalities:

- Users can create multiple documents
- Multiple users can collaborate on the same document in real-time
  - All the edits are synchronised to all the users collaborating on the document in real-time
  - Concurrent overlapping edits are resolved at the server
- Documents and their metadata are persisted automatically

## Architecture

The high level architecture involves the following key components:

- **Websocket server** : Synchronises the real time updates to the clients and handles overlapping edits using the [Operational Transform](https://en.wikipedia.org/wiki/Operational_transformation) technique.
- **Document service** : Provides APIs for CRUD operations for documents. This is an express server.
- **Relational Database** : Stores documents' metadata. This project uses PostgreSQL for this.
- **Object store** : Stores documents' contents. This project uses S3 for this.
- **Message Queue** : Decouples and helps Websocket server and Document service communicate updates and acknowledgements. This project uses BullMQ for this.

![Alt text](arch.png)

Following is a typical flow of how Collab-Text works:

1. Suppose Client 1 and Client 2 are editing the same document. All the edits made by a client are first sent to the websocket server.
2. The websocket server resolves all the edits using OT and then pushes the transformed edit to a message queue.
3. The document service consumes this edit from the message queue.
4. The document service then processes and persists the changes to the database.
5. It then pushes the persistence acknowledgment to another message queue.
6. This acknowledgment is then consumed by the websocket server from the queue.
7. It then finally broadcasts that edit to all the users collabrating on this document.

## Tech stack

- TypeScript
- Node.js
- Express
- The websocket server uses two important libraries:
  - Quill.js - provides a good [API](https://github.com/quilljs/delta/#operational-transform) that helps in implementation of Operational Transform.
  - Socket\.io - enables real-time communication between clients and server
- BullMQ - background job processing library for Node.js based on Redis
- PostgreSQL for document metadata perisitence
- AWS S3 for storing document contents
