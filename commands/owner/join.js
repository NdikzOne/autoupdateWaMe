let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("❌ Masukkan link group WA.\n\nContoh: .joingroup https://chat.whatsapp.com/XXXXXXXXXXXXXXX")

  // validasi link
  let match = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/)
  if (!match) return m.reply("❌ Link tidak valid. Pastikan link group seperti ini:\nhttps://chat.whatsapp.com/XXXXXXXXXXXXXXX")

  let inviteCode = match[1]

  try {
    await conn.groupAcceptInvite(inviteCode)
    m.reply("✅ Bot berhasil join ke group!")
  } catch (e) {
    console.error(e)
    m.reply("❌ Gagal join ke group. Mungkin link sudah expired atau bot sudah di group itu.")
  }
}

handler.command = ["joingroup", "join"]
handler.category = "owner"
handler.owner = true
handler.description = "Memasukkan bot ke dalam group lewat link invite"

module.exports = handler