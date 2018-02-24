# API Design

The service is designed to be self-describing using Swagger UI documentation at the [/$docs](https://nic9r7i7z6.execute-api.us-west-2.amazonaws.com/test/smith-file-box/$docs) endpoint.  Sample requests and responses for managing a PNG image are described in this document to illustrate how the API is intended to be used.

## Reserved Keywords

Paths cannot begin with `$`; this is reserved for "command" endpoints (e.g. `/$search`).

## Metadata

Metadata is stored as key/value pairs.  It is submitted and received in HTTP headers with the prefix `x-metadata-`.  For example, `color=blue` would be represented as `x-metadata-color: blue`.

- Keys should consist of only alphanumeric characters and dashes (`-`)
- Metadata keys will be stored in all lowercase characters

## Store a File

Upload a new file or a new version of an existing file.  Metadata is specified in HTTP headers, and the request body contains the binary file content.

Request:

```text
POST /path/to/file.png
Accept: application/json
Content-Type: image/png
x-api-key: a-long-string-may-be-a-uuid
x-metadata-key1: value1
x-metadata-key2: value2

(binary file content)
```

Response:

```text
201 Created
Location: /path/to/file.png
x-metadata-key1: value1
x-metadata-key2: value2
```

## Retrieve a File

Download the most recent version of a specific file.  Metadata is returned in HTTP headers, and the response body contains the binary file content.

Request:

```text
GET /path/to/file.png
Accept: image/png
x-api-key: a-long-string-may-be-a-uuid
```

Response:

```text
200 OK
Content-Type: image/png
x-metadata-key1: value1
x-metadata-key2: value2

(binary file content)
```

## Delete a File

Deletes a specific file.  No metadata or content is returned.

Request:

```text
DELETE /path/to/file.png
x-api-key: a-long-string-may-be-a-uuid
```

Response:

```text
204 No content
```

## File Search

Searches for files with a specific path prefix.  Search parameters are specified in the querystring:

| Parameter | Required | Notes |
| --------- |:--------:| ----- |
| q         | Yes      | The type and path; currently only "prefix" searching is supported |
| size      | No       | The maximum number of files to return |
| from      | No       | If provided, searching begins after this path (alphabetically) |
| token     | No       | A continuation token returned from a previous search and used for paging |

Request:

```text
GET /$search?q=prefix:/path/&from=/path/file3.png&size=10
Accept: application/json
x-api-key: a-long-string-may-be-a-uuid
```

Response:

Note: JSON body content shown formatted for readability; actual content is condensed with unnecessary whitespace removed.

```text
200 OK
Content-Type: application/json

{
  "moreResults": false,
  "results": [
    {
      "path": "/sample/file4.txt",
      "size": 1234,
      "timestamp": "2018-01-31T17:32:00.869Z"
    },
    {
      "path": "/sample/file5.gif",
      "size": 1234,
      "timestamp": "2018-01-31T17:32:00.869Z"
    }
  ]
}
```

## Echo Request

Request:

```text
GET /$echo
```

Response:

Return Service Information

```text
200 OK
Content-Type: application/json
{"version":"1.0.0","node":"v6.10.3"}

```