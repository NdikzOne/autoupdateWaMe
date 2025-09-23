const fs = require("fs");
const path = require("path");

const handler = async (m, {
    conn,
    args
}) => {
    if (!global.lastWinMsg) global.lastWinMsg = {};

    const nama = args[0]?.toUpperCase();
    const jumlah = parseInt(args[1]);

    if (!nama || isNaN(jumlah) || jumlah <= 0) {
        return m.reply("❗ Format salah.\nContoh: *.kurang DULZ 15*");
    }

    const baseDir = "./database";
    const userFile = path.join(baseDir, "userdata.json");
    const gameFile = path.join(baseDir, "gamehistory.json");
    const jancoFile = path.join(baseDir, "janco.json");
    const lwFile = path.join(baseDir, "lwinfo.json");

    const userdata = fs.existsSync(userFile) ? JSON.parse(fs.readFileSync(userFile)) : {};
    const gameHistory = fs.existsSync(gameFile) ? JSON.parse(fs.readFileSync(gameFile)) : {};
    const janco = fs.existsSync(jancoFile) ? JSON.parse(fs.readFileSync(jancoFile)) : {};
    const lwinfo = fs.existsSync(lwFile) ? JSON.parse(fs.readFileSync(lwFile)) : {};

    const userId = m.sender;
    if (!userdata[userId]) userdata[userId] = {
        saldo: {},
        pernahLF: {},
        backupSaldo: {}
    };

    // update saldo → dikurangi
    if (!userdata[userId].saldo[nama]) userdata[userId].saldo[nama] = 0;
    userdata[userId].saldo[nama] -= jumlah;

    // kalau saldo minus → tandai pernahLF
    if (userdata[userId].saldo[nama] < 0) {
        userdata[userId].pernahLF[nama] = true;
    }

    fs.writeFileSync(userFile, JSON.stringify(userdata, null, 2));

    // ambil teks LW & label
    const lwText = lwinfo[userId] || "⁉️ Belum diset melalui .setlw";
    const labels = janco[userId] || {
        pemain: "ABANG PENJUDI",
        pemain2: "KACUNG TOLOL"
    };

    // tanggal WIB
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

    // 🎲 emoji random lucu
    const emojiSets = ["🐒", "🦊", "🐼", "🐧", "🐤", "🐸", "🐙", "🦄", "🐷", "🐝", "🍓", "🍉", "🍌", "🍪", "🍕", "🍔", "🍟", "🍩", "🧋", "🍭", "🎲", "🎯", "🎮", "⚽", "🏀", "🏓", "🎰", "💎", "🪙", "💰", "🏦"];
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    // mulai output
    let out = `${lwText}\n\n⋆ ♔ ̊. *${dateStr}*\n`;

    // tampilkan game history
    (gameHistory[userId] || []).forEach((g, i) => {
        if (typeof g === "string") {
            out += `*GAME ${i + 1}* : ${g}\n`;
        } else {
            out += `*GAME ${i + 1}* : ${g.winner} ${g.skor} (${g.total}) \\ ${g.fee}\n`;
        }
    });

    // ambil saldo
    const semuaNama = Object.entries(userdata[userId].saldo || {});
    const pernahLF = userdata[userId].pernahLF || {};

    const positif = semuaNama.filter(([_, saldo]) => saldo > 0).map(([n, s]) => `${pick(emojiSets)} ${n} ${s}`);
    const negatif = semuaNama.filter(([n, s]) => s < 0 && pernahLF[n]).map(([n, s]) => `${pick(emojiSets)} ${n} ${s}`);

    const totalPositif = semuaNama.filter(([_, s]) => s > 0).reduce((a, [, s]) => a + s, 0);
    const totalNegatif = semuaNama.filter(([n, s]) => s < 0 && pernahLF[n]).reduce((a, [, s]) => a + s, 0);

    out += `\n*${labels.pemain}: (${totalPositif})*\n${positif.join("\n") || "-"}`;
    out += `\n\n*${labels.pemain2}: (${totalNegatif})*\n${negatif.join("\n") || "-"}`;

    // react centang
    await conn.sendMessage(m.chat, {
        react: {
            text: "☑️",
            key: m.key
        }
    });

    // edit pesan LW terakhir kalau ada
    const lastKey = global.lastWinMsg?.[userId];
    if (lastKey) {
        const sent = await conn.sendMessage(m.chat, {
            edit: {
                remoteJid: m.chat,
                id: lastKey.id,
                participant: lastKey.participant
            },
            text: out
        });
        global.lastWinMsg[userId] = sent.key;
    } else {
        const sent = await conn.sendMessage(m.chat, {
            text: out
        }, {
            quoted: m
        });
        global.lastWinMsg[userId] = sent.key;
    }
};

handler.command = ["kurang"];
handler.category = "rekap";
handler.description = "Kurangi saldo pemain";
handler.premium = true

module.exports = handler;