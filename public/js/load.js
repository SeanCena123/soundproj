/*
ESTBALISHING SOCKET CONNECTION
*/
var socket = io.connect();

/*
FRONT-END VARIABLES
*/
var reactionarr;
var inputdata = [];
var reactionbutton = document.getElementById('listreactionbutton');
var groupone = document.getElementById("first-group");
var grouptwo = document.getElementById("second-group");
var pathwayresult = document.getElementById("pathway-result");
var numcarbon = document.getElementById("num-carbons");
var resultcarbon = document.getElementById("carbon-result");
var alkanecarbon = document.getElementById("alkane-carbon");
var alkenecarbon = document.getElementById("alkene-carbon");
var alkynecarbon = document.getElementById("alkyne-carbon");
var carboxcarbon = document.getElementById("carbox-carbon");
var alcoholcarbon = document.getElementById("alcohol-carbon");
var aldehydecarbon = document.getElementById("aldehyde-carbon");
var ketonecarbon = document.getElementById("ketone-carbon");
var showelement = document.getElementById("myTable");
var showelement2 = document.getElementById("myTable2");
var inputval = document.getElementById("myInput")
var body = document.getElementById('wrapper');
var array;
var filterarr; 
var stringarr  = ''; 
var stringarr2  = ''; 
var listarr = []; 
var input1 = 0;
var input2 = 0;


/*
LISTERNERS
*/
body.addEventListener("click", function () {
    hide()
    hide2()
    checkarr();
}, false);

groupone.addEventListener("click", function (ev) {
    show(stringarr)
    checkarr();
    ev.stopPropagation(); 
}, false);

grouptwo.addEventListener("click", function (ev) {
    checkinput2();
    checkarr();
    ev.stopPropagation(); 
}, false);

/*
FUNCTIONS
*/
function listreactions() {
    var dataarr = [groupone.value, grouptwo.value];
    socket.emit('listreact', dataarr);
}

function checkarr() {
    var dataarr = [groupone.value, grouptwo.value];
    socket.emit('listreact2', dataarr);
}

function show(input) {
    showelement.innerHTML = input;
    hide2();
    checkarr();
}

function show2(input) {
    showelement2.innerHTML = input;
    hide();
    checkarr();
}

function hide() {
    showelement.innerHTML = ""
}
function hide2() {
    showelement2.innerHTML = ""
    stringarr2 = "";
}

function goToFirst(evt) {
    var e = event || evt; 
    var charCode = e.which || e.keyCode;
    if (charCode == 9 ) {
        hide();
        hide2();
        checkarr();
    }
    return false;
};

function goToFirst2(evt) {
    var e = event || evt; 
    var charCode = e.which || e.keyCode;
    if (charCode == 9 ) {
        checkinput2();
        checkarr();
    }
    return false;
};

async function checkinput2() {
    stringarr2 = "";
    array = [];
    checkarr();
    var data = await [groupone.value, grouptwo.value, reactionarr, array];
    await socket.emit('checkinput2', data);
}

function fill(input) {
    groupone.value = filterarr[input];
    hide();
    checkarr();
}

function fill2(input) {
    grouptwo.value = array[input];
    hide2();
    checkarr();
}

//Creates the text onto the webpage when searching initial reactants.
function createtext(filtered, num) {
    if (num == 0) {
        filterarr = filtered;
        for (var i = 0; i < filtered.length; i++) {
            var variable = stringarr.concat("<a><tr><td><button type='button' onclick='fill("+i+")' class='btn btn-light border' style='width: 175px;'>"+filtered[i]+"</button></td></tr></a>");
            stringarr = variable;
        }
    } else if (num == 1) {
        for (var i = 0; i < array.length; i++) {
            var variable2 = stringarr2.concat("<a><tr><td><button type='button' onclick='fill2("+i+")' class='btn btn-light border' style='width: 175px;'>"+filtered[i]+"</button></td></tr></a>");
            stringarr2 = variable2;
        }
    }
} 

function popupshow(num) {
    if (num == 0) { 
        running(1);
        organisetext("myTable", "first-group");
        checkarr();
    } else if (num == 1) {
        running(0);
        organisetext("myTable2", "second-group");
        checkarr();
    }
}

function organisetext(tabletype, group) {

    var typegroup = document.getElementById(group);
    var filter, table, tr, td, i, txtValue;
    filter = typegroup.value.toUpperCase();
    table = document.getElementById(tabletype);
    tr = table.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
        if (td) {
          txtValue = td.textContent || td.innerText;
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }
        }
    }
}

function running(num) {
    if (num == 1) {
        for (var i = 0; i < reactionarr.length; i++) {
            if (groupone.value == reactionarr[i][0]) {
                return hide();
            } else {
                show(stringarr);
                organisetext("myTable", "first-group");
            }
        }
    } else if (num == 0) {
        for (var i = 0; i < filterarr.length; i++) {
            if (grouptwo.value == filterarr[i]) {
                return hide2(); 
            } else {
                show2(stringarr2);
                organisetext("myTable2", "second-group");
            }
        }   
    }
}


/*
SOCKET CONNECTIONS
*/
socket.on('checkinput1', function(data) {
    createtext(data, 0);
}); 

socket.on('checkinput2', async function(data) {
    array = await data;
    createtext(data, 1);
    await show2(stringarr2);
}); 

socket.on('productresult', async function(data) {
    console.log(data);
    pathwayresult.innerHTML = data;
}); 

socket.on('reactionarr', async function(data) {
    reactionarr = await data;
    for (var i = 0; i < reactionarr.length; i++) {
        listarr.push(reactionarr[i][0]);   
        if (i == 14) {
            socket.emit('checkinput1', listarr);
        }
    }
}); 

socket.on('listreact', async function(data) {
    if (data == 1) {
        input1 = await groupone.value;
        input2 = await grouptwo.value;
        inputdata = [groupone.value, grouptwo.value]
        return socket.emit('listreactions', inputdata);  
    } else if (data == 0) {
        return pathwayresult.innerHTML = "No Reaction.";
    } else if (data == 2) {
        input1 = await groupone.value;
        input2 = await grouptwo.value;
        inputdata = [groupone.value, grouptwo.value]
        return socket.emit('listreactions2', inputdata);  
    }
});

socket.on('listreact2', async function(data) {
    if (data == 1) {
        return reactionbutton.className = "btn btn-primary";   
    } else if (data == 0) {
        return reactionbutton.className = "btn btn-secondary";  
    }
});


/*
RUNNING FUNCTIONS
*/
hide();
