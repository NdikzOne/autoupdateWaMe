var gmail = 'dikacanda405@gmail.com'
const env = require("../../settings.js");
const {
    default: makeWASocket,
    BufferJSON,
    WA_DEFAULT_EPHEMERAL,
    generateWAMessageFromContent,
    downloadContentFromMessage,
    downloadHistory,
    proto,
    getMessage,
    generateWAMessageContent,
    prepareWAMessageMedia
} = require(env.baileys);
const handler = async (m, {
    conn,
    text,
    args,
    usedPrefix,
    command,
    cmd,
    isOwner,
    db
}) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN: ${env.ownerName}
item.ORG: Creator Bot
item1.TEL;waid=${env.creator.split('@')[0]}:${env.creator}
item1.X-ABLabel:Nomor Owner Bot 
item2.EMAIL;type=INTERNET:${gmail}
item2.X-ABLabel:Email Owner
item3.ADR:;;🇮🇩 Isekai;;;;
item3.X-ABADR:ac
item4.EMAIL;type=INTERNET:Ndikz@coder.me
item4.X-ABLabel:Email Developer 
item3.ADR:;;🇮🇩 Isekai;;;;
item3.X-ABADR:ac 
item5.URL:https://ndikz-api.vercel.app
item5.X-ABLabel:Website
END:VCARD`
    const sentMsg = await conn.sendMessage(
        m.chat, {
            contacts: {
                displayName: 'CN',
                contacts: [{
                    vcard
                }]
            }
        }
    )
    await conn.reply(m.chat, "Itu Adalah nomor owner Bot", sentMsg)
}
handler.command = ['owner'];
handler.category = 'info';
handler.description = 'Bot Owner.';
handler.limit = true;

module.exports = handler;