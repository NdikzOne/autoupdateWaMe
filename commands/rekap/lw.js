const fs = require("fs");
const path = require("path");

const handler = async (m) => {
    if (!global.lastWinMsg) global.lastWinMsg = {};

    const baseDir = "./database";
    const userFile = path.join(baseDir, "userdata.json");
    const gameFile = path.join(baseDir, "gamehistory.json");
    const jancoFile = path.join(baseDir, "janco.json");
    const lwFile = path.join(baseDir, "lwinfo.json");

    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, {
        recursive: true
    });

    const userdata = fs.existsSync(userFile) ? JSON.parse(fs.readFileSync(userFile)) : {};
    const gameHistory = fs.existsSync(gameFile) ? JSON.parse(fs.readFileSync(gameFile)) : {};
    const janco = fs.existsSync(jancoFile) ? JSON.parse(fs.readFileSync(jancoFile)) : {};
    const lwinfo = fs.existsSync(lwFile) ? JSON.parse(fs.readFileSync(lwFile)) : {};

    const chatId = m.sender;
    if (!userdata[chatId]) userdata[chatId] = {
        saldo: {},
        pernahLF: {},
        backupSaldo: {}
    };

    // teks LW
    const lwText = lwinfo[chatId] || "⁉️ Belum diset melalui .setlw";

    // label default
    const labels = janco[chatId] || {
        pemain: "ABANG PENJUDI",
        pemain2: "KACUNG TOLOL"
    };

    // ambil tanggal WIB
    const now = new Date();
    const weekday = new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            timeZone: "Asia/Jakarta"
        })
        .format(now).toUpperCase();
    const day = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        timeZone: "Asia/Jakarta"
    }).format(now);
    const month = new Intl.DateTimeFormat("id-ID", {
        month: "2-digit",
        timeZone: "Asia/Jakarta"
    }).format(now);
    const year = new Intl.DateTimeFormat("id-ID", {
        year: "numeric",
        timeZone: "Asia/Jakarta"
    }).format(now);
    const dateStr = `${weekday}, ${day}-${month}-${year}`;

    // 🎲 Random Emoji
    const emoji = {
        header: ["📊", "🎰", "🎲", "🏆", "⚡", "🔥", "✨", "💎"],
        positif: ["😎", "🚀", "💰", "🤑", "🏦", "🪙", "🎯", "🍀"],
        negatif: ["🥲", "😵", "💀", "🤡", "📉", "💔", "🕳️", "🔻"]
    };
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    // === Output awal ===
    let out = `${pick(emoji.header)} ${lwText}\n\n⋆ ♔ ̊. *${dateStr}*\n`;

    // game history
    const history = gameHistory[chatId] || [];
    if (history.length === 0) {
        out += `LW FRESH GAS PICK 😜\n`;
    } else {
        history.forEach((g, i) => {
            if (typeof g === "string") {
                out += `*GAME ${i + 1}* : ${g}\n`;
            } else {
                out += `*GAME ${i + 1}* : ${g.winner} ${g.skor} (${g.total}) \\ ${g.fee}\n`;
            }
        });
    }

    // saldo
    const semuaNama = Object.entries(userdata[chatId].saldo || {});
    const pernahLF = userdata[chatId].pernahLF || {};

    const positif = semuaNama
        .filter(([_, saldo]) => saldo > 0)
        .map(([nama, saldo]) => `${pick(emoji.positif)} ${nama} ${saldo}`);

    const negatif = semuaNama
        .filter(([nama, saldo]) => saldo < 0 && pernahLF[nama])
        .map(([nama, saldo]) => `${pick(emoji.negatif)} ${nama} ${saldo}`);

    const totalPositif = semuaNama.filter(([_, s]) => s > 0).reduce((a, [, s]) => a + s, 0);
    const totalNegatif = semuaNama.filter(([nama, s]) => s < 0 && pernahLF[nama]).reduce((a, [, s]) => a + s, 0);

    out += `\n*${labels.pemain}: (${totalPositif})*\n${positif.join("\n") || "-"}`;
    out += `\n\n*${labels.pemain2}: (${totalNegatif})*\n${negatif.join("\n") || "-"}`;

    // simpan pesan terakhir → biar bisa diedit depo/kurang
    const sent = await m.reply(out);
    global.lastWinMsg[m.sender] = sent.key;
};

handler.command = ["lw"];
handler.category = "rekap";
handler.description = "Tampilkan laporan win/lose terakhir dengan emoji random";
handler.premium = true;

module.exports = handler;