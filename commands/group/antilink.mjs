/*/import { URL } from 'url';

// Handler untuk perintah .antilink on/off
const handler = async (m, { conn, text, group, db }) => {
  if (!text) {
    const status = group.antilink ? 'AKTIF' : 'NONAKTIF';
    return m.reply(`Status antilink saat ini: *${status}*.\nGunakan .antilink on/off`);
  }

  const action = text.toLowerCase();
  if (!['on', 'off'].includes(action)) {
    return m.reply("Gunakan 'on' untuk mengaktifkan atau 'off' untuk menonaktifkan.");
  }

  const isEnabled = action === 'on';
  group.antilink = isEnabled;
  // Saat menonaktifkan, hapus semua data peringatan
  if (!isEnabled) {
      group.warnings = {};
  }
  await db.save();

  m.reply(`✔ Antilink telah *${isEnabled ? 'diaktifkan' : 'dinonaktifkan'}* di grup ini.`);
};

// --- METADATA PERINTAH ---
handler.command = ["antilink"];
handler.category = "group";
handler.description = "Mengaktifkan/menonaktifkan fitur anti-link grup WhatsApp dengan sistem peringatan.";
handler.group = true;
handler.admin = true;

// --- EVENT HANDLER (dijalankan pada setiap pesan) ---
handler.onMessage = async (m, { conn, group, isAdmin, isBotAdmin, db }) => {
  // Cek hanya jika antilink aktif di grup ini
  if (!m.isGroup || !group || !group.antilink) {
    return;
  }

  // Jangan proses pesan dari admin, bot, atau owner
  if (isAdmin || m.fromMe) {
    return;
  }

  const chat = m.text || m.caption || '';
  const regex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
  const isGroupLink = regex.test(chat);

  if (isGroupLink) {
    // Pastikan objek warnings ada
    group.warnings = group.warnings || {};
    
    // Ambil jumlah peringatan user saat ini, default 0 jika belum ada
    let userWarnings = group.warnings[m.sender] || 0;
    userWarnings++;

    // Simpan jumlah peringatan baru ke database
    group.warnings[m.sender] = userWarnings;
    await db.save();

    // Hapus pesan yang mengandung link
    try {
        await conn.sendMessage(m.from, { delete: m.key });
    } catch (e) {
        console.error("Antilink: Gagal menghapus pesan.", e);
    }

    // Jika peringatan sudah mencapai 3 kali
    if (userWarnings >= 3) {
        // Reset peringatan user menjadi 0
        delete group.warnings[m.sender];
        await db.save();

        m.reply(`*Peringatan ke-3!* @${m.sender.split('@')[0]} telah melanggar aturan dan akan dikeluarkan.`, { mentions: [m.sender] });

        // Bot harus admin untuk bisa kick
        if (!isBotAdmin) {
            return m.reply("Gagal mengeluarkan pengguna, bot bukan admin.");
        }
        
        try {
            await conn.groupParticipantsUpdate(m.from, [m.sender], "remove");
        } catch (e) {
            console.error("Antilink: Gagal mengeluarkan pengguna.", e);
            m.reply("Gagal mengeluarkan pengguna.");
        }
    } else {
        // Jika peringatan masih di bawah 3
        const remaining = 3 - userWarnings;
        m.reply(`*PERINGATAN!* @${m.sender.split('@')[0]} dilarang mengirim link grup.\n\nAnda memiliki *${remaining}* kesempatan lagi sebelum dikeluarkan. (${userWarnings}/3)`, { mentions: [m.sender] });
    }
  }
};

export default handler;
