// File: commands/group/setwelcome.js
const handler = async (m, { text, db }) => {
    if (!m.isGroup) return m.reply("❌ Perintah ini hanya untuk grup.");
    if (!text) {
        return m.reply(
            "✏️ Masukkan pesan welcome.\n" +
            "Contoh:\n" +
            ".setwelcome Selamat datang @user di @subject!\n\n" +
            "📌 Placeholder:\n" +
            "@user = Mention user\n" +
            "@subject = Judul grup\n" +
            "@desc = Deskripsi grup"
        );
    }

    let groupData = db.get("group", m.chat) || {};
    groupData.welcomeMsg = text; // simpan pesan custom
    await db.add("group", m.chat, groupData); // pakai add() untuk simpan
    await db.save();

    m.reply(
        `✅ Welcome berhasil diatur\n\n` +
        `@user (Mention)\n` +
        `@subject (Judul Grup)\n` +
        `@desc (Deskripsi Grup)`
    );
};

handler.command = ["setwelcome"];
handler.category = "group";
handler.description = "Set pesan welcome di grup";
handler.admin = true;

module.exports = handler;