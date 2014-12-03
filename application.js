#!/usr/bin/env node
var _ = require("lodash");
var async = require("async");
var nomnom = require("nomnom");
var pkg = require([__dirname, "package"].join("/"));
var marathon = require([__dirname, "lib", "marathon"].join("/"));
var logger = require([__dirname, "lib", "logger"].join("/"));

nomnom.script(pkg.name);

var default_options = {
    version: {
        flag: true,
        abbr: "v",
        help: "print version and exit",
        callback: function(){
            return pkg.version;
        }
    },

    marathon: {
        help: "Address of the marathon server",
        required: true
    }
}

var s3_store_options = _.defaults(default_options, {
    region: {
        help: "AWS Region",
        default: "us-east-1"
    },

    "access-key-id": {
        help: "AWS access key id",
        required: true
    },

    "secret-access-key": {
        help: "AWS secret access key",
        required: true
    },

    "path-prefix": {
        help: "S3 path prefix"
    },

    bucket: {
        help: "S3 bucket used for persistence",
        required: true
    }
});

var s3_restore_options = _.defaults(default_options, {
    region: {
        help: "AWS Region",
        default: "us-east-1"
    },

    "access-key-id": {
        help: "AWS access key id",
        required: true
    },

    "secret-access-key": {
        help: "AWS secret access key",
        required: true
    },

    prefix: {
        help: "S3 path prefix"
    },

    bucket: {
        help: "S3 bucket used for persistence",
        required: true
    },

    filename: {
        help: "Name of the file to store or restore",
        required: false
    }
});

nomnom.command("s3-store").options(s3_store_options).callback(function(options){
    var S3 = require([__dirname, "persistence", "s3"].join("/"));
    var s3 = new S3({
        region: options.region,
        credentials: {
            accessKeyId: options["access-key-id"],
            secretAccessKey: options["secret-access-key"]
        }
    });

    if(_.isUndefined(options.filename))
        filename = new Date().valueOf().toString();

    marathon.init(options.marathon);

    marathon.get_applications(function(response){
        if(_.isUndefined(response))
            logger.log("error", "Invalid response from Marathon API!");

        s3.store({
            bucket: options.bucket,
            prefix: options.prefix,
            key: filename,
            body: response
        }, function(err){
            if(err)
                logger.log("error", err.message);
            else
                logger.log("info", ["Successfully stored", response.apps.length, "applications in bucket", options.bucket].join(" "));
        });
    });
});

nomnom.command("s3-restore").options(s3_store_options).callback(function(options){
    var S3 = require([__dirname, "persistence", "s3"].join("/"));
    var s3 = new S3({
        region: options.region,
        credentials: {
            accessKeyId: options["access-key-id"],
            secretAccessKey: options["secret-access-key"]
        }
    });

    marathon.init(options.marathon);

    s3.restore({
        bucket: options.bucket,
        prefix: options.prefix,
        key: options.filename
    }, function(err, applications){
        if(err)
            logger.log("error", err.message)
        else{
            marathon.create_applications(applications.apps, function(errors){
                var total = applications.apps.length;
                logger.log("info", ["Successfully restored ", (total - errors.length), "/", total, " applications"].join(""));
                if(!_.isEmpty(errors))
                    logger.log("error", ["The following applications failed to restore:", errors.join(", ")].join(" "));
            });
        }
    });
});

nomnom.parse();
