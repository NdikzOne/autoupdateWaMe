const ms = require('ms');

const handler = async (m, { conn, args, isOwner, db }) => {
    if (!isOwner) return m.reply('Perintah ini hanya untuk Owner.');

    if (!args[0] || !args[1]) {
        return m.reply(`*Format salah!*\n\nGunakan: *+sewa <linkgc> <durasi>*\nContoh: *+sewa https://chat.whatsapp.com/ABC123 7d*`);
    }

    const link = args[0];
    const durasi = args[1];
    const regex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
    const [_, code] = link.match(regex) || [];

    if (!code) return m.reply('❌ Link grup tidak valid.');

    const msDur = ms(durasi);
    if (!msDur) return m.reply('❌ Format durasi salah. Contoh: 1d, 2h, 30m');

    try {
        const gid = await conn.groupAcceptInvite(code);
        const groupMeta = await conn.groupMetadata(gid);
        const expire = Date.now() + msDur;

        if (!db.list().chats[gid]) db.list().chats[gid] = {};
        db.list().chats[gid].sewa = expire;

        const formatted = new Date(expire).toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta'
        });

        return m.reply(
`✅ *BERHASIL SEWA GRUP*

📌 *Nama:* ${groupMeta.subject}
🆔 *ID:* ${gid}
⏳ *Durasi:* ${durasi}
📅 *Kedaluwarsa:* ${formatted} WIB`
        );
    } catch (e) {
        console.error('[SEWA ERROR]', e);
        m.reply('❌ Gagal masuk ke grup. Pastikan link valid dan saya tidak diblokir.');
    }
};

handler.command = ['+sewa'];
handler.category = 'owner';
handler.description = 'Menyewa grup berdasarkan waktu (untuk owner)';
handler.owner = true;

module.exports = handler;
