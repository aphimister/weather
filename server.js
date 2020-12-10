const express = require("express");
const app = express();
const path = require("path");
const axios = require("axios");

const apiKey = "3a71f52109ea13652c84221c839f41f0";

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

app.get("*", (req, res) => {
  res.send("<h1>404, request not found</h1>");
});

app.listen(5000, () => {
  console.log("Server on port 5000");
});
