#include "F:/frank/calculator/Extendables/extendables.jsx";

sendResults(10,10);

function sendResults(area,length){
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