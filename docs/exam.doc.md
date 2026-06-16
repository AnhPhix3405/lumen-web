# Exam API Documentation

Base URL: `http://localhost:3000/exam`

All endpoints return JSON with the following error shape on failure:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "error description",
  "timestamp": "2026-06-12T12:00:00.000Z"
}
```

All endpoints require a valid JWT access token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

---

## Create Exam

Creates a new exam.

**Endpoint:** `POST /exam`

**Request Body:**

```json
{
  "name": "IELTS Listening Test 1",
  "description": "Full IELTS listening practice test",
  "durationMinutes": 30,
  "totalScore": 40,
  "visibility": "public",
  "thumbnailUrl": "https://cdn.example.com/thumb.jpg",
  "examTypeId": "uuid-of-exam-type",
  "isPublished": false
}
```

**Response `201`:**

```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "name": "IELTS Listening Test 1",
    "description": "Full IELTS listening practice test",
    "durationMinutes": 30,
    "totalScore": 40,
    "visibility": "public",
    "thumbnailUrl": "https://cdn.example.com/thumb.jpg",
    "examTypeId": "uuid-of-exam-type",
    "isPublished": false,
    "createdAt": "2026-06-12T12:00:00.000Z"
  },
  "message": "Exam created successfully",
  "status": 201
}
```

---

## Update Exam

Updates an existing exam.

**Endpoint:** `PATCH /exam/update/:examId`

**Request Body:**

```json
{
  "name": "IELTS Listening Test 1 - Updated",
  "description": "Updated description",
  "durationMinutes": 45,
  "totalScore": 40,
  "visibility": "public",
  "thumbnailUrl": "https://cdn.example.com/thumb-new.jpg",
  "examTypeId": "uuid-of-exam-type",
  "isPublished": true
}
```

**Response `200`:**

```json
{
  "data": {
    "id": "uuid",
    "name": "IELTS Listening Test 1 - Updated",
    "description": "Updated description",
    "durationMinutes": 45,
    "totalScore": 40,
    "visibility": "public",
    "isPublished": true
  },
  "message": "Exam updated successfully",
  "status": 200
}
```

---

## List All Published Exams

Returns all published exams (summary, without deep relations).

**Endpoint:** `GET /exam`

**Response `200`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "IELTS Listening Test 1",
      "description": "Full IELTS listening practice test",
      "durationMinutes": 30,
      "totalScore": 40,
      "visibility": "public",
      "isPublished": true,
      "examType": { "id": "uuid", "name": "IELTS", "code": "ielts" }
    }
  ],
  "message": "Exams fetched successfully",
  "status": 200
}
```

---

## Get Full Exam Tree

Returns an exam with its full nested structure: exam type, parts (sorted), each part's question groups (sorted), and each group's questions (sorted).

**Endpoint:** `GET /exam/:examId`

**Response `200`:**

```json
{
  "data": {
    "id": "uuid",
    "name": "IELTS Listening Test 1",
    "description": "Full IELTS listening practice test",
    "durationMinutes": 30,
    "totalScore": 40,
    "visibility": "public",
    "isPublished": true,
    "examType": { "id": "uuid", "name": "IELTS", "code": "ielts" },
    "parts": [
      {
        "id": "uuid",
        "name": "Section 1",
        "type": "listening",
        "partOrder": 1,
        "instruction": "Listen to the conversation and answer questions 1-5",
        "score": 10,
        "questionGroups": [
          {
            "id": "uuid",
            "content": "Listen to the following conversation...",
            "type": "single",
            "groupOrder": 1,
            "audioUrl": "https://cdn.example.com/audio/uuid.mp3",
            "transcript": "Full transcript text...",
            "questions": [
              {
                "id": "uuid",
                "type": "group",
                "content": "What is the speaker's main concern?",
                "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
                "score": 1,
                "questionOrder": 1
              }
            ]
          }
        ]
      }
    ]
  },
  "message": "Exam fetched successfully",
  "status": 200
}
```

---

## Get My Exams

Returns the current authenticated user's own exams.

**Endpoint:** `GET /exam/my`

**Response `200`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "My Custom Exam",
      "isPublished": false,
      "examType": { "id": "uuid", "name": "TOEIC", "code": "toeic" }
    }
  ],
  "message": "My exams fetched successfully",
  "status": 200
}
```

---

## List All Exam Types

Returns all available exam types (e.g., IELTS, TOEIC, TOEFL).

**Endpoint:** `GET /exam/exam-types`

**Response `200`:**

```json
{
  "data": [
    { "id": "uuid", "name": "IELTS", "code": "ielts", "description": "International English Language Testing System" },
    { "id": "uuid", "name": "TOEIC", "code": "toeic", "description": "Test of English for International Communication" }
  ],
  "message": "Exam types fetched successfully",
  "status": 200
}
```

---

## Get Exam Type by ID

Returns a single exam type.

**Endpoint:** `GET /exam/exam-types/:id`

**Response `200`:**

```json
{
  "data": {
    "id": "uuid",
    "name": "IELTS",
    "code": "ielts",
    "description": "International English Language Testing System"
  },
  "message": "Exam type fetched successfully",
  "status": 200
}
```

---

## Request Publishing

Requests publishing for an exam.

**Endpoint:** `POST /exam/publish/request`

**Request Body:**

```json
{
  "examId": "uuid-of-exam"
}
```

**Response `200`:**

```json
{
  "data": {
    "examId": "uuid",
    "status": "pending"
  },
  "message": "Publish request submitted successfully",
  "status": 200
}
```

---

## Create Part

Creates a new part within an exam.

**Endpoint:** `POST /exam/:examId/part`

**Request Body:**

```json
{
  "name": "Section 1",
  "type": "listening",
  "partOrder": 1,
  "instruction": "Listen to the conversation and answer questions 1-5",
  "score": 10
}
```

**Response `201`:**

```json
{
  "data": {
    "id": "uuid",
    "examId": "uuid",
    "name": "Section 1",
    "type": "listening",
    "partOrder": 1,
    "instruction": "Listen to the conversation and answer questions 1-5",
    "score": 10
  },
  "message": "Part created successfully",
  "status": 201
}
```

---

## Get Parts by Exam

Returns all parts for a given exam (with question groups).

**Endpoint:** `GET /exam/parts/exam/:examId`

**Response `200`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Section 1",
      "type": "listening",
      "partOrder": 1,
      "score": 10,
      "questionGroups": [
        { "id": "uuid", "groupOrder": 1, "type": "single", "content": "..." }
      ]
    }
  ],
  "message": "Parts fetched successfully",
  "status": 200
}
```

---

## Get Part Details

Returns a single part with its question groups and questions.

**Endpoint:** `GET /exam/part/:partId`

**Response `200`:**

```json
{
  "data": {
    "id": "uuid",
    "name": "Section 1",
    "type": "listening",
    "partOrder": 1,
    "instruction": "Listen to the conversation and answer questions 1-5",
    "score": 10,
    "questionGroups": [
      {
        "id": "uuid",
        "groupOrder": 1,
        "content": "Listen to the following conversation...",
        "audioUrl": "https://cdn.example.com/audio/uuid.mp3",
        "questions": [
          {
            "id": "uuid",
            "type": "group",
            "content": "What is the speaker's main concern?",
            "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
            "score": 1,
            "questionOrder": 1
          }
        ]
      }
    ]
  },
  "message": "Part fetched successfully",
  "status": 200
}
```

---

## Create Question Group

Creates a question group (e.g., a shared passage or audio segment) within a part. This endpoint requires the part's `type` to be `"group"` — it **cannot** be called on a part whose type is `"standalone"`.

**Endpoint:** `POST /exam/part/:partId/question-group`

**Request Body:**

```json
{
  "groupOrder": 1,
  "content": "Listen to the following conversation between two students...",
  "transcript": "Full transcript text here...",
  "type": "single"
}
```

**Response `201`:**

```json
{
  "data": {
    "id": "uuid",
    "partId": "uuid",
    "groupOrder": 1,
    "content": "Listen to the following conversation...",
    "transcript": "Full transcript text here...",
    "type": "single",
    "audioUrl": null
  },
  "message": "Question group created successfully",
  "status": 201
}
```

**Error `400` (standalone part):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Cannot create group question in standalone part",
  "timestamp": "2026-06-12T12:00:00.000Z"
}
```

---

## Get Question Groups by Part

Returns all question groups for a part (with their questions).

**Endpoint:** `GET /exam/question-group/part/:partId`

**Response `200`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "groupOrder": 1,
      "content": "Listen to the following conversation...",
      "type": "single",
      "questions": [
        { "id": "uuid", "content": "What is the speaker's main concern?", "questionOrder": 1 }
      ]
    }
  ],
  "message": "Question groups fetched successfully",
  "status": 200
}
```

---

## Get Question Group

Returns a single question group with its questions.

**Endpoint:** `GET /exam/question-group/:id`

**Response `200`:**

```json
{
  "data": {
    "id": "uuid",
    "groupOrder": 1,
    "content": "Listen to the following conversation...",
    "transcript": "Full transcript text...",
    "type": "single",
    "audioUrl": "https://cdn.example.com/audio/uuid.mp3",
    "questions": [
      {
        "id": "uuid",
        "type": "group",
        "content": "What is the speaker's main concern?",
        "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
        "score": 1,
        "questionOrder": 1
      }
    ]
  },
  "message": "Question group fetched successfully",
  "status": 200
}
```

---

## Upload Question Group Audio

Uploads an audio file for a question group. This endpoint uses `multipart/form-data` (no JSON).

**Endpoint:** `PATCH /exam/question-group/:questionGroupId/upload-audio`

**Headers:** The user ID is passed via `x-user-id` header.

| Header       | Value  |
|-------------|--------|
| `x-user-id` | `uuid` |

**Request Body:** `multipart/form-data`

| Field  | Type | Description       |
|--------|------|-------------------|
| `file` | File | Audio file (MP3, etc.) |

**Response `200`:**

```json
{
  "data": "https://cdn.example.com/audio/uuid.mp3",
  "message": "Question group audio uploaded successfully",
  "status": 200
}
```

---

## Create Question in Group

Creates a question that belongs to a question group.

**Endpoint:** `POST /exam/question-group/:questionGroupId/question`

**Request Body:**

```json
{
  "content": "What is the speakers main concern?",
  "explanation": "The speaker mentions that...",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correctOption": {
    "key": "B"
  },
  "score": 1,
  "questionOrder": 1
}
```

**Response `201`:**

```json
{
  "data": {
    "id": "uuid",
    "questionGroupId": "uuid",
    "type": "group",
    "content": "What is the speakers main concern?",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "score": 1,
    "questionOrder": 1
  },
  "message": "Question created successfully",
  "status": 201
}
```

---

## Get Questions by Group

Returns all questions in a question group (sorted by question order).

**Endpoint:** `GET /exam/question/by-group/:questionGroupId`

**Response `200`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "group",
      "content": "What is the speaker's main concern?",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "score": 1,
      "questionOrder": 1
    }
  ],
  "message": "Questions fetched successfully",
  "status": 200
}
```

---

## Get Questions by Part (Standalone)

Returns standalone questions that belong directly to a part (not inside a group).

**Endpoint:** `GET /exam/question/by-part/:partId`

**Response `200`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "separate",
      "content": "What is the sum of 2 and 3?",
      "options": { "A": "4", "B": "5", "C": "6", "D": "7" },
      "score": 1,
      "questionOrder": 1
    }
  ],
  "message": "Questions fetched successfully",
  "status": 200
}
```

---

## Get Question by ID

Returns a single question.

**Endpoint:** `GET /exam/question/:id`

**Response `200`:**

```json
{
  "data": {
    "id": "uuid",
    "type": "group",
    "content": "What is the speaker's main concern?",
    "explanation": "The speaker mentions that...",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "correctOption": { "key": "B" },
    "score": 1,
    "questionOrder": 1
  },
  "message": "Question fetched successfully",
  "status": 200
}
```

---

## Update Question

Updates an existing question's fields. The `questionId` comes from the URL path — do **not** include it in the request body. All other fields are optional; only provided fields are updated.

**Endpoint:** `PATCH /exam/question/:questionId`

**Request Body:**

```json
{
  "content": "What is the speaker's main concern?",
  "explanation": "The speaker mentions that...",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correctOption": {
    "key": "B"
  },
  "score": 2,
  "questionOrder": 1
}
```

**Response `200`:**

```json
{
  "data": {
    "id": "uuid",
    "type": "group",
    "content": "What is the speaker's main concern?",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "score": 2,
    "questionOrder": 1
  },
  "message": "Question updated successfully",
  "status": 200
}
```

---

## Create Separate Question in Part

Creates a standalone question directly in a part (not inside a group). This endpoint requires the part's `type` to be `"standalone"` — it **cannot** be called on a part whose type is `"group"`.

**Endpoint:** `POST /exam/part/:partId/question`

**Request Body:**

```json
{
  "content": "What is the sum of 2 and 3?",
  "explanation": "2 + 3 = 5",
  "options": {
    "A": "4",
    "B": "5",
    "C": "6",
    "D": "7"
  },
  "correctOption": {
    "key": "B"
  },
  "score": 1,
  "questionOrder": 1
}
```

**Response `201`:**

```json
{
  "data": {
    "id": "uuid",
    "partId": "uuid",
    "type": "separate",
    "content": "What is the sum of 2 and 3?",
    "options": { "A": "4", "B": "5", "C": "6", "D": "7" },
    "score": 1,
    "questionOrder": 1
  },
  "message": "Question created successfully",
  "status": 201
}
```

**Error `400` (group part):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Cannot create standalone question in group part",
  "timestamp": "2026-06-12T12:00:00.000Z"
}
```

---

## Create Session

Starts a new exam session (attempt).

**Endpoint:** `POST /exam/create-session/:examId`

**Request Body:**

```json
{
  "timeLimit": 1800
}
```

`timeLimit` is optional (seconds). Defaults to the exam's `durationMinutes` if omitted.

**Response `201`:**

```json
{
  "data": {
    "sessionId": "uuid",
    "startedAt": "2026-06-12T12:00:00.000Z",
    "timeLimitSeconds": 1800
  },
  "message": "Session created successfully",
  "status": 201
}
```

---

## Get Session

Returns session details with exam info and user answers.

**Endpoint:** `GET /exam/session/:sessionId`

**Response `200`:**

```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "status": "in_progress",
    "startedAt": "2026-06-12T12:00:00.000Z",
    "timeLimitSeconds": 1800,
    "exam": {
      "id": "uuid",
      "name": "IELTS Listening Test 1",
      "examType": { "id": "uuid", "name": "IELTS", "code": "ielts" }
    },
    "userAnswers": [
      {
        "id": "uuid",
        "question": { "id": "uuid", "content": "What is...", "correctOption": { "key": "B" } },
        "selectedOption": { "key": "B" },
        "isCorrect": true,
        "score": 1
      }
    ]
  },
  "message": "Session fetched successfully",
  "status": 200
}
```

---

## Get My Sessions

Returns all sessions for the current authenticated user.

**Endpoint:** `GET /exam/sessions/my`

**Response `200`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "status": "completed",
      "startedAt": "2026-06-12T12:00:00.000Z",
      "totalScore": 7,
      "totalCorrect": 7,
      "totalQuestions": 10,
      "correctRatio": 0.7,
      "exam": { "id": "uuid", "name": "IELTS Listening Test 1" }
    }
  ],
  "message": "Sessions fetched successfully",
  "status": 200
}
```

---

## Submit Answers

Saves (or updates) answers for an in-progress session. Can be called multiple times — previously saved answers for the same question are overwritten.

**Endpoint:** `POST /exam/submit-answers/:sessionId`

**Request Body:**

```json
{
  "answers": [
    {
      "questionId": "uuid",
      "selectedOption": { "key": "B" }
    },
    {
      "questionId": "uuid",
      "answerContent": "Written response text"
    }
  ]
}
```

Each answer should include the `questionId` and one of: `selectedOption`, `answerContent`, or `audioUrl`.

**Response `200`:**

```json
{
  "data": {
    "sessionId": "uuid",
    "answered": 2,
    "answers": [
      { "questionId": "uuid", "answerId": "uuid" },
      { "questionId": "uuid", "answerId": "uuid" }
    ]
  },
  "message": "Answers submitted successfully",
  "status": 200
}
```

---

## Finish Session

Finalizes an in-progress session: calculates scores, marks it completed, and returns the results.

**Endpoint:** `POST /exam/finish-session/:sessionId`

**Request Body:** (empty JSON)

```json
{}
```

**Response `200`:**

```json
{
  "data": {
    "sessionId": "uuid",
    "status": "completed",
    "totalScore": 7,
    "totalCorrect": 7,
    "totalQuestions": 10,
    "correctRatio": 0.7,
    "durationSeconds": 1245
  },
  "message": "Session finished successfully",
  "status": 200
}
```

---

## Summary

| Endpoint                                              | Method | Notes                    |
|-------------------------------------------------------|--------|--------------------------|
| `/exam`                                               | GET    | List published exams     |
| `/exam`                                               | POST   | Create exam              |
| `/exam/update/:examId`                                | PATCH  | Update exam              |
| `/exam/:examId`                                       | GET    | Full exam tree           |
| `/exam/my`                                            | GET    | User's own exams         |
| `/exam/exam-types`                                    | GET    | List exam types          |
| `/exam/exam-types/:id`                                | GET    | Exam type by ID          |
| `/exam/publish/request`                               | POST   | Request publishing       |
| `/exam/:examId/part`                                  | POST   | Create part              |
| `/exam/parts/exam/:examId`                            | GET    | Parts by exam            |
| `/exam/part/:partId`                                  | GET    | Part details with groups |
| `/exam/part/:partId/question-group`                   | POST   | Create question group    |
| `/exam/question-group/part/:partId`                   | GET    | Groups by part           |
| `/exam/question-group/:id`                            | GET    | Group with questions     |
| `/exam/question-group/:questionGroupId/upload-audio`  | PATCH  | `multipart/form-data`    |
| `/exam/question-group/:questionGroupId/question`      | POST   | Create question in group |
| `/exam/question/by-group/:questionGroupId`            | GET    | Questions in group       |
| `/exam/question/by-part/:partId`                      | GET    | Standalone questions     |
| `/exam/question/:id`                                  | GET    | Question by ID           |
| `/exam/question/:questionId`                          | PATCH  | Update question          |
| `/exam/part/:partId/question`                         | POST   | Create standalone question|
| `/exam/create-session/:examId`                        | POST   | Start session            |
| `/exam/session/:sessionId`                            | GET    | Session details          |
| `/exam/sessions/my`                                   | GET    | User's sessions          |
| `/exam/submit-answers/:sessionId`                     | POST   | Submit answers           |
| `/exam/finish-session/:sessionId`                     | POST   | Finish & score           |
