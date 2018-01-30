# Testing with Postman

Postman can be used to easily submit requests to the API and review responses.  Sample requests are available for storing, fetching, deleting, and listing files.

## Setup

  1. Download and install Postman from [here](https://www.getpostman.com/).
  1. Import the configuration from /docs/postman/postman_collection.json
  1. Open the "SMITH FileBox" collection to reveal four request templates

## Usage

Sample requests are available for all basic use cases.  You can update them to test different scenarios, and you can enable the **X-FileBox-Mock** (value `true`) request header to use the static mock implementation.

### Store a file

  1. Open the **Post file** request
  1. Modify the path to reflect where you'd like to store the file
  1. On the Headers tab, update the request headers to reflect your file's content type
  1. Add a `X-Metadata-<key>` header for each piece of metadata to store; replace `<key>` with the metadata key (e.g. `X-Metadata-Color`)
  1. On the Body tab, ensure **binary** is selected and click **Choose Files** to select a file to upload
  1. Click **Send** to submit the request
  1. Confirm you receive a `200 OK` response containing metadata headers that echo those sent in the request

### Get a file

  1. Open the **Get file** request
  1. Modify the path to reflect where your file is stored
  1. Click **Send** to submit the request
  1. Confirm you receive a `200 OK` response containing metadata headers originally stored with the file

### Delete a file

  1. Open the **Delete file** request
  1. Modify the path to reflect where your file is stored
  1. Click **Send** to submit the request
  1. Confirm you receive a `204 No Content` response

### List files

  1. Open the **Search** request
  1. Modify the path to reflect search parameters (e.g. `?q=prefix:/sample&size=10`)
  1. Click **Send** to submit the request
  1. Confirm you receive a `204 No Content` response
