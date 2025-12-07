const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment-timezone");
const fs = require('fs');
const env = require("../settings.js");

// Fungsi scraping anime terbaru
async function scrapeAnimeTerbaru() {
    try {
        console.log('[Scraper] 📡 Mengambil data anime terbaru dari OtakOtaku...');
        const response = await axios.get('https://otakotaku.com/anime/feed', {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const html = response.data;
        const $ = cheerio.load(html);
        
        const animeList = [];
        
        $('.anime-list').each((index, element) => {
            const animeElement = $(element);
            
            const title = animeElement.find('.anime-title a').text().trim();
            let url = animeElement.find('.anime-title a').attr('href');
            let image = animeElement.find('.anime-img img').attr('data-src') || animeElement.find('.anime-img img').attr('src');
            const sinopsis = animeElement.find('.sinopsis-anime').text().trim();
            
            const tipe = animeElement.find('table tr:contains("Tipe") td:last-child').text().trim();
            const episodes = animeElement.find('table tr:contains("Eps") td:last-child').text().trim();
            const musim = animeElement.find('table tr:contains("Musim") td:last-child').text().trim();
            
            // Perbaiki URL yang relatif
            if (url && !url.startsWith('http')) {
                url = `https://otakotaku.com${url}`;
            }
            
            if (image && !image.startsWith('http')) {
                image = `https://otakotaku.com${image}`;
            }
            
            const id = url ? url.split('/').filter(Boolean).pop() : null;
            
            if (title) {
                animeList.push({
                    id: id,
                    title: title,
                    url: url,
                    image: image,
                    sinopsis: sinopsis,
                    tipe: tipe,
                    episodes: episodes,
                    musim: musim,
                    date: new Date().toLocaleDateString('id-ID')
                });
            }
        });
        
        console.log(`[Scraper] ✅ Berhasil mengambil ${animeList.length} anime terbaru`);
        return animeList;
        
    } catch (error) {
        console.error('[Scraper] ❌ Error scraping anime:', error.message);
        throw error;
    }
}

const fetchJadwalSholat = async (kota) => {
    try {
        const { data } = await axios.get(`https://api.myquran.com/v2/sholat/kota/cari/${kota}`);
        if (!data.status || data.data.length === 0) return null;
        const id = data.data[0].id;
        const today = moment().tz('Asia/Jakarta').format('YYYY/MM/DD');
        const { data: jadwalData } = await axios.get(`https://api.myquran.com/v2/sholat/jadwal/${id}/${today}`);
        return jadwalData.status ? jadwalData.data.jadwal : null;
    } catch (e) {
        console.error(`[Scheduler] Gagal mengambil jadwal sholat untuk ${kota}:`, e);
        return null;
    }
};

const initializeScheduler = async (db) => {
console.log('[Scheduler] Inisialisasi jadwal sholat...');
  global.db.list().bots.jadwalsholat ||= {};
  global.db.list().bots.jadwalsholat.jakarta = await fetchJadwalSholat('jakarta');
  global.db.list().bots.jadwalsholat.makassar = await fetchJadwalSholat('makassar');
  global.db.list().bots.jadwalsholat.jayapura = await fetchJadwalSholat('jayapura');
  console.log('[Scheduler] Inisialisasi jadwal sholat selesai.');
};

const checkAdzan = async (conn, db) => {
global.db.list().bots ||= {};
global.db.list().chats ||= {};
    try {
        const now = moment().tz('Asia/Jakarta');
        const currentTime = now.format('HH:mm');

        // Refresh jadwal sholat sekali sehari setelah tengah malam
        if (currentTime === '00:01') {
            await initializeScheduler();
        }

        const activeGroups = Object.entries(global.db.list().chats || {})
            .filter(([id, chat]) => chat.notifadzan && id.endsWith('@g.us'));
        
        if (activeGroups.length === 0) return;
        
        for (const [gid, chat] of activeGroups) {
            const location = chat.adzanLocation || 'jakarta';
            const jadwal = global.db.list().bots.jadwalsholat[location];
            if (!jadwal) continue;

            const prayerTimes = {
                'Subuh': jadwal.subuh,
                'Dzuhur': jadwal.dzuhur,
                'Ashar': jadwal.ashar,
                'Maghrib': jadwal.maghrib,
                'Isya': jadwal.isya
            };

            for (const [prayer, time] of Object.entries(prayerTimes)) {
                if (currentTime === time && chat.lastAdzanNotif !== `${now.format('YYYY-MM-DD')}-${prayer}`) {
                    console.log(`[Scheduler] Waktu ${prayer} untuk grup ${gid}`);
                    
                    const audioPath = prayer === 'Subuh' ? './core/media/subuh.mp3' : './core/media/adzan.mp3';
                    
                    if (fs.existsSync(audioPath)) {
                       await conn.sendMessage(gid, {
                            audio: fs.readFileSync(audioPath),
                            mimetype: 'audio/mpeg',
                            ptt: true,
                            contextInfo: {
                                externalAdReply: {
                                    title: `Waktu Sholat ${prayer}`,
                                    body: `Wilayah ${location.charAt(0).toUpperCase() + location.slice(1)} dan sekitarnya`,
                                    thumbnailUrl: env.thumb2,
                                    sourceUrl: env.lynk || 'https://lipxz.com',
                                    mediaType: 2,
                                }
                            }
                        });
                        chat.lastAdzanNotif = `${now.format('YYYY-MM-DD')}-${prayer}`;
                        await db.save();
                    } else {
                        console.warn(`[Scheduler] File audio tidak ditemukan di: ${audioPath}`);
                    }
                }
            }
        }
    } catch (e) {
        console.error('[Scheduler] Error pada checkAdzan:', e);
    }
};

const checkGempa = async (conn, db) => {
  global.db.list().bots ||= {};
  global.db.list().chats ||= {};

  try {
    const { data } = await axios.get('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
    const gempa = data?.Infogempa?.gempa;
    if (!gempa) return;

    if (gempa.DateTime === global.db.list().bots.gempaDateTime) return;

    console.log('[Scheduler] Gempa baru terdeteksi:', gempa.DateTime);
    global.db.list().bots.gempaDateTime = gempa.DateTime;

    const activeGroups = Object.entries(global.db.list().chats || {})
      .filter(([id, chat]) => chat.notifgempa && id.endsWith('@g.us'));

    if (activeGroups.length === 0) return;

    const caption = `*INFO GEMPA TERBARU (BMKG)*

📅 *Tanggal:* ${gempa.Tanggal}
⏰ *Waktu:* ${gempa.Jam}
📈 *Magnitudo:* ${gempa.Magnitude}
🌊 *Kedalaman:* ${gempa.Kedalaman}
📍 *Lokasi:* ${gempa.Lintang}, ${gempa.Bujur}
🌐 *Wilayah:* ${gempa.Wilayah}
⚠️ *Potensi:* ${gempa.Potensi}
🗣️ *Dirasakan:* ${gempa.Dirasakan || "Tidak ada data"}`;

    const imageUrl = `https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}`;

    for (const [gid] of activeGroups) {
      await conn.sendMessage(gid, {
        image: { url: imageUrl },
        caption
      });
    }

    await db.save();
  } catch (e) {
    console.error('[Scheduler] Error pada checkGempa:', e);
  }
};

const checkAnimeNews = async (conn, db) => {
    global.db.list().bots ||= {};
    global.db.list().chats ||= {};
    
    try {
        // Gunakan scraper anime terbaru
        const animeList = await scrapeAnimeTerbaru();
        if (!animeList || animeList.length === 0) {
            console.log('[Scheduler] Tidak ada anime baru ditemukan');
            return;
        }
        
        const latestAnime = animeList[0];
        
        // Cek apakah anime ini sudah dikirim sebelumnya
        if (latestAnime.id === global.db.list().bots.latestAnimeNewsLink) {
            console.log('[Scheduler] Anime sudah dikirim sebelumnya:', latestAnime.title);
            return;
        }

        console.log('[Scheduler] Anime baru terdeteksi:', latestAnime.title);
        global.db.list().bots.latestAnimeNewsLink = latestAnime.id;
        
        // Cari grup yang aktif untuk anime news
        const activeGroups = Object.entries(global.db.list().chats || {})
            .filter(([id, chat]) => chat.animenews && id.endsWith('@g.us'));
        
        if (activeGroups.length === 0) {
            console.log('[Scheduler] Tidak ada grup aktif untuk anime news');
            return;
        }
        
        console.log(`[Scheduler] Mengirim ke ${activeGroups.length} grup`);
        
        // Validasi URL gambar
        let imageUrl = latestAnime.image;
        if (imageUrl && imageUrl.startsWith('https://otakotaku.comhttps://')) {
            // Perbaiki URL yang salah format
            imageUrl = imageUrl.replace('https://otakotaku.comhttps://', 'https://');
        }
        
        // Validasi URL anime
        let animeUrl = latestAnime.url;
        if (animeUrl && animeUrl.startsWith('https://otakotaku.comhttps://')) {
            animeUrl = animeUrl.replace('https://otakotaku.comhttps://', 'https://');
        }
        
        // Buat caption untuk broadcast
        const caption = `🎬 *ANIME TERBARU UPDATE*

*${latestAnime.title}*

📖 *Sinopsis:*
${latestAnime.sinopsis.substring(0, 200)}${latestAnime.sinopsis.length > 200 ? '...' : ''}

📺 *Tipe:* ${latestAnime.tipe}
🎞️ *Episodes:* ${latestAnime.episodes}
🗓️ *Musim:* ${latestAnime.musim}
🔗 *Info Lengkap:* ${animeUrl}

_Update otomatis dari OtakOtaku_`;
        
        // Broadcast ke semua grup aktif dengan error handling
        let successCount = 0;
        let failCount = 0;
        
        for (const [gid, chat] of activeGroups) {
            try {
                const messageOptions = {};
                
                // Tambahkan gambar jika URL valid
                if (imageUrl && imageUrl.startsWith('http')) {
                    messageOptions.image = { url: imageUrl };
                }
                
                messageOptions.caption = caption;
                
                await conn.sendMessage(gid, messageOptions);
                console.log(`[Scheduler] ✅ Berhasil mengirim ke ${gid}`);
                successCount++;
                
                // Delay antar pesan untuk menghindari spam
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (groupError) {
                console.error(`[Scheduler] ❌ Gagal mengirim ke ${gid}:`, groupError.message);
                failCount++;
                
                // Jika error forbidden, nonaktifkan anime news di grup tersebut
                if (groupError.message.includes('forbidden') || groupError.message.includes('not authorized')) {
                    console.log(`[Scheduler] ⚠️ Menonaktifkan anime news untuk ${gid} (forbidden)`);
                    if (global.db.list().chats[gid]) {
                        global.db.list().chats[gid].animenews = false;
                    }
                }
            }
        }
        
        console.log(`[Scheduler] 📊 Ringkasan: ${successCount} berhasil, ${failCount} gagal`);
        
        // Simpan database hanya jika ada perubahan
        if (db && typeof db.save === 'function') {
            await db.save();
            console.log('[Scheduler] 💾 Database disimpan');
        } else {
            console.log('[Scheduler] ⚠️ Database save tidak tersedia');
        }
        
    } catch (e) {
        console.error('[Scheduler] ❌ Error pada checkAnimeNews:', e.message);
        console.error('[Scheduler] Stack trace:', e.stack);
    }
};

const checkOtakuNews = async (conn, db) => {
global.db.list().bots ||= {};
global.db.list().chats ||= {};
    try {
        const { data } = await axios.get('https://otakudesu.cloud/ongoing-anime/');
        const $ = cheerio.load(data);
        
        const ongoingList = [];
        $('.venz ul li').each((index, element) => {
            ongoingList.push({
                title: $(element).find('.jdlflm').text().trim(),
                link: $(element).find('.thumb a').attr('href')
            });
        });

        if (ongoingList.length === 0) return;

        const latestAnime = ongoingList[0];
        if (latestAnime.link === global.db.list().bots.latestOtakuLink) return;

        console.log('[Scheduler] Rilisan Otakudesu baru terdeteksi:', latestAnime.title);
        global.db.list().bots.latestOtakuLink = latestAnime.link;
        
        const activeGroups = Object.entries(global.db.list().chats || {})
            .filter(([id, chat]) => chat.otakunews && id.endsWith('@g.us'));

        if (activeGroups.length === 0) return;

        const { data: detailHtml } = await axios.get(latestAnime.link);
        const $$ = cheerio.load(detailHtml);

        const detail = {
            title: $$('#venkonten > div.venser > div.jdlrx > h1').text(),
            thumbnail: $$('.fotoanime > img').attr("src"),
            genre: $$('#venkonten > div.venser > div.fotoanime > div.infozin > div > p:nth-child(11) > span').text().replace('Genre: ', ''),
            synopsis: $$('#venkonten > div.venser > div.fotoanime > div.sinopc > p').text().trim().substring(0, 200) + '...'
        };
        
        const caption = `*OTAKUDESU ONGOING UPDATE*

*${detail.title}*

*Genre:* ${detail.genre}

*Sinopsis:*
${detail.synopsis}

🔗 *Link:* ${latestAnime.link}`;

        for (const [gid, chat] of activeGroups) {
            await conn.sendMessage(gid, {
                image: { url: detail.thumbnail },
                caption: caption
            });
        }
        await db.save();
    } catch (e) {
        console.error('[Scheduler] Error pada checkOtakuNews:', e);
    }
};

module.exports = {
    initializeScheduler,
    checkAdzan,
    checkGempa,
    checkAnimeNews,
    checkOtakuNews,
    scrapeAnimeTerbaru // Export tambahan untuk keperluan lain
};