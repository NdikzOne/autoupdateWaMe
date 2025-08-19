import fs from "fs";
import { execSync } from "child_process";
import path from "path";

const handler = async (m, { conn }) => {
    try {
        await m.reply("Membuat cadangan (backup)...");

        const backupList = [
            "commands",
            "core",
            "database",
            "handler",
            "ayane.js",
            "functions.js",
            "case.js",
            "index.js",
            "package.json",
            "settings.js",
            "database.json" // Sertakan database
        ];

        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getFullYear()).slice(-2)}`;
        const zipName = `backup_${dateStr}.zip`;
        const zipPath = path.resolve(zipName);

        const existingItems = backupList.filter(item => fs.existsSync(item));
        if (!existingItems.length) return m.reply("Tidak ada file atau folder yang bisa dibackup.");

        // Hapus zip lama jika ada
        if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
        }

        execSync(`zip -r ${zipName} ${existingItems.join(" ")}`);

        await m.reply(`Backup berhasil dibuat, mengirim ke chat pribadi...`);

        await conn.sendMessage(m.from, {
            document: fs.readFileSync(zipPath),
            fileName: zipName,
            mimetype: "application/zip",
        });

        // Hapus file zip setelah dikirim
        fs.unlinkSync(zipPath);

    } catch (e) {
        console.error(e);
        m.reply(`Gagal membuat atau mengirim backup.\nError: ${e.message}`);
    }
};

handler.command = ["backup"];
handler.category = "owner";
handler.description = "Membuat dan mengirim backup skrip bot.";
handler.owner = true;

export default handler;
