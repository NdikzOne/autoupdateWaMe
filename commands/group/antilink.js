// File: commands/group/antilink.js

// Regex deteksi link
const linkRegex = /(?:https?:\/\/|www\.|t\.me\/|telegram\.me\/|wa\.me\/|chat\.whatsapp\.com\/|bit\.ly\/|tinyurl\.com\/|discord\.gg\/|discordapp\.com\/invite\/|joinchat\/)[^\s]+/i;
const maxLinkWarnings = 3;

// Command: .antilink on / off
const handler = async (m, {
    text,
    db,
    groupMetadata,
    isBotAdmin
}) => {
    const groupData = db.list().group[m.chat] ||= {};

    if (!text || !['on', 'off'].includes(text.toLowerCase())) {
        return m.reply(`🔗 Contoh penggunaan:\n.antilink on\n.antilink off`);
    }

    groupData.antilink = text.toLowerCase() === 'on';
    await db.save();

    return m.reply(`✅ Anti-Link sekarang *${groupData.antilink ? 'AKTIF' : 'NONAKTIF'}* di grup ini.`);
};

// Middleware: sebelum semua pesan
handler.before = async function(m, {
    conn,
    db,
    isBotAdmin,
    isAdmin
}) {
    if (!m.isGroup || m.fromMe || !m.text) return;

    const groupData = db.list().group[m.chat] ||= {};
    const userData = db.list().user[m.sender] ||= {};

    if (!groupData.antilink) return;

    if (linkRegex.test(m.text)) {
        userData.linkWarn = (userData.linkWarn || 0) + 1;

        // Hapus pesan kalau bot admin
        if (isBotAdmin) {
            try {
                await conn.sendMessage(m.chat, {
                    delete: m.key
                });
            } catch {}
        }

        if (userData.linkWarn >= maxLinkWarnings) {
            userData.linkWarn = 0; // reset
            await conn.reply(
                m.chat,
                `🚫 @${m.sender.split('@')[0]} terdeteksi menyebarkan link berkali-kali!\nPesan dihapus, tanpa kick.`,
                m, {
                    mentions: [m.sender]
                }
            );
        } else {
            await conn.reply(
                m.chat,
                `⚠️ @${m.sender.split('@')[0]}, link terdeteksi!\nPeringatan: ${userData.linkWarn}/${maxLinkWarnings}`,
                m, {
                    mentions: [m.sender]
                }
            );
        }

        await db.save();
    }
};

// Metadata
handler.command = ['antilink'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.category = 'group';
handler.description = 'Aktif/nonaktifkan anti-link di grup (hapus pesan, no kick)';

module.exports = handler;