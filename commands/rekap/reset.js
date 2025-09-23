const fs = require("fs");
const path = require("path");

const handler = async (m) => {
    const baseDir = "./database";
    const userFile = path.join(baseDir, "userdata.json");
    const gameFile = path.join(baseDir, "gamehistory.json");

    // load file
    let userData = {};
    let gameLog = {};

    try {
        if (fs.existsSync(userFile)) {
            userData = JSON.parse(fs.readFileSync(userFile));
        }
    } catch {
        userData = {};
    }

    try {
        if (fs.existsSync(gameFile)) {
            gameLog = JSON.parse(fs.readFileSync(gameFile));
        }
    } catch {
        gameLog = {};
    }

    const id = m.sender;

    // hapus data user
    if (userData[id]) delete userData[id];
    if (gameLog[id]) delete gameLog[id];

    // tulis balik
    fs.writeFileSync(userFile, JSON.stringify(userData, null, 2));
    fs.writeFileSync(gameFile, JSON.stringify(gameLog, null, 2));

    await m.reply("✅ Data kamu berhasil direset!");
};

handler.command = ["reset"];
handler.category = "rekap";
handler.description = "Reset semua data saldo & game history kamu";
handler.premium = true;

module.exports = handler;