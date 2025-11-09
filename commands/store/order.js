const moment = require("moment-timezone");
const axios = require("axios");

const handler = async (m, {
    conn,
    text,
    args,
    db,
    usedPrefix,
    command
}) => {
    const apikey = env.apikeyhost;
    if (!apikey) return m.reply("⚠️ API key belum diisi di *env.apikeyhost*");

    if (args.length < 1) {
        return m.reply(`❌ Format salah!\n\nContoh:\n${usedPrefix + command} PLN50`);
    }

    const code = args[0].toUpperCase();
    const users = db.list().user ||= {};
    const user = users[m.sender] ||= {};

    user.waitingOrder = {
        code,
        time: Date.now()
    };

    return conn.sendMessage(m.chat, {
        text: `🛒 Produk *${code}* berhasil diset.\n\nSilakan kirim nomor atau email tujuan untuk melanjutkan order.\n\nContoh:\n• 08123456789\n• user@gmail.com`,
        contextInfo: {
            externalAdReply: {
                title: `Order ${code}`,
                body: "Masukkan nomor/email tujuan kamu.",
                thumbnailUrl: env.thumb3,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, {
        quoted: m
    });
};

handler.command = ["order"];
handler.category = "store";
handler.description = "Memulai order produk (lanjut input tujuan)";
module.exports = handler;