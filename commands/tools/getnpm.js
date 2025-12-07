const fs = require('fs');
const path = require('path');
const axios = require('axios');
const tar = require('tar');
const archiver = require('archiver');

const handler = async (m, {
    conn,
    args
}) => {
    const modName = args[0];
    if (!modName) return m.reply(`Contoh: .getnpm express`);

    try {
        // Ambil metadata dari npm registry
        const {
            data
        } = await axios.get(`https://registry.npmjs.org/${modName}`);
        const latestVersion = data['dist-tags'].latest;
        const tarballUrl = data.versions[latestVersion].dist.tarball;

        // Direktori temp
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        const extractDir = path.join(tempDir, `${modName}_${Date.now()}`);
        fs.mkdirSync(extractDir);

        // Download tarball
        const tarballPath = path.join(tempDir, `${modName}.tgz`);
        const response = await axios({
            url: tarballUrl,
            method: 'GET',
            responseType: 'arraybuffer'
        });
        fs.writeFileSync(tarballPath, response.data);

        // Ekstrak tarball
        await tar.x({
            file: tarballPath,
            cwd: extractDir
        });

        // Lokasi folder hasil ekstrak (biasanya bernama 'package')
        const packageFolder = path.join(extractDir, 'package');

        // ZIP hasil ekstraksi
        const zipPath = path.join(tempDir, `${modName}.zip`);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', {
            zlib: {
                level: 9
            }
        });

        output.on('close', async () => {
            const buffer = fs.readFileSync(zipPath);

            await conn.sendMessage(m.chat, {
                document: buffer,
                fileName: `${modName}.zip`,
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
        });

        archive.on('error', err => {
            console.error(err);
            m.reply('❌ Gagal membuat zip.');
        });

        archive.pipe(output);
        archive.directory(packageFolder, modName);
        archive.finalize();

    } catch (err) {
        console.error(err);
        m.reply('❌ Gagal mengambil package dari NPM. Pastikan nama modul benar.');
    }
};

handler.command = ['getnpm'];
handler.category = 'tools';
handler.description = 'Mengambil module npm langsung dari npm dan dikirim dalam bentuk .zip';
handler.owner = true;

module.exports = handler;