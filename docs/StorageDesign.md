# S3 Storage

* S3 supports expiry: https://aws.amazon.com/blogs/aws/amazon-s3-object-expiration/
* S3 Supprts versioning: https://docs.aws.amazon.com/AmazonS3/latest/dev/Versioning.html

# ESF Storage

* How many files can we store in a flat structure?
* How to implement pagination on a raw IO?
* Auto-expiry: will need to write a batch or a delayed queue system?
* Versioning and auto-purge versions: shadow folder structure to store and an async request to delete older versions?