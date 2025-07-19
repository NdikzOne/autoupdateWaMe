const axios = require("axios");
const handler = async (m, {
    conn,
    text,
    args,
    usedPrefix,
    command,
    cmd,
    isOwner,
    db,
    groupMetadata
}) => {
    if (!text) throw `Use example ${usedPrefix}${command} semarang`
    // Kota yang Anda inginkan untuk mendapatkan jadwal shalatnya
const cityName = text;

// API endpoint untuk mendapatkan jadwal shalat dari MuslimSalat.com
const apiUrl = `http://api.aladhan.com/v1/timingsByCity?city=${cityName}&country=Indonesia&method=2`;

// Kirim permintaan GET ke API untuk mendapatkan jadwal shalat
let chan = await axios.get(apiUrl)
    const data = chan.data.data;

    // Jadwal shalat berdasarkan waktu lokal
    const timings = data.timings;
let jadwalnya = `Jadwal Shalat di *${cityName}*:
Subuh: ${timings.Fajr}
Imsak: ${timings.Imsak}
Dzuhur: ${timings.Dhuhr}
Ashar: ${timings.Asr}
Maghrib: ${timings.Maghrib}
Isya: ${timings.Isha}

*" Siapa saja yang menjaga salat, maka dia akan mendapatkan cahaya, petunjuk, dan keselamatan pada hari kiamat. "*
`
m.reply(jadwalnya)
    console.log(`Jadwal Shalat di ${cityName}:`);
    console.log(`Subuh: ${timings.Fajr}`);
    console.log(`Terbit Matahari: ${timings.Sunrise}`);
    console.log(`Dzuhur: ${timings.Dhuhr}`);
    console.log(`Ashar: ${timings.Asr}`);
    console.log(`Maghrib: ${timings.Maghrib}`);
    console.log(`Isya: ${timings.Isha}`);
}

handler.command = ['jadwalsalat'];
handler.category = 'islami';
handler.description = 'jadwalsalat [Kota].';

module.exports = handler;
