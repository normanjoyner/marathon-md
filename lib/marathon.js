var request = require("request");
var async = require("async");

module.exports = {

    init: function(url){
        this.url = url;
    },

    get_applications: function(fn){
        var options = {
            url: [this.url, "v2", "apps"].join("/"),
            method: "GET",
            json: true
        }

        request(options, function(err, response){
            if(err || response.statusCode != 200)
                return fn();
            else
                return fn(response.body);
        });
    },

    create_applications: function(applications, fn){
        var self = this;
        var failures = [];

        async.each(applications, function(application, cb){
            var options = {
                url: [self.url, "v2", "apps"].join("/"),
                method: "POST",
                json: application
            }

            request(options, function(err, response){
                if(err || response.statusCode != 201)
                    failures.push(application.id);

                return cb();
            });
        }, function(){
            return fn(failures);
        });
    }

}
