## Flutter-Friendly Chat API Documentation

### Getting Started

- Base REST URL: `NEXT_PUBLIC_BASEURL` (defaults to `http://localhost:5000/api/v1`)
- Socket URL: `NEXT_PUBLIC_BACKEND_URL` (defaults to `http://localhost:5000`)
- Authentication:
  - Token type: Bearer JWT
  - REST: send `Authorization: Bearer <token>` header
  - Socket.IO: connect with `auth: { token: "<token>" }`
- Scope of this document:
  - Pages: `app/farmer/support/page.jsx`, `app/farmer/support/chat/page.jsx`
  - Dependencies scanned:
    - `components/farmer/support/MyConversation.jsx`
    - `components/farmer/support/UserChatWindow.jsx`
    - `components/chat/ChatInput.jsx`, `MessageBubble.jsx`, `TypingIndicator.jsx`, `OnlineStatus.jsx`
    - `lib/chatApi.js`, `lib/axiosInstance.js`, `lib/chatUtils.js`
    - `context/SocketContext.jsx`
    - `hooks/useChatEvents.js`

Only the APIs and Socket events actually invoked in these files are documented below.

## REST API Endpoints

- Base URL placeholder: [BASE_URL] = `http://localhost:5000/api/v1` (unless `NEXT_PUBLIC_BASEURL` is set)
- Common headers:
  - `Authorization: Bearer String`
  - `Accept: application/json`
  - For file upload, `Content-Type: multipart/form-data` (set automatically by most HTTP clients)

### 1. Create or Get Conversation

- Purpose: Ensure the current user has a support conversation. Creates one if none exists.
- Method: POST
- Path: `[BASE_URL]/chat/conversations`
- Headers:
  - Authorization: Bearer String
  - Accept: application/json
- Request body: none
- Success response:
  - Status: 200 or 201
  - Body:
```json
{
  "data": {
    "_id": "String",
    "status": "String",
    "lastMessage": {
      "_id": "String",
      "senderId": {
        "_id": "String",
        "first_name": "String",
        "last_name": "String",
        "phone": "String",
        "image": "String"
      },
      "messageType": "String",
      "content": "String",
      "mediaId": {
        "_id": "String",
        "url": "String",
        "name": "String",
        "type": "String",
        "thumbnail": "String"
      },
      "createdAt": "String",
      "isRead": true,
      "readAt": "String"
    },
    "assignedSupportId": {
      "_id": "String",
      "first_name": "String",
      "last_name": "String",
      "image": "String",
      "isOnline": true,
      "lastSeen": "String"
    },
    "updatedAt": "String",
    "unreadCount": { "userId": 0 }
  }
}
```
- Error responses:
  - 401 Unauthorized: missing/invalid token
  - 500 Internal server error
- Example request:
```json
{
  "method": "POST",
  "url": "/chat/conversations",
  "headers": { "Authorization": "Bearer <token>" }
}
```

### 2. Get Conversations (current user)

- Purpose: Fetch current user’s support conversation list (UI uses the first one).
- Method: GET
- Path: `[BASE_URL]/chat/conversations`
- Headers:
  - Authorization: Bearer String
  - Accept: application/json
- Query parameters:
  - page: int
  - limit: int
  - status: String (optional)
- Success response:
  - Status: 200
  - Body:
```json
{
  "data": [
    {
      "_id": "String",
      "status": "String",
      "lastMessage": {
        "_id": "String",
        "senderId": {
          "_id": "String",
          "first_name": "String",
          "last_name": "String",
          "phone": "String",
          "image": "String"
        },
        "messageType": "String",
        "content": "String",
        "mediaId": {
          "_id": "String",
          "url": "String",
          "name": "String",
          "type": "String",
          "thumbnail": "String"
        },
        "createdAt": "String",
        "isRead": true,
        "readAt": "String"
      },
      "assignedSupportId": {
        "_id": "String",
        "first_name": "String",
        "last_name": "String",
        "image": "String",
        "isOnline": true,
        "lastSeen": "String"
      },
      "updatedAt": "String",
      "unreadCount": { "userId": 0 }
    }
  ]
}
```
- Error responses: 401, 404, 500
- Example request:
```json
{
  "method": "GET",
  "url": "/chat/conversations?page=1&limit=1",
  "headers": { "Authorization": "Bearer <token>" }
}
```

### 3. Get Messages (by conversation)

- Purpose: Fetch paginated messages for a conversation.
- Method: GET
- Path: `[BASE_URL]/chat/messages/{conversationId}`
- Headers:
  - Authorization: Bearer String
  - Accept: application/json
- Query parameters:
  - page: int
  - limit: int (UI uses 50)
- Success response:
  - Status: 200
  - Body:
```json
{
  "data": [
    {
      "_id": "String",
      "senderId": {
        "_id": "String",
        "first_name": "String",
        "last_name": "String",
        "phone": "String",
        "image": "String"
      },
      "messageType": "String",
      "content": "String",
      "mediaId": {
        "_id": "String",
        "url": "String",
        "name": "String",
        "type": "String",
        "thumbnail": "String"
      },
      "createdAt": "String",
      "isRead": true,
      "readAt": "String"
    }
  ]
}
```
- Error responses: 401, 404, 500
- Example request:
```json
{
  "method": "GET",
  "url": "/chat/messages/<conversationId>?page=1&limit=50",
  "headers": { "Authorization": "Bearer <token>" }
}
```

### 4. Upload Chat Media

- Purpose: Upload images/videos/audio before sending via socket.
- Method: POST
- Path: `[BASE_URL]/chat/media`
- Headers:
  - Authorization: Bearer String
  - Content-Type: multipart/form-data
- Multipart body:
  - media: List<File> (one or many)
  - type: String — one of "image" | "video" | "audio"
- Success response:
  - Status: 200/201
  - Body:
```json
{
  "data": [
    {
      "_id": "String",
      "url": "String",
      "name": "String",
      "type": "String",
      "thumbnail": "String"
    }
  ]
}
```
- Error responses: 400, 401, 500
- Example request:
```json
{
  "method": "POST",
  "url": "/chat/media",
  "headers": { "Authorization": "Bearer <token>" },
  "body": {
    "media": ["<binary 1>", "<binary 2>"],
    "type": "image"
  }
}
```

### Error Codes

| Code | Meaning                            |
|------|------------------------------------|
| 400  | Validation failed                  |
| 401  | Unauthorized (invalid/expired JWT) |
| 403  | Access denied                      |
| 404  | Resource not found                 |
| 409  | Conflict                           |
| 500  | Internal server error              |

## Socket.IO Events

- Socket URL: [SOCKET_URL] = `http://localhost:5000` (unless `NEXT_PUBLIC_BACKEND_URL` is set)
- Auth on connect: `io(SOCKET_URL, { auth: { token: "<token>" } })`

### Client Emitted Events (emit)

- conversation:join
  - Purpose: Join conversation room
  - Payload:
```json
{ "conversationId": "String" }
```

- conversation:mark-all-read
  - Purpose: Mark all messages as read for a conversation
  - Payload:
```json
{ "conversationId": "String" }
```

- conversation:leave
  - Purpose: Leave the conversation room on unmount
  - Payload:
```json
{ "conversationId": "String" }
```

- typing:start
  - Purpose: Indicate the user started typing
  - Payload:
```json
{ "conversationId": "String" }
```

- typing:stop
  - Purpose: Indicate the user stopped typing
  - Payload:
```json
{ "conversationId": "String" }
```

- message:send
  - Purpose: Send a new message (text or media reference after upload)
  - Payloads:
    - Text:
```json
{
  "conversationId": "String",
  "messageType": "text",
  "content": "String",
  "tempId": "String"
}
```
    - Media:
```json
{
  "conversationId": "String",
  "messageType": "image",
  "mediaId": "String",
  "tempId": "String"
}
```
  - Acknowledgment: No explicit ack used in current code

### Client Listened Events (on)

- message:new
  - Purpose: Receive a new message for the active conversation
  - Payload:
```json
{
  "conversationId": "String",
  "message": {
    "_id": "String",
    "senderId": {
      "_id": "String",
      "first_name": "String",
      "last_name": "String",
      "phone": "String",
      "image": "String"
    },
    "messageType": "String",
    "content": "String",
    "mediaId": {
      "_id": "String",
      "url": "String",
      "name": "String",
      "type": "String",
      "thumbnail": "String"
    },
    "createdAt": "String",
    "isRead": true,
    "readAt": "String"
  }
}
```

- notification:new-message
  - Purpose: Out-of-conversation notification
  - Payload:
```json
{
  "conversationId": "String",
  "sender": { "name": "String" },
  "message": { "content": "String" }
}
```

- typing:user-typing
  - Purpose: Show typing indicator
  - Payload:
```json
{ "conversationId": "String", "userName": "String" }
```

- typing:user-stopped
  - Purpose: Hide typing indicator
  - Payload:
```json
{ "conversationId": "String" }
```

- message:read-receipt
  - Purpose: Update read status for a specific message
  - Payload:
```json
{ "conversationId": "String", "messageId": "String", "readAt": "String" }
```

- conversation:all-read
  - Purpose: Conversation-wide read confirmation
  - Payload:
```json
{ "conversationId": "String" }
```

- user:online
  - Purpose: Support agent came online
  - Payload:
```json
{ "userId": "String" }
```

- user:offline
  - Purpose: Support agent went offline
  - Payload:
```json
{ "userId": "String", "lastSeen": "String" }
```

- error
  - Purpose: Socket-level error
  - Payload:
```json
{ "message": "String" }
```

## Data Models (Dart-like)

These models are inferred from usage in the frontend and represent the minimum fields observed.

```dart
class MediaFile {
  String _id;
  String url;
  String? name;
  String type; // 'image' | 'video' | 'audio'
  String? thumbnail;
}

class ChatUser {
  String _id;
  String? first_name;
  String? last_name;
  String? phone;
  String? image;
  bool? isOnline;
  String? lastSeen; // ISO8601
}

class Message {
  String _id;
  ChatUser senderId;
  String messageType; // 'text' | 'image' | 'video' | 'audio'
  String? content;
  MediaFile? mediaId;
  String createdAt; // ISO8601
  bool? isRead;
  String? readAt; // ISO8601
}

class Conversation {
  String _id;
  String status; // 'open' | 'waiting' | 'resolved' | 'closed' | ...
  Message? lastMessage;
  ChatUser? assignedSupportId;
  String updatedAt; // ISO8601
  Map<String, int>? unreadCount; // userId -> unread
}
```

## Authentication

- Token type: Bearer JWT
- Passing tokens:
  - REST: `Authorization: Bearer <token>` header
  - Socket: `io([SOCKET_URL], { auth: { token: "<token>" } })`
- Token storage: Web app uses cookie `agritech_token`; Flutter should store securely (e.g., Keychain/Keystore) and inject in headers/connection auth.
- Token refresh: Not implemented in these files. On 401 errors, re-authenticate and retry as appropriate.

## Flutter Integration Notes

- File uploads: Use multipart form request to `/chat/media`, then send `message:send` with returned `media._id` via socket.
- Pagination:
  - Conversations: `page`, `limit`
  - Messages: `page`, `limit` (UI uses `limit = 50`; load more on upward scroll)
- Realtime flow:
  - After fetching a conversation, immediately emit `conversation:join` and `conversation:mark-all-read`.
  - Emit `typing:start`/`typing:stop` while composing.
  - Listen for `message:new`, `message:read-receipt`, `conversation:all-read`, `user:online`, `user:offline`.

This document contains only endpoints and events actually referenced in the specified pages and their dependencies.