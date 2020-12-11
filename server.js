const express = require("express");
const app = express();
const hbs = require("hbs");
const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

const apiKey = process.env.WEATHER_KEY,
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

const publicDirectory = path.join(__dirname, "public"),
  partialPath = path.join(__dirname, "/views/inc");

hbs.registerPartials(partialPath);

app.use(express.static(publicDirectory));

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.get("/Stroud", async (req, res) => {
  try {
    const lat = 51.7457,
      lon = 2.2178;
    const myApi = await axios.get(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}&units=metric`
    );
    const daily = myApi.data.daily;

    const days = daily.map((a) => {
      let date = new Date(a.dt * 1000),
        day = weekdays[date.getUTCDay()];
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
    res.send(`<h1>${err.response.data.message}</h1>`);
  }
});

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", async (req, res) => {
  const city = req.body.cityInput,
    country = req.body.countryInput;

  if (req.body.searchType == "current") {
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
      res.render("problem");
    }
  } else {
    try {
      const myApi = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}&units=metric`
      );
      const lat = myApi.data.coord.lat,
        lon = myApi.data.coord.lon;
      const myApi2 = await axios.get(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${apiKey}&units=metric`
      );
      const daily = myApi2.data.daily;
      const days = daily.map((a) => {
        let date = new Date(a.dt * 1000),
          day = weekdays[date.getUTCDay()];
        return {
          day: day,
          temp: a.temp.day,
          description: a.weather[0].description,
          icon: `http://openweathermap.org/img/wn/${a.weather[0].icon}@2x.png`,
        };
      });
      res.render("forecastResults", {
        city: city,
        country: country,
        weatherObject: days,
      });
    } catch (err) {
      res.render("problem");
    }
  }
});

app.get("*", (req, res) => {
  res.render("invalidAddress");
});

app.listen(5000, () => {
  console.log("Server on port 5000");
});
