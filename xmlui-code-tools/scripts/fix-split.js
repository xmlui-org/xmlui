const fs = require("fs");
const path = require("path");
const configFilePath = path.join(__dirname, "config.json");
const json = fs.readFileSync(configFilePath, "utf8");
const data = JSON.parse(json);
data.outFolderPath = "../../xmlui-docs/scripts",
    fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2), "utf8");

