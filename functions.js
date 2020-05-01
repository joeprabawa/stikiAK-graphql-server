const knex = require("./knexInit");

async function getKHS(loader, { semester }, nim) {
  const result = loader
    ? loader
        .filter((v) => (semester ? v.semester <= semester : v.semester <= 4))
        .map((v) => {
          return {
            nim: v.nim,
            kodeMK: () => (v.kdmk ? v.kdmk.trim() : null),
            nilaiReg: v.ntot,
            namaMatkul: () => {
              if (v.nama) return v.nama.trim();
            },
            semester: v.semester,
            nilaiSKS: v.na,
            jumlahSKS: v.sks,
          };
        })
    : [];

  const reducing = result.reduce((acc, val) => {
    !acc[val.semester]
      ? (acc[val.semester] = { semester: val.semester, data: [] })
      : acc[val.semester].data.push(val);
    return acc;
  }, {});

  const reduced = Object.entries(reducing).reduce((acc, val) => {
    return acc.concat(val[1]);
  }, []);

  const resolved = reduced.map((v) => {
    const { data } = v;
    let jumlahSKS = 0;
    let nilaiTotal = 0;
    data.forEach((v) => {
      jumlahSKS += v.jumlahSKS;
      nilaiTotal += v.jumlahSKS * v.nilaiSKS;
    });
    const ips = nilaiTotal / jumlahSKS;
    return {
      ...v,
      totalSKS: jumlahSKS,
      indeksSemester: ips || null,
    };
  });

  return resolved;
}

async function getMahasiswas(args) {
  const data = await knex("du")
    .select()
    .where(
      args.jurusan
        ? { kdjur: args.jurusan, thnaka: args.angkatan }
        : { thnaka: args.angkatan }
    )
    .limit(args.limit);

  const results = data;
  return results.map((v, i) => {
    return {
      id: i + 1,
      nim: v.nim,
      nama: v.nama.trim(),
      kota: v.kota.trim(),
      gender: v.jkel === 1 ? "Laki-Laki" : "Perempuan",
      ttl:
        v.tmplahir.toString() !== ""
          ? `${v.tmplahir.trim()}, ${v.tgllahir.toDateString()}`
          : v.tmplahir.trim(),
      jurusan: v.kdjur.trim(),
      background: v.smu_jur.trim(),
      angkatan: v.thnaka,
      statKerja: v.klsmlm == 1 ? "Kerja" : "Tidak Bekerja",
      statMenikah: v.status,
    };
  });
}

async function getMahasiswa(args) {
  const data = await knex.select().from("du").where({ nim: args.nim });
  const found = data.find((v) => v.nim === args.nim);
  return {
    nim: found.nim,
    nama: found.nama.trim(),
    kota: found.kota.trim(),
    ttl:
      found.tmplahir.toString() !== ""
        ? `${found.tmplahir.trim()}, ${found.tgllahir.toDateString()}`
        : found.tmplahir.trim(),
    jurusan: found.kdjur.trim(),
    background: found.smu_jur.trim(),
    angkatan: found.thnaka,
    statKerja: found.klsmlm == 1 ? "Kerja" : "Tidak Bekerja",
    statMenikah: found.status,
  };
}

module.exports = { getKHS, getMahasiswas, getMahasiswa };
