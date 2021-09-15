const fs = require("fs");
const axios = require("axios");

const TOTAL_FILEPATH = "/home/kyle/bin/wakawidget/out/total.txt";
const LANGS_FILEPATH = "/home/kyle/bin/wakawidget/out/langs.txt";
const TODAY_FILEPATH = "/home/kyle/bin/wakawidget/out/today.txt";
const KEY_FILEPATH = "/home/kyle/.wakatime.cfg";


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

const OPTION = process.argv[2]

const main = async () => {
  if (OPTION == '--week') {
    // get week
    axiosInstance
      .get(
        "https://wakatime.com/api/v1/users/current/stats/last_7_days",
        {
          timeout: 20000,
        }
      )
      .then((res) => res.data)
      .then((res) => {
        const result = (res.data.total_seconds_including_other_language / 3600).toFixed(3)
        fs.writeFileSync(TOTAL_FILEPATH, "");
        fs.appendFileSync(
          TOTAL_FILEPATH,
          result
        );
        console.log(result)

        // langs
        for (let i = 0; i < 3; i++) {
          let cur = res.data.languages[i];
          let str = parseInt(cur.percent);
          if (cur.name == "Other") {
            str += "~";
          } else {
            str += cur.name[0];
          }
          fs.writeFileSync(LANGS_FILEPATH, "");
          fs.appendFileSync(LANGS_FILEPATH, str + " ");
        }
      })
      .catch((err) => {
        // fs.writeFileSync("wakawidget: something went wrong.");
        console.log('err')
        process.exit(0)
      });

  }

  if (OPTION == '--today') {
    // get today
    let today = await axiosInstance.get(
      "https://wakatime.com/api/v1/users/current/durations",
      {
        timeout: 20000,
        params: {
          date: new Date().toISOString().split("T")[0],
        },
      }
    ).catch(err => {
      console.log('err')
      process.exit(0)
    });

    let sum = today.data.data.reduce((acc, b) => {
      return acc + b.duration;
    }, 0);

    let todayStr = (sum / 3600).toFixed(3);
    fs.writeFileSync(TODAY_FILEPATH, "");
    fs.appendFileSync(TODAY_FILEPATH, todayStr);
    console.log(todayStr)
  };
};

main();
