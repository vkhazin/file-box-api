# API Design

* Reference: https://philsturgeon.uk/api/2016/01/04/http-rest-api-file-uploads/

## Reserved keywords
* Path cannot start with a `$` sign - reserved for special end-points, e.g. `/$search`

## Post File

* Post uploads a new file or a new version for a file

### Request

* POST /folder-name/sub-folder-name/file-name
* Https Headers:
```text
content-type: image/jpeg
x-api-key: a-long-string-may-be-a-uuid for authC and authZ purposes
x-metadata-key1: value1
x-metadata-key2: value2
x-ttl-sec: number of seconds to keep the file, default: 0 - keep forever
x-versions-to-keep: max number of versions to keep, default value is stored in the service configuration 
```
* Body: raw file content

### Response - Success
* Status: 201 - for new file | 200 - for existing file
* Body:
```json
{
  "metadata": [
    {
      "key1": "value1"
    },
    {
      "key2": "value2"
    }
  ],
  "link": "/folder-name/sub-folder-name/file-name",
  "versions": [0, 1, 2, 3],
  "ttl" : 0,
  "timestamp": "2018-01-31T02:34:00.345Z"
}
```
  
## Get File

### Request
* GET /folder-name/sub-folder-name/file-name
* Https Headers:
```text
x-api-key: a-long-string-may-be-a-uuid
x-version: version number to retrieve, default is null - get latest version available
```

### Response - Success
* Status: 200
* Headers:
```text
content-type: image/jpeg
x-metadata-key1: value1
x-metadata-key2: value2
x-version: 2
x-ttl : 0
x-timestamp: "2018-01-31T02:34:00.345Z
```
* Body: raw file content

## Search for Files

### Request
* GET /$search?q=/path/to/folder&from=0&size=10
* Https Headers:
```text
x-api-key: a-long-string-may-be-a-uuid
```
* Configuration settings, default size and max size, in case max size is exceeded: 404 with error details

### Response - Success
* Status: 200
* Body:
```json
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
    "link": "/folder-name/sub-folder-name/file-name",
    "versions": [0, 1, 2, 3]
    "ttl" : 0,
    "timestamp": "2018-01-31T02:34:00.345Z"
  },
  ...
]
```
* Note: may return an empty list in case of path not found or no files found in the path

## Request Failures
* Status: 500 - for uknown error |  
        401 - invalid/missing x-api-key |  
        403 - x-api-key not authorized for the action | 
        400 - invalid request in case `q` points to a file instead of a path prefix
* Body:
```json
{
  "message": "error messsage details"
}
```

## Delete File

### Request
* DELETE /folder-name/sub-folder-name/file-name
* Https Headers:
```text
content-type: applicaiton/json
x-api-key: a-long-string-may-be-a-uuid
x-version: version number to delete, default is `null` to delete all versions
```

### Response - Success
* Status: 200
* Body: empty

## Request Failures
* Status: 500 - for uknown error | 401 - invalid/missing x-api-key | 403 - x-api-key not authorized for the action
* Body:
```json
{
  "message": "error messsage details"
}
```