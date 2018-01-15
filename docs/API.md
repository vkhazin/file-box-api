# API Design

## Post File

### Request
POST /folder-name/sub-folder-name/file-name
Https Headers:
```
content-type: applicaiton/json
x-api-key: a-long-string-may-be-a-uuid
```
Body:
```
{
  "metadata": [
    {
      "key1": "value1"
    },
    {
      "key2": "value2"
    }
  ],
  "content": "base64-encoded-file-content"
}
```

### Response - Success
Status: 201 - for new file | 200 - for existing file
Body:
```
{
  "metadata": [
    {
      "key1": "value1"
    },
    {
      "key2": "value2"
    }
  ],
  "path": "/folder-name/sub-folder-name/file-name"
}
```

## Get File

### Request
GET /folder-name/sub-folder-name/file-name
Https Headers:
```
x-api-key: a-long-string-may-be-a-uuid
```

### Response - Success
Status: 200
Body:
```
{
  "metadata": [
    {
      "key1": "value1"
    },
    {
      "key2": "value2"
    }
  ],
  "path": "/folder-name/sub-folder-name/file-name",
  "content": "base64-encoded-file-content"
}
```
## List Files

### Request
GET /folder-name/sub-folder-name?from=0&size=10
Https Headers:
```
x-api-key: a-long-string-may-be-a-uuid
```
### Response - Success
Status: 200
Body:
```
[
  {
    "metadata": [
      {
        "key1": "value1"
      },
      {
        "key2": "value2"
      }
    ],
    "path": "/folder-name/sub-folder-name/file-name"
  },
  ...
]
```

## Delete File/Folder

### Request
DELETE /folder-name/sub-folder-name/[file-name]
Https Headers:
```
content-type: applicaiton/json
x-api-key: a-long-string-may-be-a-uuid
```

### Response - Success
Status: 200
Body: empty

## Request Failures
Status: 500 - for uknown error | 401 - invalid/missing x-api-key | 403 - x-api-key not authorized for the action
Body:
```
{
  "message": "error messsage details"
}
```