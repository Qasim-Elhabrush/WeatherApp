import css from "./style.css"
import moment from "moment"
const img = document.createElement("img");
const giphy = document.getElementById("giphy");
const currentTemperature = document.getElementById("currentTemperature");
const time = document.getElementById("time");
const date = document.getElementById("date");
const location = document.getElementById("location");
//sets the time and date, and updates every second and minute respectively
updateDate();
updateTime();
setInterval(updateDate,60000);
setInterval(updateTime,1000);
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
console.log(timezone);

function updateDate(){
    let currentDate = moment().format("dddd MMMM Do YYYY")
    date.innerText=currentDate;
}
function updateTime(){
    let currentTime = moment().format("h:mm a")
    time.innerText=currentTime;}


//creates userLocation method that will be used for local weather
let userLocation = {
    latitude:"",
    longitude:"",
    city:"",
    state:"",
}
//gets local latitude and longitude and fills in userLocation object
navigator.geolocation.getCurrentPosition(function(position){
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    updateUserLocationObject(latitude,longitude);
});
function updateUserLocationObject(latitude,longitude){
    userLocation.latitude=`${latitude}`;
    userLocation.longitude=`${longitude}`;
    getWeather();
    getCityState();
}



const getCityState = async function(){
    let response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${userLocation.latitude}&lon=${userLocation.longitude}&apiKey=b7b344961fd34275826450df81846e7b`,{mode: 'cors'})
    let data = await response.json();
    userLocation.city = data.features[0].properties.city;
    userLocation.state = data.features[0].properties.state_code;
    location.innerText = `${userLocation.city}, ${userLocation.state}`        
}


//retrieves weather data from open-meteo
const getWeather = async function(){
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&current_weather=true&hourly=temperature_2m,apparent_temperature,relativehumidity_2m,weathercode&temperature_unit=fahrenheit&timezone=${timezone}`,{mode: 'cors'})
    const weatherData =  await response.json();
    console.log(weatherData)
    displayCurrentTemperature(weatherData.current_weather.temperature);



}


//displays the current temperature on the page
function displayCurrentTemperature(Temperature){
    currentTemperature.innerText=`${Temperature}°`;
}





















const randomInt = (min,max) => {
    let num = Math.random() * (max - min) + min;
    return Math.round(num);
};
const sunshineGifIDs = [`uqpK3SuxEY4W9YQvdg`,`a342Mh0bNtoJEIrMJa`,`qZohEEh4bhuQ8`,`jk9L41aToGZQA`,`1Fm7jEapE18HwS6fkT`,`xUPGcjDsJA9Ki3ZqmY`,`THc9OBG5aZkqUKNuq8`,`a6wPWEJ0k8sPJIgLab`];
const cloudyGifIDs = [`gs2ubveMcc2zPVNceK`,`42uCipbG9P4ZaXoum8`,`oNXIP3xpr00k05NVPQ`,`YbWRmFwlJ3PtuDa0BF`,`KV1s4kSJHaY3m`,`26gs87YcoCMeQFMcw`,`Ke7i5t6QDmDSO82Uga`];
const rainGifIDs = [`t7Qb8655Z1VfBGr5XB`,`5PjafLZFxMWc`,`l0MYyhMKJGQEfSM8g`,`W9qCmeTuUoaFG`,`l0NwzT1BiNMyrzxM4`,`Ns4XGIO44IICMfsQOW`,`1ipRdxBacFXBjoov2f`];
const snowGifIDs = [`3oFzm7xQje1yyQK3e0`,`zGJbfvlsg9KjC2VXyJ`,`iq3nJr0SbPTcDpInRf`,`3oKIP7W2zOcac3RvFe`,`Xi2Xu0MejhsUo`,`qjQN9kTe1zy8Uz5lhy`,`gH2bKIakvLuW4`];
function displayRandomSunshineGif(){
    let sunshineID=sunshineGifIDs[randomInt(0,7)];    
    getGif(`${sunshineID}`);
}
function displayRandomCloudyGif(){
    let cloudyID = cloudyGifIDs[randomInt(0,6)];
    getGif(`${cloudyID}`);
}
function displayRandomRainGif(){
    let rainID = rainGifIDs[randomInt(0,6)];
    getGif(`${rainID}`);
}
function displayRandomSnowGif(){
    let snowID = snowGifIDs[randomInt(0,6)];
    getGif(`${snowID}`);
}


const getGif = async function(searchword){
   const response = await fetch(`http://api.giphy.com/v1/gifs/${searchword}?api_key=Ts51RaqoXf5wG1cLgb7aXZfPTJMA00dv`, {mode: 'cors'})
   const Gifdata = await response.json();
    img.src = Gifdata.data.images.original.url;
    while(giphy.firstChild){
        giphy.firstChild.remove();
    }
    giphy.appendChild(img);}

  displayRandomSnowGif();



