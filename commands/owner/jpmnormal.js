// File: commands/owner/jpmnormal.js
const handler = async (m, { conn, text, command }) => {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || "";
    let isMedia = false, mediaBuffer, mediaType, captionText = text;

    if (/image/.test(mime) || /video/.test(mime)) {
        isMedia = true;
        mediaBuffer = await q.download();
        mediaType = /image/.test(mime) ? "image" : "video";
        if (!captionText) captionText = q.text || "";
    } else if (!text) {
        return m.reply(`✏️ Kirim teks atau reply media dengan caption untuk JPM.\nContoh:\n.${command} Halo semua`);
    }

    const groups = Object.keys(await conn.groupFetchAllParticipating());
    let sukses = 0, gagal = 0;

    for (let id of groups) {
        try {
            if (isMedia) {
                await conn.sendMessage(id, { [mediaType]: mediaBuffer, caption: captionText });
            } else {
                await conn.sendMessage(id, { text: captionText });
            }
            sukses++;
            await new Promise(res => setTimeout(res, 1500)); // kasih delay biar aman
        } catch {
            gagal++;
        }
    }

    m.reply(
        `✅ JPM Mode Normal selesai.\n\n` +
        `📨 Berhasil: ${sukses}\n` +
        `❌ Gagal: ${gagal}`
    );
};

handler.command = ["jpmnormal"];
handler.category = "owner";
handler.description = "Broadcast ke semua grup dengan delay (mode normal)";
handler.owner = true;

module.exports = handler;