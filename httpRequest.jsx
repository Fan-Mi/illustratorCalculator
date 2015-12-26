#include "F:/frank/calculator/Extendables/extendables.jsx";

sendResults(7652.41977106848,370.728770141957);

function sendResults(area,length){

for(var i=0; i<100; i++){
	$.writeln(i);
}
    var http = require("http");
    var req_string = "http://localhost:9999/results?area="+area+"&length="+length;
    var req = new http.HTTPRequest("PUT", req_string);
    req.follow_redirects(false);
    var timeout = req.timeout();
    req.timeout(10);
    $.writeln("Changing timeout from {} to {} seconds".format(timeout, 10));
    req.header("User-Agent", "My ExtendScript app");
    var res = req.do();
    return res;
}