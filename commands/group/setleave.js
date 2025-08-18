// File: commands/group/setleave.js
const handler = async (m, { text, db }) => {
    if (!m.isGroup) return m.reply("❌ Perintah ini hanya untuk grup.");
    if (!text) {
        return m.reply(
            "✏️ Masukkan pesan leave.\n" +
            "Contoh:\n" +
            ".setleave @user telah keluar dari @subject.\n\n" +
            "📌 Placeholder:\n" +
            "@user = Mention user\n" +
            "@subject = Judul grup\n" +
            "@desc = Deskripsi grup"
        );
    }

    let groupData = db.get("group", m.chat) || {};
    groupData.leaveMsg = text; // simpan pesan custom
    await db.add("group", m.chat, groupData); // pakai add() untuk simpan
    await db.save();

    m.reply(
        `✅ Leave berhasil diatur\n\n` +
        `@user (Mention)\n` +
        `@subject (Judul Grup)\n` +
        `@desc (Deskripsi Grup)`
    );
};

handler.command = ["setleave"];
handler.category = "group";
handler.description = "Set pesan leave di grup";
handler.admin = true;

module.exports = handler;