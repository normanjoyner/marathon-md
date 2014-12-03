var util = require("util");
var _ = require("lodash");
var async = require("async");
var AWS_SDK = require("aws-sdk");
var Persistence = require([__dirname, "..", "lib", "persistence"].join("/"));

function S3(config){
    this.initialize("s3");
    AWS_SDK.config.update(config);
    this.s3 = new AWS_SDK.S3();
}

util.inherits(S3, Persistence);

S3.prototype.store = function(options, fn){

    var key = options.key;

    if(!_.isUndefined(options.prefix))
        key = [options.prefix, key].join("/");

    var data = {
        Bucket: options.bucket,
        Key: key,
        ACL: "authenticated-read",
        Body: JSON.stringify(options.body),
        ContentType: "application/json",
    }

    this.s3.putObject(data, function(err, data) {
        return fn(err);
    });
}

S3.prototype.restore = function(options, fn){
    var self = this;
    var applications;
    var functions = [];

    if(_.isUndefined(options.key)){
        var data = {
            Bucket: options.bucket
        }

        if(!_.isUndefined(options.prefix))
            data.Prefix = options.prefix;

        functions.push(function(cb){
            self.s3.listObjects(data, function(err, data) {
                if(err)
                    throw err;

                if(_.has(data, "Contents")){
                    var objects = _.sortBy(data.Contents, function(object){
                        return new Date(object.LastModified).valueOf();
                    });

                    return cb(null, _.last(objects));
                }
                else
                    return cb(null, {});
            });
        });
    }
    else{
        functions.push(function(cb){
            var key = options.key;
            if(!_.isUndefined(options.prefix))
                key = [options.prefix, key].join("/");

            return cb(null, {Key: key});
        });
    }

    functions.push(function(object, cb){
        if(_.isUndefined(object))
            return fn(new Error("Could not find a valid backup!"));

        var data = {
            Bucket: options.bucket,
            Key: object.Key
        }

        self.s3.getObject(data, function(err, data){
            if(err)
                throw err;

            try{
                applications = JSON.parse(data.Body);
            }
            catch(e){
                return fn(e);
            }
            return cb(null);
        });
    });

    async.waterfall(functions, function(){
        return fn(null, applications);
    });
}

module.exports = S3;
