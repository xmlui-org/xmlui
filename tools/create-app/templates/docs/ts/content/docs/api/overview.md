# API Reference — Overview

This section documents the API exposed by your project. Replace the placeholder content
below with your actual API documentation.

## Base URL

```
https://api.example.com/v1
```

## Authentication

All endpoints require an `Authorization` header with a Bearer token:

```
Authorization: Bearer <your-token>
```

## Response Format

All responses are JSON. Successful responses follow this structure:

```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 100
  }
}
```

Error responses:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested resource was not found."
  }
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK — request succeeded |
| 201  | Created — resource was created |
| 400  | Bad Request — invalid input |
| 401  | Unauthorized — missing or invalid token |
| 403  | Forbidden — insufficient permissions |
| 404  | Not Found — resource does not exist |
| 500  | Internal Server Error |

## Rate Limiting

Requests are limited to **100 per minute** per API key.
Exceeding the limit returns a `429 Too Many Requests` response with a
`Retry-After` header indicating when to retry.

## SDKs

| Language | Package |
|----------|---------|
| JavaScript / TypeScript | `npm install @example/sdk` |
| Python | `pip install example-sdk` |
| Go | `go get github.com/example/sdk` |

See [Endpoints](/api/endpoints) for the full list of available operations.
