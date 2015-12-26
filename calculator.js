require('shelljs/global');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var router = express.Router();
var fs = require('fs');
var fse = require('fs-extra');
var formidable = require("formidable");
var util = require('util');
var DelayedResponse = require('http-delayed-response');
var http = require('http');

area=0;
length=0;
calculating_flag = false;

var app = express();

app.set('views', './views');
app.set('view engine', 'jade');

app.all('/upload', function(req, res,next){
	if(req.method.toLowerCase() == 'get'){
		displayForm(res);
	}else if(req.method.toLowerCase()== 'post'){
		
	}
});

app.post('/myaction', function(req, res) {
 if(calculating_flag == false){
	  processForm(req);
	  console.log("About to calculate area and length");
	  //var spawn = require('child_process').spawn,
	  //ls    = spawn('cmd.exe', ['/c', 'calculator.bat']);
	  var cp = require('child_process');
	  var result = cp.spawnSync('cmd.exe', ['/c', 'calculator.bat']);
	  
	  res.send(false);
 }else{
	  calculating_flag = false;
	  console.log("reset calculation_flag" + calculating_flag);
	  res.send('area: ' + area);
 }
});

app.all('/results', function(req, res){
	area = req.param('area');
	length = req.param('length');
	res.sendStatus(200);
	console.log("area: "+area);
	console.log("length: "+length);
	console.log("globel variable writted...");
	calculating_flag = true;
	console.log("calculation_flag changes: "+ calculating_flag);
});

app.listen(9999);

function displayForm(res) {
    fs.readFile('form.html', function (err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
                'Content-Length': data.length
        });
        res.write(data);
        res.end();
    });
}

function processForm(req){
    var fields = [];
    var form = new formidable.IncomingForm();

    form.on('field', function (field, value) {
        fields[field] = value;
    });

    form.on('file', function (name, file) {
        fields[name] = file;
		
        var temp_path = file.path;
		var file_name = 'uploadFile.ai';
        var new_location = 'files/';
 
        fse.copy(temp_path, new_location + file_name, function(err) {  
            if (err) {
                console.error(err);
            } else {
                console.log("success!")
            }
        });
    });

    form.on('end', function () {
		  console.log("form ends: ");
    });
    form.parse(req);
}
