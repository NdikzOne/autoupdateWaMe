const fs = require("fs");
const path = require("path");
const {
    execSync
} = require("child_process");
const moment = require("moment-timezone");
const env = require("../../settings.js");

let lastBackupHour = null;

const handler = m => m;

handler.before = async function(m, {
    conn
}) {
    try {
        const now = moment().tz("Asia/Jakarta");
        const hour = now.hour();
        const current3HourSegment = Math.floor(hour / 3); // 0–7 (8x per 24 jam)

        if (lastBackupHour === current3HourSegment) return; // Sudah backup di segmen ini
        lastBackupHour = current3HourSegment;

        const zipName = `autobackup_${now.format("DD-MM-YY_HH")}.zip`;
        const zipPath = path.resolve(zipName);

        const backupItems = [
            "commands",
            "ayane.js",
            "case.js",
            "core",
            "database",
            "handler",
            "index.js",
            "functions.js",
            "package.json",
            "settings.js",
            "database.json"
        ].filter(item => fs.existsSync(item));

        if (!backupItems.length) return;

        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath); // Hapus zip lama

        execSync(`zip -r ${zipName} ${backupItems.join(" ")}`);

        for (const id of env.owner) {
            const jid = id.toString().replace(/\D/g, "") + "@s.whatsapp.net";

            await conn.sendMessage(jid, {
                document: fs.readFileSync(zipPath),
                fileName: zipName,
                mimetype: "application/zip",
                caption: `📦 *Backup Otomatis*\n🕒 ${now.format("DD-MM-YYYY HH:mm")}`
            });
        }

        fs.unlinkSync(zipPath); // Bersihkan
        console.log(`[✅ AUTO BACKUP] ${zipName} dikirim ke semua owner.`);
    } catch (e) {
        console.error("[❌ Auto Backup Error]:", e.message);
    }
};

module.exports = handler;