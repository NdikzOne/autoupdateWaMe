const ms = require('ms');

const handler = async (m, {
    conn,
    text,
    args,
    usedPrefix,
    command,
    cmd,
    isOwner,
    db,
    groupMetadata
}) => {
    if (!isOwner) {
        const chat = db.list().chats[m.chat] || {};
        if (chat.sewa) {
            const expiryDate = new Date(chat.sewa).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
            return m.reply(`Grup ini dalam masa sewa hingga:\n*${expiryDate} WIB*.\n\nUntuk memperpanjang, silakan hubungi Owner.`);
        } else {
            return m.reply('Grup ini tidak terdaftar dalam sewa.');
        }
    }

    if (!m.isGroup) {
        return m.reply('Perintah ini hanya dapat digunakan di dalam grup.');
    }
    
    if (args.length < 1) {
        const chat = db.list().chats[m.chat] || {};
        if (chat.sewa) {
            const expiryDate = new Date(chat.sewa).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
            return m.reply(`Grup ini terdaftar dalam sewa hingga:\n*${expiryDate} WIB*.\n\nUntuk memperpanjang, gunakan:\n*.sewa <durasi>*`);
        } else {
            return m.reply('Grup ini tidak terdaftar dalam sewa.\n\nUntuk menyewa, gunakan:\n*.sewa <durasi>*');
        }
    }

    const durationText = args[0];
    const durationMs = ms(durationText);

    if (!durationMs) {
        return m.reply('Format durasi tidak valid. Contoh: 7d, 30d, 1h');
    }

    const chat = db.list().chats[m.chat] || {};
    const now = Date.now();
    const newExpiry = (chat.sewa && chat.sewa > now ? chat.sewa : now) + durationMs;
    
    chat.sewa = newExpiry;
    db.list().chats[m.chat] = chat;
    
    const expiryDate = new Date(newExpiry).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    m.reply(`✅ *Sewa Berhasil Diperpanjang*

› *Durasi Tambahan:* ${durationText}
› *Kadaluarsa Baru:* ${expiryDate} WIB`);
};

handler.command = ['sewa', 'ceksewa'];
handler.category = 'group';
handler.description = 'Menyewakan bot ke group.';
handler.group = true;

module.exports = handler;
