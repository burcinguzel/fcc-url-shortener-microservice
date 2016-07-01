 	var http = require('http');
 	var mongo = require('mongodb');
 	var myDBClient = mongo.MongoClient;
 	var myDBUrl = process.env.MONGOLAB_URI;


 	var server = http.createServer(function(request, response) {
 	    var headUrl = request.url.substring(0, 5);
 	    var tailUrl = request.url.substring(5, request.url.length);

 	    if (request.method === 'GET' && headUrl === '/new/') { //first url control
 	        if (/^https?\:\/\//.test(tailUrl)) { //control for existance of  "http(s)://" 
 	            var parts = tailUrl.split(/^https?\:\/\//);
 	            if (/.[a-z]+$/.test(parts[1])) {
 	                var myRand = Math.floor(Math.random() * 9000) + 1000;
 	                myDBClient.connect(myDBUrl, function(err, db) {
 	                    if (err) {
 	                        console.log('Unable to connect to the mongoDB server. Error:', err);
 	                    } else {
 	                        var collection = db.collection('short_web');
 	                        collection.insert({
 	                            short: myRand,
 	                            long: tailUrl
 	                        }, function(error, res) {
 	                            if (error) {
 	                                console.log(error);
 	                            } else {
 	                                console.log(res);
 	                            }
 	                            db.close();
 	                        });
 	                    }
 	                });
 	                response.write(JSON.stringify({
 	                    original_url: tailUrl,
 	                    short_url: "https://" + request.rawHeaders[1] + "/" + myRand
 	                }), function(err) {
 	                    if (err) throw err;
 	                    response.end();
 	                });
 	            } else {
 	                response.write(JSON.stringify({
 	                    error: "Wrong url format, make sure you have a valid protocol and real site."
 	                }), function(err) {
 	                    if (err) throw err;
 	                    response.end();
 	                });
 	            }
 	        } else {
 	            response.write(JSON.stringify({
 	                error: "Wrong url format, make sure you have a valid protocol and real site."
 	            }), function(err) {
 	                if (err) throw err;
 	                response.end();
 	            });
 	        }

 	    } else if (/\/[0-9]+/.test(request.url)) {

 	        myDBClient.connect(myDBUrl, function(err, db) {
 	            if (err) {
 	                console.log('Unable to connect to the mongoDB server. Error:', err);
 	            } else {
 	                var collection = db.collection('short_web');
 	                console.log(request.url.substring(1, request.url.length));
 	                collection.find({
 	                    short: parseInt(request.url.substring(1, request.url.length))
 	                }).toArray(function(err, result) {
 	                    if (err) {
 	                        console.log(err);
 	                        throw err;
 	                    } else if (result.length) {

 	                        console.log(result[0]["long"]);
 	                        response.writeHead(301, {
 	                            Location: result[0]["long"]
 	                        });
 	                        response.end();

 	                    } else {
 	                        console.log("error:This url is not onteh database.");
 	                        response.write(JSON.stringify({
 	                            error: "This url is not onteh database."
 	                        }), function(err) {
 	                            if (err) throw err;
 	                            response.end();
 	                        });
 	                    }

 	                    db.close();
 	                });
 	            }
 	        });

 	    } else {
 	        response.statusCode = 404;
 	        response.write("Cannot GET " + request.url, function(err) {
 	            if (err) throw err;
 	            response.end();
 	        });
 	    }
 	});
 	server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
 	    var addr = server.address();
 	    console.log("Parser works on: ", addr.address + ":" + addr.port);
 	});