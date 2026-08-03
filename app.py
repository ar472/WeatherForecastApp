from flask import Flask, render_template, request
import requests
from datetime import datetime

app = Flask(__name__)

# ===============================
# OPENWEATHER API KEY
# ===============================

API_KEY = "2708868d46b1a0fe47b412a0298741cc"


# ===============================
# AI WEATHER ADVICE
# ===============================

def get_ai_advice(temp, humidity, wind, description):

    advice = []

    if temp >= 38:
        advice.append("🥵 Stay hydrated and avoid direct sunlight.")
    elif temp >= 30:
        advice.append("😎 Carry a water bottle and use sunscreen.")
    elif temp >= 20:
        advice.append("😊 Great weather for outdoor activities.")
    elif temp >= 10:
        advice.append("🧥 A light jacket is recommended.")
    else:
        advice.append("❄ Wear warm clothes.")

    if humidity > 80:
        advice.append("💧 Humidity is high today.")

    if wind > 10:
        advice.append("💨 Strong winds expected.")

    if "rain" in description.lower():
        advice.append("☔ Carry an umbrella.")

    if "snow" in description.lower():
        advice.append("❄ Be careful on slippery roads.")

    return " ".join(advice)


# ===============================
# CLOTHING RECOMMENDATION
# ===============================

def clothing_recommendation(temp):

    if temp >= 38:
        return "👕 Cotton T-Shirt • 🩳 Shorts • 🧢 Cap"

    elif temp >= 30:
        return "👕 Half Sleeve Shirt • 👖 Jeans"

    elif temp >= 20:
        return "👕 Casual Wear"

    elif temp >= 10:
        return "🧥 Jacket"

    else:
        return "🧥 Heavy Jacket • 🧤 Gloves • 🧣 Muffler"


# ===============================
# HOME
# ===============================

@app.route("/", methods=["GET", "POST"])
def home():

    weather = None

    forecast = []

    hourly_forecast = []

    rain_probability = []

    alerts = []

    aqi_data = None

    ai_advice = ""

    clothing = ""

    error = None

    current_time = datetime.now().strftime(
        "%d %B %Y | %I:%M %p"
    )

    if request.method == "POST":

        city = request.form.get("city")

        weather_url = (
            f"https://api.openweathermap.org/data/2.5/weather?"
            f"q={city}&appid={API_KEY}&units=metric"
        )

        response = requests.get(weather_url)

        data = response.json()

        if data.get("cod") != 200:

            error = "City not found"

        else:

            lat = data["coord"]["lat"]

            lon = data["coord"]["lon"]
                        # ===============================
            # CURRENT WEATHER
            # ===============================

            weather = {

                "city": data["name"],

                "country": data["sys"]["country"],

                "temperature": round(data["main"]["temp"]),

                "feels_like": round(data["main"]["feels_like"]),

                "humidity": data["main"]["humidity"],

                "pressure": data["main"]["pressure"],

                "visibility": round(
                    data["visibility"] / 1000, 1
                ),

                "wind": data["wind"]["speed"],

                "description": data["weather"][0]["description"].title(),

                "icon": data["weather"][0]["icon"],

                "sunrise": datetime.utcfromtimestamp(
                    data["sys"]["sunrise"] +
                    data["timezone"]
                ).strftime("%I:%M %p"),

                "sunset": datetime.utcfromtimestamp(
                    data["sys"]["sunset"] +
                    data["timezone"]
                ).strftime("%I:%M %p"),

                "lat": lat,

                "lon": lon

            }

            # ===============================
            # AI WEATHER ADVICE
            # ===============================

            ai_advice = get_ai_advice(

                weather["temperature"],

                weather["humidity"],

                weather["wind"],

                weather["description"]

            )

            # ===============================
            # CLOTHING RECOMMENDATION
            # ===============================

            clothing = clothing_recommendation(

                weather["temperature"]

            )

            # ===============================
            # AIR QUALITY INDEX
            # ===============================

            aqi_url = (

                "https://api.openweathermap.org/data/2.5/air_pollution"

                f"?lat={lat}&lon={lon}&appid={API_KEY}"

            )

            aqi_response = requests.get(aqi_url)

            aqi_json = aqi_response.json()

            if "list" in aqi_json:

                air = aqi_json["list"][0]

                aqi_value = air["main"]["aqi"]

                aqi_status = {

                    1: "😊 Good",

                    2: "🙂 Fair",

                    3: "😐 Moderate",

                    4: "😷 Poor",

                    5: "☠️ Very Poor"

                }

                aqi_data = {

                    "value": aqi_value,

                    "status": aqi_status.get(aqi_value),

                    "co": round(air["components"]["co"], 1),

                    "no": round(air["components"]["no"], 1),

                    "no2": round(air["components"]["no2"], 1),

                    "o3": round(air["components"]["o3"], 1),

                    "so2": round(air["components"]["so2"], 1),

                    "pm2_5": round(air["components"]["pm2_5"], 1),

                    "pm10": round(air["components"]["pm10"], 1),

                    "nh3": round(air["components"]["nh3"], 1)

                }
                            # ===============================
            # 5 DAY FORECAST
            # ===============================

            forecast_url = (
                f"https://api.openweathermap.org/data/2.5/forecast?"
                f"q={city}&appid={API_KEY}&units=metric"
            )

            forecast_response = requests.get(forecast_url)

            forecast_json = forecast_response.json()

            added_dates = set()

            for item in forecast_json["list"]:

                date = datetime.strptime(
                    item["dt_txt"].split(" ")[0],
                    "%Y-%m-%d"
                ).strftime("%d %b")

                if date not in added_dates:

                    forecast.append({

                        "date": date,

                        "temp": round(
                            item["main"]["temp"]
                        ),

                        "humidity": item["main"]["humidity"],

                        "wind": item["wind"]["speed"],

                        "icon": item["weather"][0]["icon"]

                    })

                    added_dates.add(date)

                if len(forecast) == 5:
                    break


            # ===============================
            # HOURLY FORECAST
            # ===============================

            for item in forecast_json["list"][:8]:

                hourly_forecast.append({

                    "time": datetime.strptime(
                        item["dt_txt"],
                        "%Y-%m-%d %H:%M:%S"
                    ).strftime("%I %p"),

                    "temp": round(
                        item["main"]["temp"]
                    ),

                    "humidity": item["main"]["humidity"],

                    "wind": item["wind"]["speed"],

                    "icon": item["weather"][0]["icon"]

                })

                rain_probability.append({

                    "time": datetime.strptime(
                        item["dt_txt"],
                        "%Y-%m-%d %H:%M:%S"
                    ).strftime("%I %p"),

                    "chance": int(
                        item.get("pop", 0) * 100
                    )

                })


            # ===============================
            # WEATHER ALERTS
            # ===============================

            if weather["temperature"] >= 40:
                alerts.append("🔥 Heat Wave Alert")

            if weather["wind"] >= 10:
                alerts.append("🌪 Strong Wind Alert")

            if weather["humidity"] >= 85:
                alerts.append("💧 High Humidity Alert")

            if weather["visibility"] <= 2:
                alerts.append("🌫 Low Visibility Alert")

            if "Rain" in weather["description"]:
                alerts.append("☔ Carry an Umbrella")

            if "Thunderstorm" in weather["description"]:
                alerts.append("⚡ Thunderstorm Warning")
            if "Snow" in weather["description"]:
                alerts.append("❄ Snowfall Expected")

    return render_template(
        "index.html",
        weather=weather,
        forecast=forecast,
        hourly_forecast=hourly_forecast,
        rain_probability=rain_probability,
        alerts=alerts,
        aqi_data=aqi_data,
        ai_advice=ai_advice,
        clothing=clothing,
        current_time=current_time,
        error=error
    )


if __name__ == "__main__":
    app.run(debug=True)

            

        