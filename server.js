const express = require("express");
const app = express();
const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

const apiKey = process.env.WEATHER_KEY,
  lat = 51.7457,
  lon = 2.2178,
  weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

const viewsPath = path.join(__dirname, "/views");

app.set("view engine", "hbs");

app.set("views", viewsPath);

const publicDirectory = path.join(__dirname, "public");

app.use(express.static(publicDirectory));

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/formResult", async (req, res) => {
  const city = req.body.cityInput;
  const country = req.body.countryInput;
  try {
    const myApi = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}&units=metric`
    );

    res.render("searchResult", {
      city: city,
      country: country,
      temperature: myApi.data.main.temp,
      description: myApi.data.weather[0].description,
      img: `http://openweathermap.org/img/wn/${myApi.data.weather[0].icon}@2x.png`,
    });
  } catch (err) {
    console.error(err);
    res.render("problem");
  }
});

app.get("/Stroud", async (req, res) => {
  try {
    const myApi = await axios.get(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=3a71f52109ea13652c84221c839f41f0&units=metric`
    );
    const daily = myApi.data.daily;

    const days = daily.map((a) => {
      console.log(a);
      let date = new Date(a.dt * 1000);
      let day = weekdays[date.getUTCDay()];
      return {
        day: day,
        temp: a.temp.day,
        description: a.weather[0].description,
        icon: `http://openweathermap.org/img/wn/${a.weather[0].icon}@2x.png`,
      };
    });
    res.render("stroudWeather", { weatherObject: days });
  } catch (err) {
    console.log(err);
    res.send("<h1>Unknown Error, please report to Alex</h1>");
  }
});

app.get("*", (req, res) => {
  res.send("<h1>Page not found</h1>");
});

app.listen(5000, () => {
  console.log("Server on port 5000");
});
