const fs = require('fs');
const path = require('path');
const axios = require('axios');
const tar = require('tar');
const archiver = require('archiver');

const handler = async (m, {
    conn,
    args,
    text
}) => {
    const modName = text.trim();
    if (!modName) return m.reply(`Contoh: .getnpm express`);

    try {
        // Encode package name untuk URL
        const encodedModName = encodeURIComponent(modName).replace('%40', '@');

        // Ambil metadata dari npm registry
        const {
            data
        } = await axios.get(`https://registry.npmjs.org/${encodedModName}`);

        if (!data || !data['dist-tags'] || !data['dist-tags'].latest) {
            return m.reply('❌ Package tidak ditemukan atau tidak memiliki versi latest.');
        }

        const latestVersion = data['dist-tags'].latest;
        const versionData = data.versions[latestVersion];

        if (!versionData || !versionData.dist || !versionData.dist.tarball) {
            return m.reply('❌ Tarball URL tidak ditemukan untuk versi terbaru.');
        }

        const tarballUrl = versionData.dist.tarball;
        console.log('Tarball URL:', tarballUrl);

        // Direktori temp
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, {
                recursive: true
            });
        }

        const extractDir = path.join(tempDir, `${modName.replace(/[@\/]/g, '_')}_${Date.now()}`);
        fs.mkdirSync(extractDir, {
            recursive: true
        });

        // Download tarball
        const tarballPath = path.join(tempDir, `${modName.replace(/[@\/]/g, '_')}.tgz`);
        const response = await axios({
            url: tarballUrl,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        fs.writeFileSync(tarballPath, response.data);
        console.log('Tarball downloaded:', tarballPath);

        // Ekstrak tarball
        try {
            await tar.x({
                file: tarballPath,
                cwd: extractDir,
                strip: 1
            });
        } catch (extractError) {
            console.error('Extraction error:', extractError);
            // Coba ekstrak tanpa strip
            await tar.x({
                file: tarballPath,
                cwd: extractDir
            });
        }

        // Cari folder package
        let packageFolder = extractDir;
        const packageJsonPath = path.join(extractDir, 'package.json');

        if (!fs.existsSync(packageJsonPath)) {
            // Cari di subdirectory
            const items = fs.readdirSync(extractDir);
            for (const item of items) {
                const itemPath = path.join(extractDir, item);
                if (fs.statSync(itemPath).isDirectory()) {
                    const subPackageJson = path.join(itemPath, 'package.json');
                    if (fs.existsSync(subPackageJson)) {
                        packageFolder = itemPath;
                        break;
                    }
                }
            }
        }

        console.log('Package folder:', packageFolder);

        if (!fs.existsSync(path.join(packageFolder, 'package.json'))) {
            throw new Error('Package folder tidak valid setelah ekstraksi');
        }

        // ZIP hasil ekstraksi
        const zipFileName = `${modName.replace(/[@\/]/g, '_')}.zip`;
        const zipPath = path.join(tempDir, zipFileName);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', {
            zlib: {
                level: 9
            }
        });

        return new Promise((resolve, reject) => {
            output.on('close', async () => {
                console.log('Archive created:', zipPath, archive.pointer() + ' total bytes');

                try {
                    const buffer = fs.readFileSync(zipPath);

                    await conn.sendMessage(m.chat, {
                        document: buffer,
                        fileName: zipFileName,
                        mimetype: 'application/zip'
                    }, {
                        quoted: m
                    });

                    // Bersihkan file
                    fs.unlinkSync(zipPath);
                    fs.unlinkSync(tarballPath);
                    fs.rmSync(extractDir, {
                        recursive: true,
                        force: true
                    });

                    resolve();
                } catch (sendError) {
                    console.error('Send error:', sendError);
                    reject(sendError);
                }
            });

            archive.on('error', err => {
                console.error('Archive error:', err);
                m.reply('❌ Gagal membuat zip.');
                reject(err);
            });

            archive.on('warning', (err) => {
                if (err.code === 'ENOENT') {
                    console.warn('Archive warning:', err);
                } else {
                    throw err;
                }
            });

            archive.pipe(output);

            // Tambahkan semua file dari packageFolder
            archive.directory(packageFolder, false);

            archive.finalize();
        });

    } catch (err) {
        console.error('Handler error:', err);
        m.reply(`❌ Gagal mengambil package dari NPM: ${err.message}`);
    }
};

handler.command = ['getnpm'];
handler.category = 'tools';
handler.description = 'Mengambil module npm langsung dari npm dan dikirim dalam bentuk .zip';
handler.owner = true;

module.exports = handler;