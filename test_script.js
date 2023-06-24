const axios = require("axios");
const { faker } = require("@faker-js/faker");

const sendRequest = async () => {
  for (let i = 0; i <= 10*1024*1024+1; i++) {
    const log = {
      unix_ts: Math.floor(Date.now() / 1000),
      user_id: faker.number.int(),
      event_name: faker.helpers.arrayElement(["login", "logout"]),
    };

    try {
      const res = await axios.post("http://localhost:3000/log", log);

      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  // try {
  //   const res = await axios.get("http://localhost:3000/getLogs");

  //   console.log(res.data);
  // } catch (err) {
  //   console.log(err);
  // }
};

// setInterval(sendRequest, 1);

async function main() {
  await sendRequest();
}

main();
