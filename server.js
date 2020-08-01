//Initiating Global Variables
var express = require('express');
var app = express();
const port = process.env.PORT;
//Firebase Init
var firebase = require('firebase');
require('firebase/app');
require('firebase/database');

firebase.initializeApp({
	    apiKey: process.env.APIKEY,
	    authDomain: process.env.AUTHDOMAIN,
	    databaseURL: process.env.DATABASEURL,
	    projectId: process.env.PROJECTID,
	    storageBucket: process.env.STORAGEBUCKET,
	    messagingSenderId: process.env.MESSAGINGSENDERID,
	    appId: process.env.APPID,
	    measurementId: process.env.MEASUREMENTID
});


//Beginning Server Commands
var server = app.listen(port, function() {
	console.log('Our app is running on http://localhost:' + port);
});


//Creating socket connection
var io = require('socket.io')(server);
io.on('connection', function(socket) {

 	var clientIp = socket.request.connection.remoteAddress;
 	var clientTime = socket.handshake.time;

	//Confirming a socket connection
    console.log("User: "+socket.id+", Connected.");

function datainputreaction(reactant, product) {
	if ((reactant == duparr[0]) && (product == duparr[1])) {
		console.log("already clicked.");
	} else {
		duparr = [reactant, product];
		var reactioncombine = firebase.database().ref('userInput/reaction-combo/'+reactant+'-'+product);
		var reactionreactant = firebase.database().ref('userInput/reaction-reactant/'+reactant);
		var reactionproduct = firebase.database().ref('userInput/reaction-product/'+product);

			reactioncombine.transaction(function(currentClicks) {
	  		return (currentClicks || 0) + 1;
			});      
			reactionreactant.transaction(function(currentClicks) {
	  		return (currentClicks || 0) + 1;
			});  
			reactionproduct.transaction(function(currentClicks) {
	  		return (currentClicks || 0) + 1;
			});  
	}
}



//[FIRST COMPOUND, SECOND COMPOUND, CATALYST/MEDIUM, REACTION TYPE, BIPRODUCTS]
var reactionarr = [
["alkane", "chloro", "Cl2-UV Light", "substitution", "+ HCl"], 
["alkane", "combustion", "O2", "combustion", ""], 
["alkene", "alkane", "H2", "addition", ""],
["alkene", "dichloro", "Cl2", "addition", ""],
["alkene", "chloro", "HCl", "addition", ""],
["alkene", "alcohol", "H2O", "addition", ""],
["alcohol", "alkene", "H2SO4", "dehydration", "+ H2O"],
["chloro", "alcohol", "NaOH/KOH/H2O-H3PO4", "substitution", "+ KCl"],
["alcohol", "aldehyde", "Cu-300C/MnO4-H+", "oxidation", ""],
["alcohol", "carbox", "MnO4-H+/Cr2O72-/H+", "oxidation", ""],
["aldehyde", "carbox", "MnO4-H+/Cr2O72-/H+", "oxidation", ""],
["alcohol", "ketone", "MnO4-H+/Cr2O72-/H+", "oxidation", ""],
["alcohol", "carbox/ester", "H2SO4", "esterfication", "+ H2O"],
["carbox", "alcohol/ester", "H2SO4", "esterfication", "+ H2O"],
["alkyne", "alkene", "H2", "addition", ""]
// ["ester", "ester", "H2O", "hydrolysis", "+ alcohol"],
];

socket.emit('reactionarr', reactionarr);

function reset() {
	var userinput = firebase.database().ref('userInput/');
	var activeusers = firebase.database().ref('storeData/activeusers/');
	var clientdata = firebase.database().ref('storeData/clientData/');

	var ref = firebase.database().ref('storeData/refresh/refresh-counter');
	var ref2 = firebase.database().ref('storeData/refresh/clientTime');

	activeusers.remove();
	clientdata.remove();
	ref2.remove();
	ref.set(0);
	userinput.remove();


}

// reset();

socket.on('listreact', async function(data) {
    if ((data[0] == "") || (data[1] == "")) {
        socket.emit('listreact', 0); 
    }

    for (var i = 0; i < reactionarr.length; i++) {
        if (data[0] == reactionarr[i][0]) {
                for (var k = 0; k < reactionarr.length; k++) {
                    if (data[1] == reactionarr[k][1]) {
                        if (data[0] != data[1]) {
                            if (data[0] == data[1]) {
                                return socket.emit('listreact', 2); 
                            } else {
								return socket.emit('listreact', 1);    
                            }    
                        }     
                    } 
                }
        } else {
        	socket.emit('listreact', 0); 
        }
    }
});

socket.on('listreact2', async function(data) {
    if ((data[0] == "") || (data[1] == "")) {
       socket.emit('listreact2', 0);  
    }

    for (var i = 0; i < reactionarr.length; i++) {
        if (data[0] == reactionarr[i][0]) {
                for (var k = 0; k < reactionarr.length; k++) {
                    if (data[1] == reactionarr[k][1]) {
                        if (data[0] != data[1]) {
                        	return socket.emit('listreact2', 1);          
                        }          
                    } 
                }
        } else {
		 socket.emit('listreact2', 0);                    
        }
    }
});

var duparr =[];

socket.on('listreactions', async function(data) {
	var actualarr = [];
	var input1 = await data[0];
	var input2 = await data[1];
    datainputreaction(input1, input2);

 	    // //Exceptions
    if (input1 == "ester" && input2 == "ester") {
        var resultdata = ""+reactionarr[15][0]+"-[CH3] ("+reactionarr[15][2]+") ("+reactionarr[15][3]+") ----> "+reactionarr[15][1]+"-[OH] "+reactionarr[15][4];      
        socket.emit('productresult', resultdata);
    } 

    //Automations
    for (var i = 0; i < reactionarr.length; i++) {
        if (input1 == reactionarr[i][0]) {
            if (reactionarr[i][0] !== reactionarr[i][1]) {
                if (input2 == reactionarr[i][1]) {
        			var resultdata = ""+reactionarr[i][0]+" ("+reactionarr[i][2]+") ("+reactionarr[i][3]+") ----> "+reactionarr[i][1]+" "+reactionarr[i][4];         			
        			await actualarr.push([0,resultdata])
					await actualarr.sort();                			
        			// console.log("Reaction First: "+actualarr[0][1]);   	  	   
        			// console.log("Reaction Array: "+actualarr[0][0]);   	  	
        			socket.emit('productresult', actualarr[0][1]);                			        			  				        			
                }
            }
        

    for (var k = 0; k < reactionarr.length; k++) {
        if (reactionarr[k][0] == reactionarr[i][1]) {
            if ((reactionarr[i][0] !== reactionarr[k][1]) && (reactionarr[i][0] !== reactionarr[k][1])) {
                if (input2 == reactionarr[k][1]) {
        			var resultdata = ""+reactionarr[i][0]+" ("+reactionarr[i][2]+") ("+reactionarr[i][3]+") ----> "+reactionarr[i][1]+" "+reactionarr[i][4]+"  ("+reactionarr[k][2]+") ("+reactionarr[k][3]+") ----> "+reactionarr[k][1]+" "+reactionarr[k][4];
        			await actualarr.push([1,resultdata])
					await actualarr.sort();        				
        			// console.log("Reaction First: "+actualarr[0][1]);   	   
        			// console.log("Reaction Array: "+actualarr[0][0]);   	  
        			socket.emit('productresult', actualarr[0][1]);                				       			
                }
            }

    for (var t = 0; t < reactionarr.length; t++) {
        if (reactionarr[t][0] == reactionarr[k][1]) {
            if ((reactionarr[i][0] !== reactionarr[k][1]) && (reactionarr[i][0] !== reactionarr[k][1]) && (reactionarr[i][1] !== reactionarr[t][1]) && (reactionarr[i][0] !== reactionarr[t][1])) {
                if (input2 == reactionarr[t][1]) {
        			var resultdata = ""+reactionarr[i][0]+" ("+reactionarr[i][2]+") ("+reactionarr[i][3]+") ----> "+reactionarr[i][1]+" "+reactionarr[i][4]+" ("+reactionarr[k][2]+") ("+reactionarr[k][3]+") ----> "+reactionarr[k][1]+" "+reactionarr[k][4]+" ("+reactionarr[t][2]+") ("+reactionarr[t][3]+") ----> "+reactionarr[t][1]+" "+reactionarr[t][4];	
        			await actualarr.push([2,resultdata])	        	
					await actualarr.sort();     
        			// console.log("Reaction First: "+actualarr[0][1]);   	
        			// console.log("Reaction Array: "+actualarr[0][0]);  
        			socket.emit('productresult', actualarr[0][1]);                			         						           						
                }
            }

    for (var j = 0; j < reactionarr.length; j++) {
        if (reactionarr[j][0] == reactionarr[t][1]) {
            if ((reactionarr[i][0] !== reactionarr[k][1]) && (reactionarr[i][0] !== reactionarr[k][1]) && (reactionarr[i][1] !== reactionarr[t][1]) && (reactionarr[i][0] !== reactionarr[t][1]) && (reactionarr[i][0] !== reactionarr[j][1]) && (reactionarr[i][0] !== reactionarr[t][1]) && (reactionarr[k][1] !== reactionarr[j][1]) && (reactionarr[i][1] !== reactionarr[j][1])) {
                if (input2 == reactionarr[j][1]) {
        			var resultdata = ""+reactionarr[i][0]+" ("+reactionarr[i][2]+") ("+reactionarr[i][3]+") ----> "+reactionarr[i][1]+" "+reactionarr[i][4]+" ("+reactionarr[k][2]+") ("+reactionarr[k][3]+") ----> "+reactionarr[k][1]+" "+reactionarr[k][4]+" ("+reactionarr[t][2]+") ("+reactionarr[t][3]+") ----> "+reactionarr[t][1]+" "+reactionarr[t][4]+" ("+reactionarr[j][2]+") ("+reactionarr[j][3]+") ----> "+reactionarr[j][1]+" "+reactionarr[j][4];     			
        			await actualarr.push([3,resultdata])
					await actualarr.sort();   
        			// console.log("Reaction First: "+actualarr[0][1]);   		 	
        			// console.log("Reaction Array: "+actualarr[0][0]);           	
        			socket.emit('productresult', actualarr[0][1]);          				             				          
                }
            }
        }
    }



        }
    }


        }
    }




        }
    }
}); 

socket.on('listreactions2', async function(data) {

	var input1 = await data[0];
	var input2 = await data[1];


 	    // //Exceptions
    if (input1 == "ester" && input2 == "ester") {
        var resultdata = ""+reactionarr[15][0]+"-[CH3] ("+reactionarr[15][2]+") ("+reactionarr[15][3]+") ----> "+reactionarr[15][1]+"-[OH] "+reactionarr[15][4];      
        socket.emit('productresult', resultdata);
    } 

    //Automations
    for (var i = 0; i < reactionarr.length; i++) {
        if (input1 == reactionarr[i][0]) {
            if (reactionarr[i][0] !== reactionarr[i][1]) {
                if (input2 == reactionarr[i][1]) {
        			var resultdata = ""+reactionarr[i][0]+" ("+reactionarr[i][2]+") ("+reactionarr[i][3]+") ----> "+reactionarr[i][1]+" "+reactionarr[i][4];
        			return socket.emit('productresult', resultdata);
                }
            }
        

    for (var k = 0; k < reactionarr.length; k++) {
        if (reactionarr[k][0] == reactionarr[i][1]) {
            if ((reactionarr[i][0] !== reactionarr[k][1]) && (reactionarr[i][0] !== reactionarr[k][1])) {
                if (input2 == reactionarr[k][1]) {
        			var resultdata = ""+reactionarr[i][0]+" ("+reactionarr[i][2]+") ("+reactionarr[i][3]+") ----> "+reactionarr[i][1]+" "+reactionarr[i][4]+"  ("+reactionarr[k][2]+") ("+reactionarr[k][3]+") ----> "+reactionarr[k][1]+" "+reactionarr[k][4];
        			return socket.emit('productresult', resultdata);
                }
            }

    for (var t = 0; t < reactionarr.length; t++) {
        if (reactionarr[t][0] == reactionarr[k][1]) {
            if ((reactionarr[i][0] !== reactionarr[k][1]) && (reactionarr[i][0] !== reactionarr[k][1]) && (reactionarr[i][1] !== reactionarr[t][1]) && (reactionarr[i][0] !== reactionarr[t][1])) {
                if (input2 == reactionarr[t][1]) {
        			var resultdata = ""+reactionarr[i][0]+" ("+reactionarr[i][2]+") ("+reactionarr[i][3]+") ----> "+reactionarr[i][1]+" "+reactionarr[i][4]+" ("+reactionarr[k][2]+") ("+reactionarr[k][3]+") ----> "+reactionarr[k][1]+" "+reactionarr[k][4]+" ("+reactionarr[t][2]+") ("+reactionarr[t][3]+") ----> "+reactionarr[t][1]+" "+reactionarr[t][4];
        			return socket.emit('productresult', resultdata);  			
                }
            }

    for (var j = 0; j < reactionarr.length; j++) {
        if (reactionarr[j][0] == reactionarr[t][1]) {
            if ((reactionarr[i][0] !== reactionarr[k][1]) && (reactionarr[i][0] !== reactionarr[k][1]) && (reactionarr[i][1] !== reactionarr[t][1]) && (reactionarr[i][0] !== reactionarr[t][1]) && (reactionarr[i][0] !== reactionarr[j][1]) && (reactionarr[i][0] !== reactionarr[t][1]) && (reactionarr[k][1] !== reactionarr[j][1]) && (reactionarr[i][1] !== reactionarr[j][1])) {
                if (input2 == reactionarr[j][1]) {
        			var resultdata = ""+reactionarr[i][0]+" ("+reactionarr[i][2]+") ("+reactionarr[i][3]+") ----> "+reactionarr[i][1]+" "+reactionarr[i][4]+" ("+reactionarr[k][2]+") ("+reactionarr[k][3]+") ----> "+reactionarr[k][1]+" "+reactionarr[k][4]+" ("+reactionarr[t][2]+") ("+reactionarr[t][3]+") ----> "+reactionarr[t][1]+" "+reactionarr[t][4]+" ("+reactionarr[j][2]+") ("+reactionarr[j][3]+") ----> "+reactionarr[j][1]+" "+reactionarr[j][4];
        			return socket.emit('productresult', resultdata);      		          
                }
            }
        }
    }



        }
    }


        }
    }




        }
    }
}); 


var filtered;
//This removes all the duplicates from listarr and makes it into a new array called filtered.
function removeduplicates(array) {
    var ret_array = new Array();
    filtered = [];
    for (var a = array.length - 1; a >= 0; a--) {
        for (var b = array.length - 1; b >= 0; b--) {
            if(array[a] == array[b] && a != b){
                delete array[b];
            }
        };
        
        if(array[a] != undefined)
            ret_array.push(array[a]);
    };
    filtered = array.filter(function (el) {
        return el != null;
    });

    return filtered;

}

function search(input1, input2, typearr, newarr) {

    for (var i = 0; i < typearr.length; i++) {
        if (input1 == typearr[i][0]) {
            if (typearr[i][0] !== typearr[i][1]) {
                    // console.log(""+typearr[i][0]+" ("+typearr[i][2]+") ("+typearr[i][3]+") --> "+typearr[i][1]+" "+typearr[i][4]);
                    newarr.push(typearr[i][1]);
            }
        

    for (var k = 0; k < typearr.length; k++) {
        if (typearr[k][0] == typearr[i][1]) {
            if ((typearr[i][0] !== typearr[k][1]) && (typearr[i][0] !== typearr[k][1])) {
                    // console.log(""+typearr[i][0]+" ("+typearr[i][2]+") ("+typearr[i][3]+") --> "+typearr[i][1]+" ("+typearr[k][2]+") ("+typearr[k][3]+") --> "+typearr[k][1]+" "+typearr[k][4])
                    newarr.push(typearr[k][1]);
            }

    for (var t = 0; t < typearr.length; t++) {
        if (typearr[t][0] == typearr[k][1]) {
            if ((typearr[i][0] !== typearr[k][1]) && (typearr[i][0] !== typearr[k][1]) && (typearr[i][1] !== typearr[t][1]) && (typearr[i][0] !== typearr[t][1])) {
                    // console.log(""+typearr[i][0]+" ("+typearr[i][2]+") ("+typearr[i][3]+") --> "+typearr[i][1]+" ("+typearr[k][2]+") ("+typearr[k][3]+") --> "+typearr[k][1]+" ("+typearr[t][2]+") ("+typearr[t][3]+") --> "+typearr[t][1]+" "+typearr[t][4])
                    newarr.push(typearr[t][1]);
            }

    for (var j = 0; j < typearr.length; j++) {
        if (typearr[j][0] == typearr[t][1]) {
            if ((typearr[i][0] !== typearr[k][1]) && (typearr[i][0] !== typearr[k][1]) && (typearr[i][1] !== typearr[t][1]) && (typearr[i][0] !== typearr[t][1]) && (typearr[i][0] !== typearr[j][1]) && (typearr[i][0] !== typearr[t][1]) && (typearr[k][1] !== typearr[j][1]) && (typearr[i][1] !== typearr[j][1])) {
                    // console.log(""+typearr[i][0]+" ("+typearr[i][2]+") ("+typearr[i][3]+") --> "+typearr[i][1]+" ("+typearr[k][2]+") ("+typearr[k][3]+") --> "+typearr[k][1]+" ("+typearr[t][2]+") ("+typearr[t][3]+") --> "+typearr[t][1]+" ("+typearr[j][2]+") ("+typearr[j][3]+") --> "+typearr[j][1]+" "+typearr[j][4])
                    newarr.push(typearr[j][1]);
            }
        }
    }



        }
    }


        }
    }




        }
    }   
}


	socket.on('checkinput1', async function(data) {
	    await removeduplicates(data);
	    socket.emit('checkinput1', filtered)
	}); 

	socket.on('checkinput2', async function(data) {
		search(data[0], data[1], data[2], data[3])
	    await removeduplicates(data[3]);
		// console.log(filtered); //listing all possible reactions based from groupone.value
	    socket.emit('checkinput2', filtered);
	}); 


    socket.emit('socketid', socket.id);

	console.log('User Address: '+clientIp);

	//Adding connection from userto database
	var sourceAddressUser = firebase.database().ref('storeData/activeusers/'+socket.id+'/clientAddress');
	var sourceTimeUser = firebase.database().ref('storeData/activeusers/'+socket.id+'/clientTime');
	var sourceAddress= firebase.database().ref('storeData/clientData/'+socket.id+'/clientAddress');
	var sourceTime = firebase.database().ref('storeData/clientData/'+socket.id+'/clientTime');
	sourceAddressUser.push().set(clientIp);
    sourceTimeUser.push().set(clientTime);	
	sourceAddress.push().set(clientIp);
    sourceTime.push().set(clientTime);	


function countRefresh() {
	var ref = firebase.database().ref('storeData/refresh/refresh-counter');
	var ref2 = firebase.database().ref('storeData/refresh/clientTime');
	ref2.push().set(clientTime);
	ref.transaction(function(currentClicks) {
	  return (currentClicks || 0) + 1;
	});      
}
	countRefresh();


socket.on('disconnect', function() {
	var sourceUser = firebase.database().ref('storeData/activeusers/'+socket.id);
  	sourceUser.remove();
  	console.log('User: '+socket.id+", Disconnected.");
});


});



//Init index.ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public')); 
app.get('/', function(req, res) {
	res.render('index', { 
		title: 'Name',
	});
});


