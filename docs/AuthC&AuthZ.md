# Authentication

## Overview

* Requestor to pass an x-api-key https header
* Service to validate x-api-key is known using env variables configuration settings

# Authorization

## Overview

* Requesto to pass an x-api-key https headers
* Service to validate the request against the acl

## Acl Structure
```
{
  "acl": {
    "authCHeader": "x-api-key",
    "apiKeys": [
      {
        "apiKey": "29ed67a1-0818-442c-9729-6a342998872c",
        "roles": [
          "full-access-all"
        ]
      },
      {
        "apiKey": "35ed67a1-0818-442c-9729-6a342998873g",
        "roles": [
          "read-only-all"
        ]
      }      
    ],
    "roles": [
      {
        "role": "full-access",
        "verbs": [
          "(.+)"
        ],
        "urls": [
          "(.+)"
        ]
      },
      {
        "role": "read-only",
        "verbs": [
          "get"
        ],
        "urls": [
          "folder1/sub-folder-2/(.+)"
        ]
      }      
    ]
  }
}
```