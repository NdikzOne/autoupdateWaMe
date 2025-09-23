const fs = require("fs");
const path = require("path");

const handler = async (m, {
    conn,
    args
}) => {
    if (!global.lastWinMsg) global.lastWinMsg = {};

    const baseDir = "./database";
    const userFile = path.join(baseDir, "userdata.json");
    const gameFile = path.join(baseDir, "gamehistory.json");
    const lwFile = path.join(baseDir, "lwinfo.json");
    const jancoFile = path.join(baseDir, "janco.json");

    const userData = fs.existsSync(userFile) ? JSON.parse(fs.readFileSync(userFile)) : {};
    const gameHistory = fs.existsSync(gameFile) ? JSON.parse(fs.readFileSync(gameFile)) : {};
    const lwData = fs.existsSync(lwFile) ? JSON.parse(fs.readFileSync(lwFile)) : {};
    const janco = fs.existsSync(jancoFile) ? JSON.parse(fs.readFileSync(jancoFile)) : {};

    const id = m.sender;
    if (!userData[id]) userData[id] = {
        saldo: {},
        pernahLF: {},
        backupSaldo: {}
    };

    const lwText = lwData[id] || "⁉️ MINIMAL SET LW";
    const labels = janco[id] || {
        pemain: "ABANG PENJUDI",
        pemain2: "KACUNG TOLOL"
    };

    // format WIB
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

    // mulai output
    let out = `${lwText}\n\n⋆ ♛ *${dateStr}*\n`;

    const semuaNama = Object.entries(userData[id].saldo || {});
    const pernahLF = userData[id].pernahLF || {};

    if (!semuaNama.length) {
        await conn.sendMessage(m.chat, {
            react: {
                text: "✖️",
                key: m.key
            }
        });
        return m.reply("ATM :\n(Kosong)");
    }

    const positif = semuaNama
        .filter(([_, saldo]) => saldo > 0)
        .map(([nama, saldo]) => `✅ ${nama} ${saldo}`);

    const negatif = semuaNama
        .filter(([nama, saldo]) => saldo < 0 && pernahLF[nama])
        .map(([nama, saldo]) => `❌ ${nama} ${saldo}`);

    const totalPositif = semuaNama.filter(([_, s]) => s > 0).reduce((a, [, s]) => a + s, 0);

    out += `\n*${labels.pemain}: (${totalPositif})*\n${positif.join("\n") || "-"}`;
    out += `\n\n*${labels.pemain2}: (-)*\n${negatif.join("\n") || "-"}`;
    out += `\n\n📊 TOTAL SALDO (Hanya Orkay): ${totalPositif}`;

    // react centang dulu
    await conn.sendMessage(m.chat, {
        react: {
            text: "✅",
            key: m.key
        }
    });

    // edit pesan terakhir kalau ada
    const lastKey = global.lastWinMsg?.[id];
    if (lastKey) {
        const sent = await conn.sendMessage(m.chat, {
            edit: {
                remoteJid: m.chat,
                fromMe: true,
                id: lastKey.id,
                participant: lastKey.participant,
            },
            text: out,
        });
        global.lastWinMsg[id] = sent.key;
    } else {
        await m.reply(out);
    }

    fs.writeFileSync(userFile, JSON.stringify(userData, null, 2));
};

handler.command = ["wd"];
handler.category = "rekap";
handler.description = "Withdraw saldo orkay saja (positif)";
handler.premium = true;

module.exports = handler;