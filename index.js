const fs = require("fs");
const axios = require("axios");

const TMP_DIR = "./.tmp";
const WEEK_PATH = `${TMP_DIR}/week.txt`;
const WEEK_LANGS_PATH = `${TMP_DIR}/week-langs.txt`;
const TODAY_PATH = `${TMP_DIR}/today.txt`;
const KEY_FILEPATH = `${process.env.HOME}/.wakatime.cfg`;

// how many languages to show in week-langs
const NUM_LANGS = 3;

// get api key from wakatime config file, and setup axios instance with basic auth
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

// ensure tmp dir and output files exist
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR);
}
[WEEK_PATH, WEEK_LANGS_PATH, TODAY_PATH].forEach((path) => {
  fs.writeFileSync(path, "", { flag: "a" });
});

// print content of output files if passed argument "week" | "today" | "week-langs"
const option = process.argv[2];
if (option) {
  switch (option) {
    case "week":
      console.log(fs.readFileSync(WEEK_PATH).toString());
      break;
    case "week-langs":
      console.log(fs.readFileSync(WEEK_LANGS_PATH).toString());
      break;
    case "today":
      console.log(fs.readFileSync(TODAY_PATH).toString());
      break;
  }
  return;
}

// query wakatime api and write to output files if no argument passed
const query = async () => {
  // get week
  axiosInstance
    .get("https://wakatime.com/api/v1/users/current/stats/last_7_days", {
      timeout: 20000,
    })
    .then((res) => res.data)
    .then((res) => {
      const result = (
        res.data.total_seconds_including_other_language / 3600
      ).toFixed(3);
      fs.writeFileSync(WEEK_PATH, "");
      fs.appendFileSync(WEEK_PATH, result);

      // langs
      fs.writeFileSync(WEEK_LANGS_PATH, "");
      for (
        let i = 0;
        i < Math.min(3, (res.data?.languages ?? []).length);
        i++
      ) {
        let cur = res.data?.languages?.[i];
        let str = parseInt(cur.percent);
        if (cur.name == "Other") {
          str += "~";
        } else {
          str += cur.name[0];
        }
        fs.appendFileSync(
          WEEK_LANGS_PATH,
          `${str}${i < NUM_LANGS - 1 ? " " : ""}`
        );
      }
    });

  // get today
  axiosInstance
    .get("https://wakatime.com/api/v1/users/current/durations", {
      timeout: 20000,
      params: {
        date: new Date().toISOString().split("T")[0],
      },
    })
    .then((res) => res.data)
    .then((d) => {
      const sum = d.data.reduce((acc, b) => {
        return acc + b.duration;
      }, 0);
      const todayStr = (sum / 3600).toFixed(3);
      fs.writeFileSync(TODAY_PATH, "");
      fs.appendFileSync(TODAY_PATH, todayStr);
    });
};

query().catch((err) => {
  console.error(err);
  fs.appendFileSync("error.log", err);
  process.exit(0);
});
