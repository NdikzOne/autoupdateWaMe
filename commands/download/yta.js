const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`Contoh:\n.${command} https://youtu.be/Xs0Lxif1u9E`);
  if (!text.includes("youtube.com") && !text.includes("youtu.be"))
    return m.reply(`❌ URL YouTube tidak valid.`);

  try {
    await m.reply("⏳ Mengambil link dan menyiapkan audio...");

    // 1. Ambil info dari API kamu
    const api = `https://ndikz-api.vercel.app/download/ytmp3?url=${encodeURIComponent(text)}`;
    const { data } = await axios.get(api);

    if (!data?.status || !data?.download) {
      return m.reply("❌ Gagal mendapatkan data dari API.");
    }

    const title = data.title || "audio";
    const downloadURL = data.download;

    // 2. Setup path
    const tmpDir = path.resolve('./tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const inputPath = path.join(tmpDir, `yt-${Date.now()}.raw`);
    const outputPath = path.join(tmpDir, `yt-${Date.now()}.mp3`);

    // 3. Download stream dari API ke file mentah
    const writer = fs.createWriteStream(inputPath);
    const response = await axios.get(downloadURL, { responseType: 'stream' });
    await new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // 4. Convert dengan ffmpeg
    await new Promise((resolve, reject) => {
      spawn("ffmpeg", ["-i", inputPath, "-vn", "-acodec", "libmp3lame", outputPath])
        .on("error", reject)
        .on("close", resolve);
    });

    // 5. Kirim hasilnya
    const buffer = fs.readFileSync(outputPath);
    await conn.sendMessage(m.chat, {
      audio: buffer,
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`
    }, { quoted: m });

    // 6. Cleanup
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
  } catch (e) {
    console.error('[YTMP3 FFMPEG ERROR]', e);
    await m.reply(`❌ Gagal:\n${e.message}`);
  }
};

handler.command = ["ytmp3", "yta"];
handler.category = "downloader";
handler.description = "Download audio dari YouTube via API & convert dengan ffmpeg";
module.exports = handler;
