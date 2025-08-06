const handler = async (m, {
    args,
    usedPrefix,
    command,
    db
}) => {
    if (!args[0]) return m.reply(`Gunakan format:\n${usedPrefix + command} @tag/nomor`);

    let who;
    if (m.isGroup) {
        who = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
    }

    if (!who) {
        const nomor = args[0].replace(/[^0-9]/g, '');
        if (!nomor) return m.reply("Masukkan nomor dengan benar!");
        who = nomor + '@s.whatsapp.net';
    }

    if (typeof who !== 'string' || !who.includes('@')) {
        return m.reply("ID target tidak valid.");
    }

    const ownerList = db.list().owner ||= [];

    if (ownerList.includes(who)) {
        return m.reply(`${who.split('@')[0]} sudah menjadi Owner.`);
    }

    // Tambahkan ke daftar owner
    ownerList.push(who);

    // Set flag user owner
    const user = db.list().user[who] ||= {
        owner: false
    };
    user.owner = true;

    await db.save();

    m.reply(`✅ Berhasil menambahkan ${who.split('@')[0]} sebagai Owner.`);
};

handler.command = ['addowner'];
handler.category = 'owner';
handler.description = 'Menambahkan user sebagai Owner bot.';
handler.owner = true;

module.exports = handler;
