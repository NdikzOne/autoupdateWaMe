const handler = async (m, { conn, args, isOwner, db }) => {
    if (!isOwner) return m.reply('❌ Perintah ini hanya bisa digunakan oleh Owner.');

    const gid = args[0]
        ? args[0].replace(/[^0-9]/g, '') + '@g.us'
        : m.chat;

    if (!gid.endsWith('@g.us')) {
        return m.reply('❌ ID grup tidak valid. Gunakan perintah di dalam grup atau kirim ID grup.');
    }

    const chat = db.list().chats[gid];

    if (!chat || !chat.sewa) {
        return m.reply('⛔ Grup ini tidak terdaftar dalam data sewa.');
    }

    try {
        const metadata = await conn.groupMetadata(gid);
        await conn.sendMessage(gid, {
            text: `⚠️ Masa sewa bot di grup *${metadata.subject}* telah dihentikan oleh Owner.\nTerima kasih sudah menggunakan layanan kami. 👋`
        });

        delete db.list().chats[gid].sewa;
        await db.save();

        await conn.groupLeave(gid);
    } catch (err) {
        console.error('[SEWA STOP ERROR]', err);
        return m.reply('❌ Gagal menghentikan sewa. Pastikan saya masih ada di dalam grup tersebut.');
    }
};

handler.command = ['-sewa', 'delsewa'];
handler.category = 'owner';
handler.description = 'Menghapus sewa dan keluar dari grup';

module.exports = handler;
