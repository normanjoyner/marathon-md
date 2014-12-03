marathon-md
====================

## About

### Description
A marathon application backup and restoration utility

### Author
* Norman Joyner - norman.joyner@gmail.com

## Getting Started

### Installing
Run ```npm install -g marathon-md``` to install marathon-md, and put it in your PATH.

## Usage & Examples
```marathon-md --help``` can be used for a comprehensive list of available commands and options. Below are two simple storage / restoration examples.

### Storing
```marathon-md s3-store --access-key-id AWS_ACCESS_KEY_ID --secret-access-key AWS_SECRET_ACCESS_KEY --marathon http://my.marathon.server --prefix us-east-1/production --bucket marathon-md```

### Restoring
```marathon-md s3-restore --access-key-id AWS_ACCESS_KEY_ID --secret-access-key AWS_SECRET_ACCESS_KEY --marathon http://my.marathon.server --prefix us-east-1/production --bucket marathon-md```

## Under the Hood

### Available Persistence Layers
* S3

## Contributing
Please feel free to contribute by opening issues and creating pull requests!
