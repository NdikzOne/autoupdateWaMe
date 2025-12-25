// File: commands/tools/ping.js
const os = require("os");
const {
    performance
} = require("perf_hooks");

const formatTime = sec => {
    const days = Math.floor(sec / (3600 * 24));
    const hours = Math.floor((sec % (3600 * 24)) / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = Math.floor(sec % 60);

    return `${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik`;
};

const handler = async (m, {
    conn
}) => {
    const start = performance.now();

    // Mengukur ping/latency
    const latency = (performance.now() - start).toFixed(2);

    // Uptime bot
    const uptimeSec = process.uptime();

    // Runtime system (sejak OS nyala)
    const runtimeSec = os.uptime();

    // CPU info
    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuCores = cpus.length;
    const cpuSpeed = cpus[0].speed;

    // RAM info
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercent = ((usedMem / totalMem) * 100).toFixed(2);

    // Hitung dalam GB
    const usedGB = Math.floor(usedMem / 1024 / 1024 / 1024);
    const totalGB = Math.floor(totalMem / 1024 / 1024 / 1024);

    // OS info
    const osType = os.type();
    const osRelease = os.release();
    const platform = os.platform();
    const arch = os.arch();

    // Kirim sebagai poll result message
    await conn.sendMessage(m.chat, {
        pollResultMessage: {
            name: "📊 System Information",
            pollVotes: [{
                    optionName: "🏓 Ping Speed",
                    optionVoteCount: Math.max(1, Math.floor(latency))
                },
                {
                    optionName: "💾 RAM Used",
                    optionVoteCount: usedGB
                },
                {
                    optionName: "📦 Total RAM",
                    optionVoteCount: totalGB
                },
                {
                    optionName: "⏳ Bot Uptime",
                    optionVoteCount: Math.floor(uptimeSec / 3600) // dalam jam
                }
            ],
            newsletter: {
                newsletterJid: env.linkch,
                newsletterName: env.nameBot
            }
        }
    }, {
        quoted: m
    });

    // Kirim informasi lengkap sebagai teks juga (opsional)
    const detailedInfo = `
*📡 DETAILED SYSTEM INFO*

*⏱ WAKTU*
• Ping: *${latency} ms*
• Uptime Bot: *${formatTime(uptimeSec)}*
• Runtime System: *${formatTime(runtimeSec)}*

*💻 CPU*
• Model: ${cpuModel}
• Core: ${cpuCores}
• Speed: ${cpuSpeed} MHz

*📦 RAM*
• Total: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB
• Used: ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB (${memPercent}%)
• Free: ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB

*🖥 SISTEM*
• OS: ${osType} ${osRelease}
• Platform: ${platform}
• Architecture: ${arch}
• Node.js: ${process.version}
`.trim();

    // Kirim info detail sebagai pesan follow-up
    await conn.reply(m.chat, detailedInfo, m);
};

handler.command = ["ping"];
handler.category = "info";
handler.description = "Cek ping, uptime, dan informasi sistem dengan poll message";
handler.owner = false;

module.exports = handler;