const fs = require("fs");
const axios = require("axios");

const TOTAL_FILEPATH = "/home/kyle/bin/wakawidget/out/total.txt";
const LANGS_FILEPATH = "/home/kyle/bin/wakawidget/out/langs.txt";
const TODAY_FILEPATH = "/home/kyle/bin/wakawidget/out/today.txt";
const KEY_FILEPATH = "/home/kyle/.wakatime.cfg";

fs.writeFileSync(TOTAL_FILEPATH, "");
fs.writeFileSync(LANGS_FILEPATH, "");
fs.writeFileSync(TODAY_FILEPATH, "");

let rawKey = fs.readFileSync(KEY_FILEPATH).toString();
rawKey = rawKey.split("= ")[1].split("\n")[0];

let buff = new Buffer.from(rawKey, "utf8");
let base64key = buff.toString("base64");

let axiosInstance = axios.create({
  headers: {
    get: {
      Authorization: "Basic " + base64key,
    },
  },
});

const main = async () => {
  // get week
  let stats = await axiosInstance
    .get("https://wakatime.com/api/v1/users/current/stats/last_7_days")
    .then((res) => res.data)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      fs.writeFileSync("wakawidget: something went wrong.");
      process.exit(1);
    });

  fs.appendFileSync(
    TOTAL_FILEPATH,
    (stats.data.total_seconds_including_other_language / 3600).toFixed(3)
  );

  for (let i = 0; i < 3; i++) {
    let cur = stats.data.languages[i];
    let str = parseInt(cur.percent);
    if (cur.name == "Other") {
      str += "~";
    } else {
      str += cur.name[0];
    }
    fs.appendFileSync(LANGS_FILEPATH, str + " ");
  }

  // get today
  let today = await axiosInstance.get(
    "https://wakatime.com/api/v1/users/current/durations",
    {
      params: {
        date: new Date().toISOString().split("T")[0],
      },
    }
  );

  let sum = today.data.data.reduce((acc, b) => {
    return acc + b.duration;
  }, 0);

  let todayStr = (sum / 3600).toFixed(3);
  fs.appendFileSync(TODAY_FILEPATH, todayStr);
};

main();
