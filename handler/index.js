const { jidDecode } = require("baileys");
const env = require("../settings.js");
const util = require("util");
const Func = require("../core/function.js");
const caseHandler = require("../case.js");
const { incrementCommand } = require("../core/stats");
const isNumber = x => typeof x === 'number' && !isNaN(x)

// Helper untuk membersihkan JID
const decodeJid = (jid) => {
  if (!jid) return jid;
  try {
    const decode = jidDecode(jid);
    return decode?.user && decode?.server ? decode.user + "@" + decode.server : jid;
  } catch {
    return jid;
  }
};

// Helper untuk escape regex
function escapeRegExp(string) {
  return string.replace(/[.*=+:\-?^${}()|[\]\\]|\s/g, "\\$&");
}

/**
 * Handler utama untuk memproses semua pesan yang masuk.
 * @param {object} m Objek pesan yang sudah diserialisasi.
 * @param {object} conn Objek koneksi Baileys.
 * @param {object} store Objek store untuk metadata.
 * @param {object} db Objek database.
 * @param {object} cmd Objek plugins yang sudah dimuat.
 */
module.exports = async (m, conn, store, db, cmd) => {
  // --- Inisialisasi Data & Variabel ---
  await db.main(m); // Pastikan data user/grup ada
  m.chat = m.chat || m.key?.remoteJid || m.from;

  const user = db.get("user", m.jid) || {};
    if (typeof user !== 'object') db.list().user[m.sender] = {}
                if (user) {
                    if (!isNumber(user.exp)) user.exp = 0
                    if (!isNumber(user.limit)) user.limit = 50
                    if (!isNumber(user.joinlimit)) user.joinlimit = 1
                    if (!isNumber(user.money)) user.money = 100000
                    if (!isNumber(user.bank)) user.bank = 100000
                    if (!isNumber(user.lastclaim)) user.lastclaim = 0
                    if (!('registered' in user)) user.registered = false
                    if (!user.registered) {
                        if (!('name' in user)) user.name = m.name
                        if (!isNumber(user.age)) user.age = -1
                        if (!isNumber(user.regTime)) user.regTime = -1
                    }
                    if (!('pasangan' in user)) user.pasangan = ''
                    if (!('banned' in user)) user.banned = false
                    if (!('jadibot' in user)) user.jadibot = false
                    if (!('premium' in user)) user.premium = false
                    if (!('created' in user)) user.created = false
                    if (!isNumber(user.premiumDate)) user.premiumDate = 0
                    if (!isNumber(user.jadibotDate)) user.jadibotDate = 0
                    if (!isNumber(user.bannedDate)) user.bannedDate = 0
                    if (!isNumber(user.warn)) user.warn = 0
                    if (!isNumber(user.level)) user.level = 0
                    if (!('role' in user)) user.role = 'Beginner'
                    if (!('autolevelup' in user)) user.autolevelup = true

                    if (!isNumber(user.health)) user.health = 100
                    if (!isNumber(user.healtmonster)) user.healtmonster = 100
                    if (!isNumber(user.armormonster)) user.armormonster = 0
                    if (!isNumber(user.potion)) user.potion = 0
                    if (!isNumber(user.tiketcoin)) user.tiketcoin = 0
                    if (!isNumber(user.healtmonster)) user.healtmonster = 0
                    if (!isNumber(user.pc)) user.pc = 0
                    if (!isNumber(user.spammer)) user.spammer = 0
                    if (!isNumber(user.limitspam)) user.limitspam = 0
                    if (!isNumber(user.expg)) user.expg = 0
                    if (!isNumber(user.trash)) user.trash = 0
                    if (!isNumber(user.sampah)) user.sampah = 0
                    if (!isNumber(user.wood)) user.wood = 0
                    if (!isNumber(user.rock)) user.rock = 0
                    if (!isNumber(user.string)) user.string = 0
                    if (!isNumber(user.petFood)) user.petFood = 0

                    if (!isNumber(user.emerald)) user.emerald = 0
                    if (!isNumber(user.diamond)) user.diamond = 0
                    if (!isNumber(user.berlian)) user.berlian = 0
                    if (!isNumber(user.emas)) user.emas = 0
                    if (!isNumber(user.gold)) user.gold = 0
                    if (!isNumber(user.iron)) user.iron = 0
                    if (!isNumber(user.string)) user.string = 0
                    
                    if (!isNumber(user.anggur)) user.anggur = 0
                    if (!isNumber(user.jeruk)) user.jeruk = 0
                    if (!isNumber(user.mangga)) user.mangga = 0
                    if (!isNumber(user.apel)) user.apel = 0
                    if (!isNumber(user.pisang)) user.pisang = 0
                    if (!isNumber(user.bibitanggur)) user.bibitanggur = 0
                    if (!isNumber(user.bibitjeruk)) user.bibitjeruk = 0
                    if (!isNumber(user.bibitmangga)) user.bibitmangga = 0
                    if (!isNumber(user.bibitapel)) user.bibitapel = 0
                    if (!isNumber(user.bibitpisang)) user.bibitpisang = 0
                    if (!isNumber(user.gardenboxs)) user.gardenboxs = 0
                    
                    // RPG Ndikz
                    if (!isNumber(user.banteng)) user.banteng = 0
                    if (!isNumber(user.harimau)) user.harimau = 0
                    if (!isNumber(user.gajah)) user.gajah = 0
                    if (!isNumber(user.kambing)) user.kambing = 0
                    if (!isNumber(user.panda)) user.panda = 0
                    if (!isNumber(user.buaya)) user.buaya = 0
                    if (!isNumber(user.kerbau)) user.kerbau = 0
                    if (!isNumber(user.sapi)) user.sapi = 0
                    if (!isNumber(user.monyet)) user.monyet = 0
                    if (!isNumber(user.babihutan)) user.babihutan = 0
                    if (!isNumber(user.babi)) user.babi = 0
                    if (!isNumber(user.ayam)) user.ayam = 0
                    // RPG Ndikz
                    
                    if (!isNumber(user.botol)) user.botol = 0
                    if (!isNumber(user.kardus)) user.kardus = 0
                    if (!isNumber(user.kaleng)) user.kaleng = 0
                    if (!isNumber(user.aqua)) user.aqua = 0
                    if (!isNumber(user.kayu)) user.kayu = 0
                    if (!isNumber(user.batu)) user.batu = 0
                    if (!isNumber(user.kapak)) user.kapak = 0

                    if (!isNumber(user.common)) user.common = 0
                    if (!isNumber(user.cupon)) user.cupon = 0
                    if (!isNumber(user.boxs)) user.boxs = 0
                    if (!isNumber(user.uncommon)) user.uncommon = 0
                    if (!isNumber(user.mythic)) user.mythic = 0
                    if (!isNumber(user.legendary)) user.legendary = 0
                    if (!isNumber(user.pet)) user.pet = 0
                    if (!isNumber(user.ramuan)) user.ramuan = 0
                    
                    if (!isNumber(user.lastramuanclaim)) user.lastramuanclaim = 0
                    if (!isNumber(user.lastpotionclaim)) user.lastpotionclaim = 0
                    if (!isNumber(user.laststringclaim)) user.laststringclaim = 0
                    if (!isNumber(user.lastswordclaim)) user.lastswordclaim = 0
                    if (!isNumber(user.lastsironclaim)) user.lastsironclaim = 0
                    if (!isNumber(user.lastweaponclaim)) user.lastweaponclaim = 0
                    if (!isNumber(user.lastsmancingclaim)) user.lastsmancingclaim = 0
                    
                    if (!isNumber(user.ramuannagalast)) user.ramuannagalast = 0
                    if (!isNumber(user.ramuanrubahlast)) user.ramuanrubahlast = 0
                    if (!isNumber(user.ramuankucinglast)) user.ramuankucinglast = 0
                    if (!isNumber(user.ramuanserigalalast)) user.ramuanserigalalast = 0
                    if (!isNumber(user.ramuangriffinlast)) user.ramuangriffinlast = 0
                    if (!isNumber(user.ramuanphonixlast)) user.ramuanphonixlast = 0
                    if (!isNumber(user.ramuancentaurlast)) user.ramuancentaurlast = 0
                    if (!isNumber(user.ramuankudalast)) user.ramuankudalast = 0
                    if (!isNumber(user.ramuankyubilast)) user.ramuankyubilast = 0
                    if (!isNumber(user.ramuanherolast)) user.ramuanherolast = 0
                    
                    if (!isNumber(user.hero)) user.hero = 1
                    if (!isNumber(user.exphero)) user.exphero = 0
                    if (!isNumber(user.pillhero)) user.pillhero= 0
                    if (!isNumber(user.herolastclaim)) user.herolastclaim = 0
                    
                    if (!isNumber(user.paus)) user.paus = 0
                    if (!isNumber(user.kepiting)) user.kepiting = 0
                    if (!isNumber(user.cumi)) user.cumi = 0
                    if (!isNumber(user.gurita)) user.gurita = 0
                    if (!isNumber(user.buntal)) user.buntal = 0
                    if (!isNumber(user.dory)) user.dory = 0
                    if (!isNumber(user.lobster)) user.lobster = 0
                    if (!isNumber(user.lumba)) user.lumba = 0
                    if (!isNumber(user.hiu)) user.hiu = 0
                    if (!isNumber(user.ikan)) user.ikan = 0
                    if (!isNumber(user.udang)) user.udang = 0
                    if (!isNumber(user.orca)) user.orca = 0
                    if (!isNumber(user.umpan)) user.umpan = 0
                    if (!isNumber(user.pancingan)) user.pancingan = 1
                    if (!isNumber(user.anakpancingan)) user.anakpancingan = 0
                    if (!isNumber(user.lastmancingeasy)) user.lastmancingeasy = 0
                    if (!isNumber(user.lastmancingnormal)) user.lastmancingnormal = 0
                    if (!isNumber(user.lastmancinghard)) user.lastmancinghard = 0
                    if (!isNumber(user.lastmancingextreme)) user.lastmancingextreme = 0
                    
                    if (!isNumber(user.kucing)) user.kucing = 0
                    if (!isNumber(user.kucinglastclaim)) user.kucinglastclaim = 0
                    if (!isNumber(user.kuda)) user.kuda = 0
                    if (!isNumber(user.kudalastclaim)) user.kudalastclaim = 0
                    if (!isNumber(user.rubah)) user.rubah = 0
                    if (!isNumber(user.rubahlastclaim)) user.rubahlastclaim = 0
                    if (!isNumber(user.anjing)) user.anjing = 0
                    if (!isNumber(user.anjinglastclaim)) user.anjinglastclaim = 0
                    if (!isNumber(user.serigala)) user.serigala = 0
                    if (!isNumber(user.serigalalastclaim)) user.serigalalastclaim = 0
                    if (!isNumber(user.naga)) user.naga = 0
                    if (!isNumber(user.nagalastclaim)) user.nagalastclaim = 0
                    if (!isNumber(user.phonix)) user.phonix = 0
                    if (!isNumber(user.phonixlastclaim)) user.phonixlastclaim = 0
                    if (!isNumber(user.kyubi)) user.kyubi = 0
                    if (!isNumber(user.kyubilastclaim)) user.kyubilastclaim = 0
                    if (!isNumber(user.griffin)) user.griffin = 0
                    if (!isNumber(user.griffinlastclaim)) user.griffinlastclaim = 0
                    if (!isNumber(user.centaur)) user.centaur = 0
                    if (!isNumber(user.centaurlastclaim)) user.centaurlastclaim = 0
                    
                    if (!isNumber(user.anakkucing)) user.anakkucing = 0
                    if (!isNumber(user.anakkuda)) user.anakkuda = 0
                    if (!isNumber(user.anakrubah)) user.anakrubah = 0
                    if (!isNumber(user.anakanjing)) user.anakanjing = 0
                    if (!isNumber(user.anakserigala)) user.anakserigala = 0
                    if (!isNumber(user.anaknaga)) user.anaknaga = 0
                    if (!isNumber(user.anakphonix)) user.anakphonix = 0
                    if (!isNumber(user.anakkyubi)) user.anakkyubi = 0
                    if (!isNumber(user.anakgriffin)) user.anakgriffin = 0
                    if (!isNumber(user.anakcentaur)) user.anakcentaur = 0
                    
                    if (!isNumber(user.makananpet)) user.makananpet = 0 
                    if (!isNumber(user.makanannaga)) user.makanannaga = 0
                    if (!isNumber(user.makananphonix)) user.makananphonix = 0
                    if (!isNumber(user.makanangriffin)) user.makanangriffin = 0
                    if (!isNumber(user.makanankyubi)) user.makanankyubi = 0
                    if (!isNumber(user.makanancentaur)) user.makanancentaur = 0

                    if (!isNumber(user.horse)) user.horse = 0
                    if (!isNumber(user.horseexp)) user.horseexp = 0
                    if (!isNumber(user.cat)) user.cat = 0
                    if (!isNumber(user.catexp)) user.catexp = 0
                    if (!isNumber(user.fox)) user.fox = 0
                    if (!isNumber(user.foxhexp)) user.foxexp = 0
                    if (!isNumber(user.dog)) user.dog = 0
                    if (!isNumber(user.dogexp)) user.dogexp = 0

                    if (!isNumber(user.horselastfeed)) user.horselastfeed = 0
                    if (!isNumber(user.catlastfeed)) user.catlastfeed = 0
                    if (!isNumber(user.foxlastfeed)) user.foxlastfeed = 0
                    if (!isNumber(user.doglastfeed)) user.doglastfeed = 0

                    if (!isNumber(user.armor)) user.armor = 0
                    if (!isNumber(user.armordurability)) user.armordurability = 0
                    if (!isNumber(user.weapon)) user.weapon = 0
                    if (!isNumber(user.weapondurability)) user.weapondurability = 0
                    if (!isNumber(user.sword)) user.sword = 0
                    if (!isNumber(user.sworddurability)) user.sworddurability = 0
                    if (!isNumber(user.pickaxe)) user.pickaxe = 0
                    if (!isNumber(user.pickaxedurability)) user.pickaxedurability = 0
                    if (!isNumber(user.fishingrod)) user.fishingrod = 0
                    if (!isNumber(user.fishingroddurability)) user.fishingroddurability = 0
                    
                    if (!isNumber(user.kerjasatu)) user.kerjasatu = 0
                    if (!isNumber(user.kerjadua)) user.kerjadua = 0
                    if (!isNumber(user.kerjatiga)) user.kerjatiga = 0
                    if (!isNumber(user.kerjaempat)) user.kerjaempat = 0
                    if (!isNumber(user.kerjalima)) user.kerjalima = 0
                    if (!isNumber(user.kerjaenam)) user.kerjaenam = 0
                    if (!isNumber(user.kerjatujuh)) user.kerjatujuh = 0
                    if (!isNumber(user.kerjadelapan)) user.kerjadelapan = 0
                    if (!isNumber(user.kerjasembilan)) user.kerjasembilan = 0
                    if (!isNumber(user.kerjasepuluh)) user.kerjasepuluh = 0
                    if (!isNumber(user.kerjasebelas)) user.kerjasebelas = 0
                    if (!isNumber(user.kerjaduabelas)) user.kerjaduabelas = 0
                    if (!isNumber(user.kerjatigabelas)) user.kerjatigabelas = 0
                    if (!isNumber(user.kerjaempatbelas)) user.kerjaempatbelas = 0
                    if (!isNumber(user.kerjalimabelas)) user.kerjalimabelas = 0
                    if (!isNumber(user.kerjaenambelas)) user.kerjaenambelas = 0
                    if (!isNumber(user.kerjatujuhbelas)) user.kerjatujuhbelas = 0
                    if (!isNumber(user.kerjadelapanbelas)) user.kerjadelapanbelas = 0
                    if (!isNumber(user.kerjasembilanbelas)) user.kerjasembilanbelas = 0
                    if (!isNumber(user.kerjaduapuluh)) user.kerjaduapuluh = 0
                    if (!isNumber(user.kerjaduasatu)) user.kerjaduasatu = 0
                    if (!isNumber(user.kerjaduadua)) user.kerjaduadua = 0
                    if (!isNumber(user.kerjaduatiga)) user.kerjaduatiga = 0
                    if (!isNumber(user.kerjaduaempat)) user.kerjaduaempat = 0
                    if (!isNumber(user.kerjadualima)) user.kerjadualima = 0
                    if (!isNumber(user.kerjaduaenam)) user.kerjaduaenam = 0
                    if (!isNumber(user.kerjaduatujuh)) user.kerjaduatujuh = 0
                    if (!isNumber(user.kerjaduadelapan)) user.kerjaduadelapan = 0
                    if (!isNumber(user.kerjaduasembilan)) user.kerjaduasembilan = 0
                    if (!isNumber(user.kerjatigapuluh)) user.kerjatigapuluh = 0
                    
                    // Ndikz
                    if (!isNumber(user.saldo)) user.saldo = 100
                    if (!isNumber(user.warning)) user.warning = 0
          
                    if (!isNumber(user.judilast)) user.judilast = 0
                    if (!isNumber(user.lastberburu)) user.lastberburu = 0
                    if (!isNumber(user.reglast)) user.reglast = 0
                    if (!isNumber(user.unreglast)) user.unreglast = 0
                    if (!isNumber(user.snlast)) user.snlast = 0
                    if (!isNumber(user.spinlast)) user.spinlast = 0
                    
                    if (!isNumber(user.lastwarpet)) user.lastwarpet = 0
                    if (!isNumber(user.lastpekerjaan)) user.lastpekerjaan = 0
                    if (!isNumber(user.lastclaim)) user.lastclaim = 0
                    if (!isNumber(user.lastbobol)) user.lastbobol = 0
                    if (!isNumber(user.lastadventure)) user.lastadventure = 0
                    if (!isNumber(user.lastfishing)) user.lastfishing = 0
                    if (!isNumber(user.lastdungeon)) user.lastdungeon = 0
                    if (!isNumber(user.lastcrusade)) user.lastcrusade = 0
                    if (!isNumber(user.lastduel)) user.lastduel = 0
                    if (!isNumber(user.lastcode)) user.lastcode = 0
                    if (!isNumber(user.lastlink)) user.lastlink = 0
                    if (!isNumber(user.lastrob)) user.lastrob = 0
                    if (!isNumber(user.lastopen)) user.lastopen = 0
                    if (!isNumber(user.lasteasy)) user.lasteasy = 0
                    if (!isNumber(user.lastnambang)) user.lastnambang = 0
                    if (!isNumber(user.lastbunuhi)) user.lastbunuhi = 0
                    if (!isNumber(user.lastmining)) user.lastmining = 0
                    if (!isNumber(user.lasthunt)) user.lasthunt = 0
                    if (!isNumber(user.lastweekly)) user.lastweekly = 0
                    if (!isNumber(user.lastmonthly)) user.lastmonthly = 0
                    if (!isNumber(user.lastmulung)) user.lastmulung = 0
                    if (!isNumber(user.lastdagang)) user.lastdagang = 0
                    if (!isNumber(user.lastbisnis)) user.lastbisnis = 0
                    if (!isNumber(user.lastnebang)) user.lastnebang = 0
                    if (!isNumber(user.lastberkebon))user.lastberkebon = 0
                    if (!isNumber(user.lastadventure)) user.lastadventure = 0
                    if (!isNumber(user.lastlawan)) user.lastlawan = 0
                    if (!isNumber(user.lastlatih)) user.lastlatih = 0
                } else db.list().user[m.sender] = {
                    exp: 0,
                    limit: 50,
                    joinlimit: 1,
                    spammer: 0,
                    limitspam: 0,
                    money: 10000,
                    bank: 10000,
                    health: 100,
                    tiketcoin: 0,
                    healtmonster: 100,
                    armormonster: 0,
                    lastclaim: 0,
                    lastbobol: 0,
                    registered: false,
                    name: m.name,
                    age: -1,
                    regTime: -1,
                    pasangan: '',
                    banned: false,
                    premium: false,
                    jadibot: false,
                    created: false,
                    warn: 0,
                    pc: 0,
                    expg: 0,
                    level: 0,
                    role: 'Beginner',
                    autolevelup: true,

                    potion: 10,
                    trash: 0,
                    sampah: 0,
                    wood: 0,
                    rock: 0,
                    string: 0,

                    emerald: 0,
                    diamond: 0,
                    berlian: 0,
                    emas: 0,
                    gold: 0,
                    iron: 0,
                    
                    pisang: 0,
                    anggur: 0,
                    mangga: 0,
                    jeruk: 0,
                    apel: 0,
                    bibitpisang: 0,
                    bibitanggur: 0,
                    bibitmangga: 0,
                    bibitjeruk: 0,
                    bibitapel: 0,
                    gardenboxs: 0,
                    
                    botol: 0,
                    kardus: 0,
                    kaleng: 0,
                    aqua: 0,
                    kayu: 0,
                    batu: 0,
                    kapak: 0,

                    cupon: 0,
                    boxs: 0,
                    common: 0,
                    uncommon: 0,
                    mythic: 0,
                    legendary: 0,
                    pet: 0,
                    ramuan: 0,
                    
                    ramuannagalast: 0,
                    ramuankyubilast: 0,
                    ramuanphonixlast: 0,
                    ramuanserigalalast: 0,
                    ramuancentaurlast: 0,
                    ramuankudalast: 0,
                    ramuankucinglast: 0,
                    ramuanrubahlast: 0,
                    ramuangriffinlast: 0,
                    ramuanherolast: 0,

                    horse: 0,
                    horseexp: 0,
                    cat: 0,
                    catngexp: 0,
                    fox: 0,
                    foxexp: 0,
                    dog: 0,
                    dogexp: 0,
                    
                    hero: 1,
                    exphero: 0,
                    pillhero: 0,
                    herolastclaim: 0,
                    
                    udang: 0,
                    hiu: 0,
                    lobster: 0,
                    kumba: 0,
                    ikan: 0,
                    buntal: 0,
                    gurita: 0,
                    dory: 0,
                    cumi: 0,
                    kepiting: 0,
                    paus: 0,
                    orca: 0,
                    umpan: 0,
                    pancingan: 1,
                    anakpancingan: 0,
                    
                    anakkucing: 0,
                    anakkuda: 0,
                    anakrubah: 0,
                    anakanjing: 0,
                    anakserigala: 0,
                    anaknaga: 0,
                    anakphonix: 0,
                    anakkyubi: 0,
                    anakgriffin: 0,
                    anakcentaur: 0,
                    
                    kucing: 0,
                    kucinglastclaim: 0,
                    kuda: 0,
                    kudalastclaim: 0,
                    rubah: 0,
                    rubahlastclaim: 0,
                    serigala: 0,
                    serigalalastclaim: 0,
                    naga: 0,
                    nagalastclaim: 0,
                    phonix: 0,
                    phonixlastclaim: 0,
                    anjing: 0,
                    anjinglastclaim: 0,
                    kyubi: 0,
                    kyubilastclaim: 0,
                    griffin: 0,
                    griffinlastclaim: 0,
                    centaur: 0,
                    centaurlastclaim: 0,
                    
                    makananpet: 0,
                    makananphonix: 0,
                    makanannaga: 0,
                    makanangriffin: 0,
                    makanankyubi: 0,
                    makanancentaur: 0,

                    horselastfeed: 0,
                    catlastfeed: 0,
                    foxlastfeed: 0,
                    doglastfeed: 0,

                    armor: 0,
                    armordurability: 0,
                    weapon: 0,
                    weapondurability: 0,
                    sword: 0,
                    sworddurability: 0,
                    pickaxe: 0,
                    pickaxedurability: 0,
                    fishingrod: 0,
                    fishingroddurability: 0,
                    
                    judilast: 0,
                    reglast: 0,
                    unreglast: 0,
                    snlast: 0,
                    spinlast: 0,
                    
                    kerjasatu: 0,
                    kerjadua: 0,
                    kerjatiga: 0,
                    kerjaempat: 0,
                    kerjalima: 0,
                    kerjaenam: 0,
                    kerjatujuh: 0,
                    kerjadelapan: 0,
                    kerjasembilan: 0,
                    kerjasepuluh: 0,
                    kerjasebelas: 0,
                    kerjaduabelas: 0,
                    kerjatigabelas: 0,
                    kerjaempatbelas: 0,
                    kerjalimabelas: 0,
                    kerjaenambelas: 0,
                    kerjatujuhbelas: 0,
                    kerjadelapanbelas: 0,
                    kerjasembilanbelas: 0,
                    kerjaduapuluh: 0,
                    kerjaduasatu: 0,
                    kerjaduadua: 0,
                    kerjaduatiga: 0,
                    kerjaduaempat: 0,
                    kerjadualima: 0,
                    kerjaduaenam: 0,
                    kerjaduatujuh: 0,
                    kerjaduadelapan: 0,
                    kerjaduasembilan: 0,
                    kerjatigapuluh: 0, 
                    
                    lastramuanclaim: 0,
                    lastpotionclaim: 0,
                    laststringclaim: 0,
                    lastswordclaim: 0,
                    lastweaponclaim: 0,
                    lastsironclaim: 0,
                    lastsmancingclaim: 0,
                    
                    lastmancingeasy: 0,
                    lastmancingnormal: 0,
                    lastmancinghard: 0,
                    lastmancingextreme: 0,
                    lastwarpet: 0,
                    lastpekerjaan: 0,
                    lastclaim: 0,
                    lastadventure: 0,
                    lastfishing: 0,
                    lastdungeon: 0,
                    lastcrusade: 0,
                    lastduel: 0,
                    lastcode: 0,
                    lastlink: 0,
                    lastnambang: 0,
                    lastmining: 0,
                    lasthunt: 0,
                    lastweekly: 0,
                    lastmonthly: 0,
                    lastrob: 0,
                    lastbunuhi: 0,
                    lastopen: 0,
                    lasteasy: 0,
                    lastmulung: 0,
                    lastdagang: 0,
                    lastbisnis: 0,
                    lastnebang: 0,
                    lastberkebon: 0,
                    lastadventure: 0,
                    lastlawan: 0,
                    lastlatih: 0,
                }
    user.exp += 5;
  const group = db.get("group", m.from) || {};
  const settings = db.list().settings || {};
  const ownerList = db.list().owner || [];

  // --- Penentuan Hak Akses ---
  const isOwner = [
    ...env.owner.map((a) => a + "@s.whatsapp.net"),
    ...ownerList,
    decodeJid(conn.user.id),
  ].includes(m.jid);
  const isPremium = user.premium?.status || isOwner;
  const groupMetadata = m.isGroup ? m.metadata : {};
  const isAdmin = m.isGroup ? groupMetadata.participants.find(p => p.jid === m.sender)?.admin?.endsWith('admin') || false : false;
  const isBotAdmin = m.isGroup ? groupMetadata.participants.find(p => p.jid === decodeJid(conn.user.id))?.admin?.endsWith('admin') || false : false;

  // --- Parsing Perintah ---
  const prefix = /^[°•π÷×¶∆£¢€¥®™+✓=|/~!?@#%^&.©^]/.test(m.text) ? m.text.match(/^[°•π÷×¶∆£¢€¥®™+✓=|/~!?@#%^&.©^]/gi)[0] : "";
  const command = m.text && prefix ? m.text.replace(prefix, "").trim().split(/ +/).shift().toLowerCase() : "";
  const text = m.text && prefix ? m.text.replace(new RegExp("^" + escapeRegExp(prefix + command), "i"), "").trim() : "";
  const args = text.split(/ +/).filter(a => a);

  // --- Logika Penanganan ---
  if (settings.self && !isOwner) return;
  if (settings.online) {
    conn.readMessages([m.key]);
  }

  // --- Penanganan Sesi Interaktif (DIPERBAIKI) ---
  if (m.quoted && m.sender) {
    const sessionKey = `${m.from}:${m.sender}`; 
    const session = global.interactiveSessions.get(sessionKey);

    if (session && session.messageId === m.quoted.id) {
      try {
        await session.callback(m);
        global.interactiveSessions.delete(sessionKey);
      } catch (e) {
        m.reply("Terjadi kesalahan saat memproses balasan Anda.");
        console.error("Interactive Session Error:", e);
      }
      return;
    }
  }

  // --- Panggil Case Handler ---
  await caseHandler(m, { conn, isOwner, prefix, command, text, user, db, Func, cmd });

  // --- Eksekusi Semua Handler dalam Satu Loop ---
  const context = {
    conn,
    text,
    args,
    isOwner,
    isPremium,
    isAdmin,
    isBotAdmin,
    user,
    group,
    settings,
    groupMetadata,
    db,
    Func,
    store,
    usedPrefix: prefix,
    command
  };

  // Loop melalui semua plugin sekali saja
  for (let handler of Object.values(cmd.plugins)) {
    if (typeof handler !== 'object' && typeof handler !== 'function') continue;
    
    try {
      // 1. Jalankan handler.before jika ada (untuk SEMUA plugin)
      if (typeof handler.before === 'function') {
        const stop = await handler.before(m, context);
        if (stop === true) {
          console.log(`Plugin ${handler.command || 'unknown'} menghentikan proses via before`);
          return; // Hentikan SEMUA pemrosesan
        }
      }

      // 2. Jalankan handler.all jika ada (untuk SEMUA plugin)
      if (typeof handler.all === 'function') {
        await handler.all(m, context);
      }

      // 3. Jalankan handler.onMessage jika ada (untuk SEMUA plugin)
      if (typeof handler.onMessage === 'function') {
        await handler.onMessage(m, context);
      }

      // 4. Cek apakah ini command yang sesuai
      const isCmd = handler.command && Array.isArray(handler.command) && 
                    handler.command.includes(command);
      
      if (isCmd) {
        incrementCommand(command);
        
        // --- Validasi Aturan Plugin ---
        if (handler.owner && !isOwner) {
          m.reply("Perintah ini hanya untuk Owner Bot.");
          continue; // Lanjut ke plugin berikutnya
        }
        if (handler.premium && !isPremium) {
          conn.sendMessage(m.chat, { react: { text: `✖️`, key: m.key }});
          continue;
        }
        if (handler.group && !m.isGroup) {
          m.reply("Perintah ini hanya bisa digunakan di dalam grup.");
          continue;
        }
        if (handler.admin && !isAdmin) {
          m.reply("Perintah ini hanya untuk admin grup.");
          continue;
        }
        if (handler.botAdmin && !isBotAdmin) {
          m.reply("Jadikan bot sebagai admin untuk menggunakan perintah ini.");
          continue;
        }
        if (handler.register && !user.registered) {
          m.reply("Anda harus terdaftar untuk menggunakan perintah ini. Ketik .daftar Name.umur");
          continue;
        }
        if (handler.limit && !isOwner && !isPremium) {
          const limitAmount = typeof handler.limit === 'number' ? handler.limit : 1;
          if (!Func.useLimit(user, limitAmount)) {
            m.reply(`Limit Anda tidak cukup. Sisa limit: ${user.limit}`);
            continue;
          }
        }

        // --- Eksekusi Handler Utama ---
        await handler(m, context);
        break; // Hentikan loop setelah menemukan dan menjalankan perintah yang cocok
      }

    } catch (e) {
      if (typeof e === 'string') {
        m.reply(e);
        continue;
      }
      
      console.error(`Error pada plugin '${handler.command || 'unknown'}':`, e);
      const errorMessage = `*[ ERROR REPORT ]*\n\n*Perintah:* ${command}\n*Plugin:* ${handler.command || 'unknown'}\n*User:* ${m.name} (${m.jid})\n*Error:* \n\`\`\`${util.format(e)}\`\`\``;
      
      // Kirim laporan error ke semua owner
      const allOwners = [...env.owner.map(o => `${o}@s.whatsapp.net`), ...ownerList];
      for (let ownerJid of allOwners) {
        await conn.sendMessage(ownerJid, { text: errorMessage });
      }
      
      if (isCmd) {
        m.reply("Terjadi kesalahan pada perintah ini. Laporan telah dikirim ke Owner.");
      }
    }
  }
};