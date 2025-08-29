let handler = async (m, { conn, text }) => {
  try {
    if (!text) return m.reply("❌ Link channel mana?\n\nContoh: *.cekidch https://whatsapp.com/channel/XXXXXXXXXXX*")
    if (!text.includes("https://whatsapp.com/channel/")) return m.reply("❌ Link channel tidak valid")

    // ambil ID channel dari link
    let result = text.split("https://whatsapp.com/channel/")[1]

    // ambil metadata channel
    let res = await conn.newsletterMetadata("invite", result)

    let teks = `📡 *INFO CHANNEL*\n\n`
    teks += `🆔 ID: ${res.id}\n`
    teks += `📛 Nama: ${res.name}\n`
    teks += `👥 Total Pengikut: ${res.subscribers}\n`
    teks += `📌 Status: ${res.state}\n`
    teks += `✅ Verified: ${res.verification == "VERIFIED" ? "Terverifikasi" : "Tidak"}\n`

    // kirim dengan interactiveButtons + salin id
    await conn.sendMessage(
      m.chat,
      {
        text: teks,
        title: "ℹ️ Detail Channel",
        footer: "📩 Dikirim oleh Bot",
        interactiveButtons: [
          {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "📋 Salin ID",
              copy_code: res.id
            })
          },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "🌐 Kunjungi Channel",
              url: `https://whatsapp.com/channel/${res.id}`,
              merchant_url: `https://whatsapp.com/channel/${res.id}`
            })
          }
        ]
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    m.reply("❌ Gagal ambil data channel. Pastikan link benar atau bot support fitur channel.")
  }
}

handler.command = ["cekidch", "cekchannel"]
handler.category = "tools"
handler.description = "Cek info channel WhatsApp dari link"

module.exports = handler