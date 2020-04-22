const knex = require("./knexInit");

module.exports = {
  Query: {
    mahasiswa: async (_parent, args, _ctx, info) => {
      info.cacheControl.setCacheHint({ maxAge: 240, scope: "PRIVATE" });
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
    },
    mahasiswas: async (_, args, _ctx, info) => {
      info.cacheControl.setCacheHint({ maxAge: 240, scope: "PRIVATE" });
      const data = await knex
        .select()
        .from("du")
        .where(
          args.angkatan
            ? { kdjur: args.jurusan, thnaka: args.angkatan }
            : { kdjur: args.jurusan }
        )
        .limit(args.limit)
        .offset(args.offset);
      const results = data;
      return results.map((v, i) => {
        return {
          id: i + 1,
          nim: v.nim,
          nama: v.nama.trim(),
          kota: v.kota.trim(),
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
    },
  },
  Mahasiswa: {
    khs: async (parent, args, _ctx, info) => {
      info.cacheControl.setCacheHint({ maxAge: 240, scope: "PRIVATE" });
      const aliasRow = await knex.raw(
        `select d.nim, d.kdmk, d.ntot, d.na, d.prak+d.teori as sks, (select mk.matkul from mk where kdmk = d.kdmk) as nama, (select mk.smtr from mk where kdmk = d.kdmk ) as semester from nilai d where d.nim =?`,
        [parent.nim]
      );

      const data = aliasRow[0].filter((v) => {
        return args.semester ? v.semester <= args.semester : v.semester <= 4;
      });
      const result = data.map((v) => {
        return {
          kodeMK: v.kdmk.trim(),
          nilaiReg: v.ntot,
          namaMatkul: () => {
            if (v.nama) return v.nama.trim();
          },
          semester: v.semester,
          nilaiSKS: v.na,
          jumlahSKS: v.sks,
        };
      });

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
    },

    ipk: async (parent, _, { loader }, info) => {
      info.cacheControl.setCacheHint({ maxAge: 240, scope: "PRIVATE" });
      return loader.ipk.load(parent.nim);
      // const searchIPK = await knex.raw(
      //   `SELECT d.nim, (SELECT SUM((teori+prak)*na)/SUM(teori+prak) FROM nilai WHERE nim=d.nim) AS IPK FROM du d WHERE d.nim=?`,
      //   [parent.nim]
      // );
      // const found = searchIPK[0].find((v) => v.nim === parent.nim);
      // return found.IPK;
    },
  },
};
