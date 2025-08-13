// File: commands/tools/ping.js
const os = require("os");
const { performance } = require("perf_hooks");

const formatTime = sec => {
    const days = Math.floor(sec / (3600 * 24));
    const hours = Math.floor((sec % (3600 * 24)) / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = Math.floor(sec % 60);

    return `${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik`;
};

const handler = async (m, { conn }) => {
    const start = performance.now();
    await conn.reply(m.chat, "Pinging...", m);
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

    // OS info
    const osType = os.type();
    const osRelease = os.release();
    const platform = os.platform();
    const arch = os.arch();

    const msg = `
*📡 PING & SYSTEM INFO*
🏓 Ping: *${latency} ms*
⏳ Uptime Bot: *${formatTime(uptimeSec)}*
🖥 Runtime System: *${formatTime(runtimeSec)}*

*💻 CPU*
• Model: ${cpuModel}
• Core: ${cpuCores}
• Speed: ${cpuSpeed} MHz

*📦 RAM*
• Total: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB
• Used: ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB
• Free: ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB
• Usage: ${memPercent}%

*🖥 OS*
• Type: ${osType}
• Release: ${osRelease}
• Platform: ${platform}
• Arch: ${arch}

*🔧 Node.js*
• Version: ${process.version}
`.trim();

    await conn.reply(m.chat, msg, m);
};

handler.command = ["ping"];
handler.category = "info";
handler.description = "Cek ping, uptime, dan informasi sistem";
handler.owner = false;

module.exports = handler;
