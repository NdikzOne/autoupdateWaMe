const axios = require("axios");
const fs = require("fs");
const path = require("path");

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`Contoh:\n.${command} https://youtu.be/WK-PlNz52FM`);
  if (!text.includes("youtube.com") && !text.includes("youtu.be"))
    return m.reply(`❌ URL YouTube tidak valid.`);

  try {
    const api = `https://ndikz-api.vercel.app/download/ytmp4?url=${encodeURIComponent(text)}`;
    const { data } = await axios.get(api);

    if (!data.status || !data.download) return m.reply("❌ Gagal mengambil video.");

    const videoUrl = data.download;
    const tmpDir = path.resolve('./tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const outputPath = path.join(tmpDir, `yt-${Date.now()}.mp4`);
    const response = await axios.get(videoUrl, { responseType: 'stream' });
    const writer = fs.createWriteStream(outputPath);

    await new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const buffer = fs.readFileSync(outputPath);

    await conn.sendMessage(m.chat, {
      video: buffer,
      caption: `🎬 *${data.title}*`,
      fileName: `${data.title}.mp4`,
      mimetype: "video/mp4"
    }, { quoted: m });

    fs.unlinkSync(outputPath);
  } catch (e) {
    console.error('[YTMP4 ERROR]', e);
    await m.reply(`❌ Gagal:\n${e.message}`);
  }
};

handler.command = ["ytmp4", "ytv"];
handler.category = "downloader";
handler.description = "Download video dari YouTube via API";

module.exports = handler;
