/* ==========================================================
   Weather Forecast Pro V2.0
   Developed by Arnav Mittal
==========================================================*/


// ==========================================
// LIVE CLOCK
// ==========================================

function updateClock(){

    const now=new Date();

    const options={

        weekday:"long",

        day:"numeric",

        month:"long",

        year:"numeric"

    };

    const date=now.toLocaleDateString("en-IN",options);

    const time=now.toLocaleTimeString();

    const clock=document.getElementById("live-clock");

    if(clock){

        clock.innerHTML=
        "🕒 "+date+" | "+time;

    }

}

setInterval(updateClock,1000);

updateClock();


// ==========================================
// DARK MODE
// ==========================================

function toggleTheme(){

    document.body.classList.toggle("dark-mode");

    let btn=document.getElementById("theme-btn");

    if(document.body.classList.contains("dark-mode")){

        btn.innerHTML="☀ Light Mode";

        localStorage.setItem("theme","dark");

    }

    else{

        btn.innerHTML="🌙 Dark Mode";

        localStorage.setItem("theme","light");

    }

}


window.onload=function(){

    if(localStorage.getItem("theme")=="dark"){

        document.body.classList.add("dark-mode");

        document.getElementById("theme-btn").innerHTML="☀ Light Mode";

    }

}


// ==========================================
// SEARCH HISTORY
// ==========================================

function saveHistory(city){

    let history=

    JSON.parse(localStorage.getItem("weatherHistory"))||[];

    if(!history.includes(city)){

        history.unshift(city);

    }

    history=history.slice(0,6);

    localStorage.setItem(

        "weatherHistory",

        JSON.stringify(history)

    );

    showHistory();

}


function showHistory(){

    let list=

    document.getElementById("history-list");

    if(!list) return;

    list.innerHTML="";

    let history=

    JSON.parse(localStorage.getItem("weatherHistory"))||[];

    history.forEach(city=>{

        list.innerHTML+=`

        <li onclick="quickSearch('${city}')">

        📍 ${city}

        </li>

        `;

    });

}


// ==========================================
// FORM SUBMIT
// ==========================================

const form=document.querySelector("form");

if(form){

form.addEventListener("submit",function(){

const city=document.getElementById("cityInput").value;

saveHistory(city);

});

}


// ==========================================
// QUICK SEARCH
// ==========================================

function quickSearch(city){

document.getElementById("cityInput").value=city;

document.querySelector("form").submit();

}


showHistory();
// ==========================================================
// VOICE SEARCH
// ==========================================================

function startVoiceSearch(){

    if(!('webkitSpeechRecognition' in window)){

        alert("Voice Search is not supported in your browser.");

        return;

    }

    const recognition=new webkitSpeechRecognition();

    recognition.lang="en-IN";

    recognition.interimResults=false;

    recognition.maxAlternatives=1;

    recognition.start();

    recognition.onresult=function(event){

        const city=event.results[0][0].transcript;

        document.getElementById("cityInput").value=city;

        document.querySelector("form").submit();

    };

    recognition.onerror=function(){

        alert("Voice recognition failed.");

    };

}


// ==========================================================
// CURRENT LOCATION
// ==========================================================

function getLocation(){

    if(navigator.geolocation){

        navigator.geolocation.getCurrentPosition(

            showPosition,

            locationError

        );

    }

    else{

        alert("Geolocation not supported.");

    }

}


function showPosition(position){

    const lat=position.coords.latitude;

    const lon=position.coords.longitude;

    reverseGeocode(lat,lon);

}


function locationError(error){

    switch(error.code){

        case error.PERMISSION_DENIED:

            alert("Location permission denied.");

            break;

        case error.POSITION_UNAVAILABLE:

            alert("Location unavailable.");

            break;

        case error.TIMEOUT:

            alert("Location request timed out.");

            break;

        default:

            alert("Unable to fetch location.");

    }

}


// ==========================================================
// REVERSE GEOCODING
// ==========================================================

function reverseGeocode(lat,lon){

    fetch(

        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`

    )

    .then(response=>response.json())

    .then(data=>{

        let city=

        data.address.city ||

        data.address.town ||

        data.address.village ||

        data.address.state;

        if(city){

            document.getElementById("cityInput").value=city;

            document.querySelector("form").submit();

        }

    })

    .catch(()=>{

        alert("Unable to detect city.");

    });

}


// ==========================================================
// AUTO FOCUS
// ==========================================================

window.addEventListener("load",()=>{

    const input=document.getElementById("cityInput");

    if(input){

        input.focus();

    }

});


// ==========================================================
// ENTER KEY SEARCH
// ==========================================================

document.addEventListener("keydown",function(e){

    if(e.key==="Enter"){

        const active=document.activeElement;

        if(active.id==="cityInput"){

            document.querySelector("form").submit();

        }

    }

});


// ==========================================================
// REFRESH BUTTON
// ==========================================================

function refreshWeather(){

    location.reload();

}
// ==========================================================
// TEMPERATURE CHART
// ==========================================================

window.addEventListener("load",()=>{

    const canvas=document.getElementById("tempChart");

    if(!canvas || typeof forecastTemps==="undefined") return;

    new Chart(canvas,{

        type:"line",

        data:{

            labels:forecastDates,

            datasets:[{

                label:"Temperature (°C)",

                data:forecastTemps,

                borderWidth:3,

                tension:.4,

                fill:true,

                backgroundColor:"rgba(59,130,246,.20)",

                borderColor:"#38bdf8",

                pointRadius:5,

                pointHoverRadius:8

            }]

        },

        options:{

            responsive:true,

            plugins:{

                legend:{

                    labels:{

                        color:"#ffffff"

                    }

                }

            },

            scales:{

                x:{

                    ticks:{

                        color:"#ffffff"

                    },

                    grid:{

                        color:"rgba(255,255,255,.10)"

                    }

                },

                y:{

                    ticks:{

                        color:"#ffffff"

                    },

                    grid:{

                        color:"rgba(255,255,255,.10)"

                    }

                }

            }

        }

    });

});


// ==========================================================
// WEATHER MAP
// ==========================================================

window.addEventListener("load",()=>{

    if(typeof latitude==="undefined") return;

    const mapDiv=document.getElementById("map");

    if(!mapDiv) return;

    const map=L.map("map").setView([latitude,longitude],10);

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:"© OpenStreetMap"

        }

    ).addTo(map);

    L.marker([latitude,longitude])

    .addTo(map)

    .bindPopup("📍 Selected City")

    .openPopup();

});


// ==========================================================
// WEATHER BACKGROUND
// ==========================================================

window.addEventListener("load",()=>{

    const bg=document.getElementById("weather-bg");

    if(!bg) return;

    const desc=document.querySelector(".weather-header p");

    if(!desc) return;

    const text=desc.innerText.toLowerCase();

    document.body.classList.remove(

        "sunny-bg",

        "cloudy-bg",

        "rainy-bg",

        "snow-bg",

        "night-bg",

        "thunder-bg"

    );

    if(text.includes("rain")){

        document.body.classList.add("rainy-bg");

    }

    else if(text.includes("cloud")){

        document.body.classList.add("cloudy-bg");

    }

    else if(text.includes("snow")){

        document.body.classList.add("snow-bg");

    }

    else if(text.includes("thunder")){

        document.body.classList.add("thunder-bg");

    }

    else if(text.includes("clear")){

        document.body.classList.add("sunny-bg");

    }

    else{

        document.body.classList.add("night-bg");

    }

});


// ==========================================================
// LOADING EFFECT
// ==========================================================

window.addEventListener("load",()=>{

    document.body.classList.add("loaded");

});


// ==========================================================
// SCROLL TO TOP
// ==========================================================

const topBtn=document.createElement("button");

topBtn.innerHTML="⬆";

topBtn.id="topBtn";

document.body.appendChild(topBtn);

topBtn.style.position="fixed";

topBtn.style.bottom="25px";

topBtn.style.right="25px";

topBtn.style.display="none";

topBtn.style.padding="15px";

topBtn.style.borderRadius="50%";

topBtn.style.border="none";

topBtn.style.cursor="pointer";

topBtn.style.fontSize="20px";

topBtn.style.zIndex="999";

window.addEventListener("scroll",()=>{

    if(window.scrollY>300){

        topBtn.style.display="block";

    }

    else{

        topBtn.style.display="none";

    }

});

topBtn.onclick=()=>{

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

};
// ==========================================================
// FAVORITE CITIES
// ==========================================================

function addFavorite(city){

    let favorites =
        JSON.parse(localStorage.getItem("favoriteCities")) || [];

    if(!favorites.includes(city)){

        favorites.push(city);

        localStorage.setItem(
            "favoriteCities",
            JSON.stringify(favorites)
        );

        loadFavorites();
    }
}


function loadFavorites(){

    const container =
        document.getElementById("favorite-list");

    if(!container) return;

    container.innerHTML="";

    const favorites =
        JSON.parse(localStorage.getItem("favoriteCities")) || [];

    favorites.forEach(city=>{

        const btn=document.createElement("button");

        btn.innerHTML="⭐ "+city;

        btn.className="favorite-btn";

        btn.onclick=function(){

            quickSearch(city);

        };

        container.appendChild(btn);

    });

}

window.addEventListener("load",loadFavorites);



// ==========================================================
// WEATHER NOTIFICATIONS
// ==========================================================

function weatherNotification(){

    const temp=document.querySelector(".temperature-section h1");

    if(!temp) return;

    const value=parseInt(temp.innerText);

    if(value>=40){

        alert("🔥 Heat Wave Alert! Stay Hydrated.");

    }

    else if(value<=8){

        alert("❄ Cold Weather Alert!");

    }

}

window.addEventListener("load",weatherNotification);



// ==========================================================
// DOWNLOAD REPORT
// ==========================================================

function downloadReport(){

    window.print();

}



// ==========================================================
// CARD ANIMATION
// ==========================================================

const observer=new IntersectionObserver(

(entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show-card");

}

});

},

{

threshold:0.15

}

);

document.querySelectorAll(

".glass,.forecast-card,.hour-card,.highlight-card"

).forEach(card=>{

observer.observe(card);

});



// ==========================================================
// BUTTON RIPPLE EFFECT
// ==========================================================

document.querySelectorAll("button").forEach(button=>{

button.addEventListener("click",function(e){

const ripple=document.createElement("span");

const rect=this.getBoundingClientRect();

const size=Math.max(rect.width,rect.height);

ripple.style.width=size+"px";

ripple.style.height=size+"px";

ripple.style.left=e.clientX-rect.left-size/2+"px";

ripple.style.top=e.clientY-rect.top-size/2+"px";

ripple.className="ripple";

this.appendChild(ripple);

setTimeout(()=>{

ripple.remove();

},600);

});

});



// ==========================================================
// WEATHER ICON ANIMATION
// ==========================================================

const weatherIcon=document.querySelector(".weather-header img");

if(weatherIcon){

setInterval(()=>{

weatherIcon.style.transform="rotate(6deg)";

setTimeout(()=>{

weatherIcon.style.transform="rotate(-6deg)";

},250);

setTimeout(()=>{

weatherIcon.style.transform="rotate(0deg)";

},500);

},3500);

}
// ==========================================================
// AUTO DAY / NIGHT THEME
// ==========================================================

(function () {

    const hour = new Date().getHours();

    if (hour >= 18 || hour <= 6) {

        document.body.classList.add("dark-mode");

        const btn = document.getElementById("theme-btn");

        if (btn) btn.innerHTML = "☀ Light Mode";

    }

})();


// ==========================================================
// WEATHER ANIMATION
// ==========================================================




// ==========================================================
// AUTO REFRESH
// ==========================================================

setInterval(() => {

    const form = document.querySelector("form");

    const input = document.getElementById("cityInput");

    if (form && input && input.value.trim() !== "") {

        console.log("Weather data auto-refresh ready.");

    }

}, 600000); // every 10 minutes


// ==========================================================
// PAGE LOADER
// ==========================================================

window.addEventListener("load", () => {

    document.body.classList.add("page-loaded");

});


// ==========================================================
// SMOOTH SCROLL LINKS
// ==========================================================

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});


// ==========================================================
// SIMPLE WEATHER FACTS
// ==========================================================

const weatherFacts = [

    "🌍 The highest temperature recorded on Earth is 56.7°C.",

    "☁ Clouds can weigh more than one million pounds.",

    "⚡ Lightning is five times hotter than the Sun's surface.",

    "🌧 Raindrops are not actually tear-shaped.",

    "❄ Every snowflake has a unique pattern."

];

function showWeatherFact() {

    const box = document.getElementById("weather-fact");

    if (!box) return;

    const random = Math.floor(

        Math.random() * weatherFacts.length

    );

    box.innerHTML = weatherFacts[random];

}

window.addEventListener("load", showWeatherFact);


// ==========================================================
// FINAL INITIALIZATION
// ==========================================================

console.log("========================================");

console.log(" Weather Forecast Pro V2.0 Loaded ");

console.log(" Developed by Arnav Mittal ");

console.log("========================================");