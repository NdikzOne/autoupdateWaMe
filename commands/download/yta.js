const axios = require("axios");
const fs = require("fs");
const path = require("path");
const {
    spawn
} = require("child_process");

const handler = async (m, {
    conn,
    text,
    command
}) => {
    if (!text) return m.reply(`Contoh:\n.${command} https://youtu.be/WK-PlNz52FM`);
    if (!text.includes("youtube.com") && !text.includes("youtu.be"))
        return m.reply(`❌ URL YouTube tidak valid.`);

    const youtubeUrl = text.trim();

    const ytmp3mobi = async (youtubeUrl, format = "mp3") => {
        const regYoutubeId =
            /(?:https:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\n?#]+)/;
        const videoId = youtubeUrl.match(regYoutubeId)?.[1];
        if (!videoId) throw Error("❌ Gagal mengambil ID video YouTube.");

        const urlParam = {
            v: videoId,
            f: format,
            _: Math.random(),
        };

        const headers = {
            Referer: "https://id.ytmp3.mobi/",
        };

        const fetchJson = async (url, info) => {
            const res = await axios.get(url, {
                headers
            });
            if (res.status !== 200) throw Error(`Gagal fetch ${info} (${res.status})`);
            return res.data;
        };

        const {
            convertURL
        } = await fetchJson(
            "https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=" + Math.random(),
            "convertURL"
        );

        const {
            progressURL,
            downloadURL
        } = await fetchJson(
            `${convertURL}&${new URLSearchParams(urlParam).toString()}`,
            "progressURL"
        );

        let error, progress, title;
        while (progress != 3) {
            const result = await fetchJson(progressURL, "progress check");
            error = result.error;
            progress = result.progress;
            title = result.title;
            if (error) throw Error(`Gagal konversi: ${error}`);
        }

        return {
            title,
            downloadURL
        };
    };

    try {
        await m.reply("⏳ Mengunduh dan mengonversi audio...");

        const {
            title,
            downloadURL
        } = await ytmp3mobi(youtubeUrl);

        const inputPath = path.join('./tmp', `yt-${Date.now()}.raw`);
        const outputPath = path.join('./tmp', `yt-${Date.now()}.mp3`);
        const tmpDir = path.resolve('./tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, {
            recursive: true
        });

        const writer = fs.createWriteStream(inputPath);
        const response = await axios.get(downloadURL, {
            responseType: 'stream'
        });
        await new Promise((resolve, reject) => {
            response.data.pipe(writer);
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        await new Promise((resolve, reject) => {
            spawn("ffmpeg", ["-i", inputPath, "-vn", "-acodec", "libmp3lame", outputPath])
                .on("error", reject)
                .on("close", resolve);
        });

        const buffer = fs.readFileSync(outputPath);
        await conn.sendMessage(m.chat, {
            audio: buffer,
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
        }, {
            quoted: m
        });

        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
    } catch (e) {
        console.error('[YTMP3 FFMPEG ERROR]', e);
        await m.reply(`❌ Gagal:\n${e.message}`);
    }
};

handler.command = ["ytmp3", "yta"];
handler.category = "downloader";
handler.description = "Download audio dari YouTube (via ffmpeg)";
module.exports = handler;