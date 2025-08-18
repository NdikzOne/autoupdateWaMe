// File: commands/owner/jpmhidetag.js
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
        return m.reply(
            `✏️ Kirim teks atau reply media dengan caption untuk JPM hidetag.\nContoh:\n.${command} Halo semua`
        );
    }

    const groups = Object.values(await conn.groupFetchAllParticipating());
    let sukses = 0, gagal = 0;

    for (let group of groups) {
        try {
            const metadata = await conn.groupMetadata(group.id);
            const participants = metadata.participants.map(p => p.id);

            if (isMedia) {
                await conn.sendMessage(group.id, {
                    [mediaType]: mediaBuffer,
                    caption: captionText,
                    mentions: participants
                });
            } else {
                await conn.sendMessage(group.id, {
                    text: captionText,
                    mentions: participants
                });
            }

            sukses++;
            await new Promise(res => setTimeout(res, 1500)); // delay biar aman
        } catch {
            gagal++;
        }
    }

    m.reply(
        `✅ JPM Mode Hidetag selesai.\n\n` +
        `📨 Berhasil: ${sukses}\n` +
        `❌ Gagal: ${gagal}`
    );
};

handler.command = ["jpmhidetag"];
handler.category = "owner";
handler.description = "Broadcast ke semua grup dengan hidden tag (mention semua member tersembunyi)";
handler.owner = true;

module.exports = handler;