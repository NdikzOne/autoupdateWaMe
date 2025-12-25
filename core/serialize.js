const env = require("../settings.js");
const {
  extractMessageContent,
  jidNormalizedUser,
  areJidsSameUser,
  downloadMediaMessage,
} = require("baileys");

const getDevice = (id) =>
  /^3A.{18}$/.test(id)
    ? "ios"
    : /^3E.{20}$/.test(id)
      ? "web"
      : /^(.{21}|.{32})$/.test(id)
        ? "android"
        : /^.{18}$/.test(id)
          ? "desktop"
          : "bot";

const getContentType = (content) => {
  if (content) {
    const keys = Object.keys(content);
    const key = keys.find(
      (k) =>
        (k === "conversation" ||
          k.endsWith("Message") ||
          k.includes("V2") ||
          k.includes("V3")) &&
        k !== "senderKeyDistributionMessage",
    );
    return key;
  }
};

function parseMessage(content) {
  content = extractMessageContent(content);
  if (content && content.viewOnceMessageV2Extension) {
    content = content.viewOnceMessageV2Extension.message;
  }
  if (content && content.protocolMessage && content.protocolMessage.type == 14) {
    let type = getContentType(content.protocolMessage);
    content = content.protocolMessage[type];
  }
  if (content && content.message) {
    let type = getContentType(content.message);
    content = content.message[type];
  }
  return content;
}
const getCorrectRemoteJid = (key) => {
  return key.participant || key.senderPn || key.remoteJid;
};

module.exports = async (raw, conn, store) => {
  if (!raw || !raw.message) return;

  let m = {};
  m.key = raw.key;
  m.from = m.key.remoteJid;
  m.fromMe = m.key.fromMe;
  m.message = parseMessage(raw.message);
  m.sender = jidNormalizedUser(m.key.participant || m.from); // JID pengirim pesan

  if (raw.message) {
    m.type = getContentType(raw?.message) || Object.keys(raw.message)[0];
    m.msg = parseMessage(raw.message[m.type]) || raw.message[m.type];
    m.mentions = [
      ...(m.msg?.contextInfo?.mentionedJid || []),
      ...(m.msg?.contextInfo?.groupMentions?.map((v) => v.groupJid) || []),
    ];
    m.text =
      m.msg?.text ||
      m.msg?.conversation ||
      m.msg?.caption ||
      m.message?.conversation ||
      m.msg?.selectedButtonId ||
      m.msg?.singleSelectReply?.selectedRowId ||
      m.msg?.selectedId ||
      m.msg?.contentText ||
      m.msg?.selectedDisplayText ||
      m.msg?.title ||
      "";
  }

  m.isGroup = m.from.endsWith("@g.us");
  m.isNewsletter = m.from.endsWith("@newsletter");
  m.jid = jidNormalizedUser(
    m.fromMe ? conn.user.id : m.isGroup ? m.key.participant : m.from,
  );

  if (m.isGroup) {
    if (!(m.from in store.groupMetadata))
      store.groupMetadata[m.from] = await conn.groupMetadata(m.from);
    m.metadata = store.groupMetadata[m.from];
  }

  m.id = raw?.key?.id || false;
  m.device = getDevice(m.id);
  m.isBot = (m.id && m.id.startsWith("BAE5")) || m.device === "bot";
  m.expiration = m.msg?.contextInfo?.expiration || 0;
  m.timestamps =
    typeof raw?.messageTimestamp === "number"
      ? raw?.messageTimestamp * 1000
      : m.msg?.timestampMs * 1000 || Date.now();
  m.name = raw?.pushName || conn.user?.name || "User";
  m.isMedia = !!m.msg?.mimetype || !!m.msg?.thumbnailDirectPath;

  if (m.isMedia) {
    m.download = async () => {
      return downloadMediaMessage(raw, "buffer", {}, {
        logger: console,
        reuploadRequest: conn.updateMediaMessage
      });
    };
  }
  const qchanel = {
key: {
remoteJid: 'status@broadcast',
participant: '0@s.whatsapp.net'
},
message: {
newsletterAdminInviteMessage: {
newsletterJid: env.linkch,
newsletterName: env.nameBot,
jpegThumbnail: '',
caption: env.footer,
inviteExpiration: Date.now() + 1814400000
}
}}

  m.reply = async (text, chatId = m.chat, options = {}) => {
  const isObject = typeof text === 'object' && text !== null;
  const payload = isObject ? {
    ...text
  } : {
    text,
    contextInfo: {
      mentionedJid: [],
      groupMentions: [],
      isForwarded: true,
      forwardingScore: 256,
      forwardedNewsletterMessageInfo: {
        newsletterJid: env.linkch,
        newsletterName: `[ ✓ ] ${env.nameBot}`,
        serverMessageId: -1
      },
      businessMessageForwardInfo: {
        businessOwnerJid: conn.user?.jid || '',
      },
      externalAdReply: {
        title: `${env.ownerName} ( ${env.footer} )`,
        body: env.wm,
        thumbnailUrl: env.thumb2,
        sourceUrl: env.lynk,
        mediaType: 1,
        renderLargerThumbnail: false
      },
      ...(options.contextInfo || {})
    },
    ...options
  };
  return conn.sendMessage(chatId, payload, {
    quoted: qchanel,
    ephemeralExpiration: m.expiration,
    ...options
  });
};

  m.edit = async (text, key = m.key) => {
    let payload = {};
    if (typeof text === "string") payload = { text, edit: key };
    else if (typeof text === "object" && text !== null) payload = { ...text, edit: key };
    return conn.sendMessage(m.from, payload, { quoted: raw });
  };

  m.react = (emoji) => {
    conn.sendMessage(m.from, { react: { text: emoji, key: m.key } });
  };

  // --- PROSES QUOTED MESSAGE (DIPERBAIKI) ---
  if (m?.msg?.contextInfo?.quotedMessage) {
    m.quoted = {};
    // Membuat objek pesan mentah tiruan untuk pesan yang dibalas
    const quotedRaw = {
        key: {
            remoteJid: m.from,
            fromMe: areJidsSameUser(m.msg.contextInfo.participant, conn.user.lid.split(':')[0] + '@lid'),
            id: m.msg.contextInfo.stanzaId,
            participant: m.msg.contextInfo.participant
        },
        message: m.msg.contextInfo.quotedMessage
    };
    
    m.quoted.id = quotedRaw.key.id;
    m.quoted.sender = jidNormalizedUser(quotedRaw.key.participant);
    m.quoted.fromMe = quotedRaw.key.fromMe;
    m.quoted.isBot = m.quoted.id ? m.quoted.id.startsWith("BAE5") : false;
    m.quoted.message = parseMessage(quotedRaw.message);
    m.quoted.type = getContentType(m.quoted.message) || Object.keys(m.quoted.message)[0];
    m.quoted.msg = m.quoted.message[m.quoted.type] || m.quoted.message;

    // Logika ekstraksi teks yang lengkap dan diperbaiki
    m.quoted.text = 
      m.quoted.msg?.text ||
      m.quoted.msg?.conversation ||
      m.quoted.msg?.caption ||
      (typeof m.quoted.msg === 'string' ? m.quoted.msg : '') || // Menangani jika msg adalah string
      "";
      
    m.quoted.isMedia = !!m.quoted.msg?.mimetype || !!m.quoted.msg?.thumbnailDirectPath;
    if (m.quoted.isMedia) {
        m.quoted.download = async () => {
            return downloadMediaMessage(quotedRaw, "buffer", {}, {
                logger: console,
                reuploadRequest: conn.updateMediaMessage
            });
        };
    }
  }

  return m;
};
