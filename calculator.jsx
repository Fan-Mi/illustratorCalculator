
calculateProcess();

function calculateProcess(){
    var file = new File("F:/frank/calculator/files/uploadFile.ai");
    var docRef = app.open (file);
    var items = app.activeDocument.pathItems;
    var area = 0;
    var length = 0;
    for(var i =0 ; i <items.length; i++){
            area = area + Math.abs(items[i].area/8.03521617);
    }
    for(var j =0 ; j <items.length; j++){
            length = length + items[j].length/2.8346567;
    }
    docRef.close();
    prepareHttpScript(area, length);
    runScript("estoolkit", "F:/frank/calculator/httpRequest.jsx"); 
}

function runScript(target, script)  
{  
    $.writeln("start "+script+" in "+target);  
    var bt = new BridgeTalk();  
    var finished = false;  
    bt.target = target;  
    bt.body = "$.evalFile('"+script+"');"  
    bt.onResult = function(res) {  
        $.writeln("\nfinished:\n"+res.body);  
        finished = true;  
    }  
    bt.onError = function(res) {  
        $.writeln("\nfinished with error:\n"+res.body);  
        finished = true;  
    }  
    bt.send();  
}  

function prepareHttpScript(area, length){
    var file = File("F:/frank/calculator/httpRequestContent.jsx");
    file.open("r");
    var script = file.read();
    var replaceString = "sendResults("+area+","+length+")";
    script = script.replace (/sendResults(...,...)/, replaceString);
    file.close();
    
    var writeFile = File("F:/frank/calculator/httpRequest.jsx");
    writeFile.open('w');
    writeFile.write (script);
    writeFile.close ();
}