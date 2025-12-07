/** const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const moment = require("moment-timezone");
const env = require("../../settings.js");

let lastBackupHour = null;

const handler = m => m;

handler.before = async function () {
  try {
    const now = moment().tz("Asia/Jakarta");
    const hour = now.hour();
    const current3HourSegment = Math.floor(hour / 3); // setiap 3 jam sekali

    if (lastBackupHour === current3HourSegment) return; 
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

    if (!backupItems.length) {
      console.log("[⚠️ AUTO BACKUP] Tidak ada file/folder yang ditemukan untuk dibackup.");
      return;
    }

    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

    console.log(`[🔄 AUTO BACKUP] Membuat file zip: ${zipName}`);
    execSync(`zip -r ${zipName} ${backupItems.join(" ")}`);
    console.log(`[✅ AUTO BACKUP] File zip berhasil dibuat: ${zipPath}`);

    // === PUSH KE GITHUB ===
    const repoName = "autobackup";
    const tmpDir = path.resolve(".autobackup_repo");

    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });

    console.log("[🔄 AUTO BACKUP] Clone repo GitHub...");
    execSync(`git clone https://${env.ghtoken}@github.com/${env.githubUsername}/${repoName}.git ${tmpDir}`);
    console.log("[✅ AUTO BACKUP] Repo berhasil diclone.");

    // copy zip ke repo
    fs.copyFileSync(zipPath, path.join(tmpDir, zipName));
    console.log(`[📦 AUTO BACKUP] File ${zipName} disalin ke repo.`);

    // config git identity + commit + push
    console.log("[🔄 AUTO BACKUP] Commit & push ke GitHub...");
    execSync(
      `cd ${tmpDir} && git config user.email "autobackup@bot.com" && git config user.name "AutoBackupBot" && git add . && git commit -m "Auto backup ${now.format("DD-MM-YYYY HH:mm")}" && git push`
    );
    console.log(`[✅ AUTO BACKUP] ${zipName} berhasil dipush ke GitHub.`);

    // bersihkan
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.unlinkSync(zipPath);

  } catch (e) {
    console.error("[❌ Auto Backup Error]:", e.message);
  }
};

module.exports = handler; \**