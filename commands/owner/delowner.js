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
    const index = ownerList.indexOf(who);

    if (index === -1) {
        return m.reply(`${who.split('@')[0]} bukan Owner.`);
    }

    // Hapus dari daftar owner
    ownerList.splice(index, 1);

    // Hapus flag owner dari user (jika ada)
    const user = db.list().user[who] ||= {
        owner: true
    };
    user.owner = false;

    await db.save();

    m.reply(`✅ Status Owner dari ${who.split('@')[0]} telah dicabut.`);
};

handler.command = ['delowner'];
handler.category = 'owner';
handler.description = 'Menghapus status Owner dari user.';
handler.owner = true;

module.exports = handler;
