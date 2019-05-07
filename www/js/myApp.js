document.addEventListener('deviceready',this.onDeviceRedy, false);

function onDeviceRedy(){
    console.log("device ready");
    //CALL LOCATION WHEN DEVICE US READY
    getLocation();
    //GET THE FILE READY
    tryingFile();   
}

//GLOBAL VARIABLES 
var date;
var country; 
var city;  
var zone;
var isoCurrency;
var currencySymbol;
var lat;
var lng;
var rate;
var currency;


function getLocation(){
    navigator.geolocation.getCurrentPosition(geoCallback, onError);
    //alert("getLocation ready");
}

//GET THE LATITUDE AND LONGITUDE
function geoCallback(position){ 
    
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    
    //alert("location ready");
    //HERE I INITIALIZE ALL THE FUNCTIONS THAT WE NEED FOR THE APP
    getWeather() //WEATHER INFO
    openCage();  //CITY INFO
    initMap();  //MAP FROM LOCATION
}

function onError(error){
    alert('Error please check your GPS on Settings: '    + error.code    + '\n' +
              'Please Active Your GPS' + error.message + '\n');
}

function initMap() {
    var location = new google.maps.LatLng(lat, lng); 
    var map = new google.maps.Map(document.getElementById("map"), { zoom: 15,
    center: location });
    var marker = new google.maps.Marker({position: location, map: map });
}

function openCage(){
    var http = new XMLHttpRequest(); 
    const url = 'https://api.opencagedata.com/geocode/v1/json?q=' +lat+ '+' +lng+ '&key=755279b995f349c1b6b507df27b7833d'; 
    http.open("GET", url); 
    http.send();


    http.onreadystatechange = (e) => {
        var response = http.responseText;
        var responseJSON = JSON.parse(response);

        console.log(responseJSON);
        
        var aux = responseJSON.timestamp.created_http;
        date = aux.substr(0, 16);
        isoCurrency = responseJSON.results[0].annotations.currency.iso_code;
        currencySymbol = responseJSON.results[0].annotations.currency.symbol;
        city = responseJSON.results[0].components.city;
        country = responseJSON.results[0].components.country; 
        currency = responseJSON.results[0].annotations.currency.name+" "+currencySymbol;
        var flag = "https://cdn.rawgit.com/hjnilsson/country-flags/master/svg/"+responseJSON.results[0].components.country_code+".svg";

        document.getElementById("flag").src = flag;
        document.getElementById("date").innerHTML = date;
        document.getElementById("country").innerHTML = country+"!!!";
        document.getElementById("city").innerHTML = city;
        document.getElementById("moneda").innerHTML = currency;
        document.getElementById("zone").innerHTML = zone;
    }   
}

function getWeather(){

    var http = new XMLHttpRequest(); 
    const url = 'http://api.openweathermap.org/data/2.5/weather?lat=' +lat+ '&lon=' +lng+ '&appid=9d29ff6a2c3c33d85e6d7519a4829718&units=metric'; 
    http.open("GET", url); 
    http.send();


    http.onreadystatechange = (e) => {
        var response = http.responseText;
        var responseJSON = JSON.parse(response);

        console.log(responseJSON);

        zone = responseJSON.name;
        var temp = responseJSON.main.temp+" ºC";
        var maxTemp = responseJSON.main.temp_max+" ºC";
        var minTemp = responseJSON.main.temp_min+" ºC"; 
        var humedad = responseJSON.main.humidity;
        var info = responseJSON.weather.description;

        document.getElementById("temp").innerHTML = temp;
        document.getElementById("tempMax").innerHTML = maxTemp;
        document.getElementById("tempMin").innerHTML = minTemp;
        document.getElementById("humedad").innerHTML = humedad;
    }
    console.log("weather ready");
}


    function getRate(){
        var http = new XMLHttpRequest(); 
        //This is my personal key for the API currency
        const url = 'http://www.apilayer.net/api/live?access_key=18607cadf33680a3606935484b43b7a2';
        http.open("GET", url); 
        http.send();

        //Function to put the data in a JSON and can handel it 
        http.onreadystatechange = (e) => {
        var response = http.responseText;
        var responseJSON = JSON.parse(response);

        console.log(responseJSON);

        rate = responseJSON["quotes"]["USD"+isoCurrency]; 
    }        
} 

function USDtoRate(){
    getRate();
    var input = document.getElementById("input").value;
    var result = input * rate;
    document.getElementById("result").innerHTML = result.toFixed(3);
    document.getElementById("moneda2").innerHTML = currency;
}

function RateToUSD(){
    getRate();
    var input = document.getElementById("input").value;
    var result = input / rate;
    document.getElementById("result").innerHTML = result.toFixed(3);
    document.getElementById("moneda2").innerHTML = "Dollars";
}

function tryingFile(){
    console.log("hola");
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemCallback, onError); 
    console.log("adios");  
}

function fileSystemCallback(fs){

    // Name of the file I want to create
    var fileToCreate = "TravelHistory.txt";

    // Opening/creating the file
    fs.root.getFile(fileToCreate, fileSystemOptionals, getFileEntry, onError);
}

var fileSystemOptionals = { create: true, exclusive: false };

var fileEntryGlobal;
var contentGlobal = "";

function getFileEntry(fileEntry){

    fileEntryGlobal = fileEntry;


}

function readInput(){
    
    textToWrite = "<br>"+date+", "+zone+", "+city+", "+country+"<br>";
    //alert(textToWrite);
    writeFile(textToWrite);
    
}

// Let's write some files
function writeFile(newText) {

    contentGlobal = contentGlobal + newText;
    
    var dataObj = new Blob([contentGlobal], { type: 'text/plain' });

    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntryGlobal.createWriter(function (fileWriter) {
        
        fileWriter.write(dataObj);

        fileWriter.onwriteend = function() {
            console.log("Successful file write...");
            //alert("Successful file write...");
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
            //alert("Failed file write: " + e.toString());
        };
        document.getElementById("displayInfo").innerHTML = contentGlobal;
    });
} 


// Let's read some files
function readFile() {

    // Get the file from the file entry
    fileEntryGlobal.file(function (file) {
        // Create the reader
        var reader = new FileReader();
        reader.readAsText(file);
    
        reader.onloadend = function() {

            console.log("Successful file read: " + this.result);
            //alert("Successful file read: " + this.result);
            console.log("file path: " + fileEntryGlobal.fullPath);
            //alert("file path: " + fileEntryGlobal.fullPath);
            contentGlobal = this.result;
            //alert(contentGlobal);
            console.log(contentGlobal);
        };
    }, onError);

    
}

//delete the file and create a new one 
function limpia() {
     fileEntryGlobal.remove(function() {
        // delete successful
        contentGlobal = "";
        document.getElementById("displayInfo").innerText = "";
        tryingFile();
        //alert('Config file has been deleted successfully.');
        console.log('Config file has been deleted successfully.');
            }, function(error) {
        // delete failed
        //alert('Could not delete Config file. '+error);
        console.log('Could not delete Config file. '+error);
            });
    }





