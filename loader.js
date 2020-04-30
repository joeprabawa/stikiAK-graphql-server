const DataLoader = require("dataloader");
const knex = require("./knexInit");

const loader = {
  khs: new DataLoader(async (nim) => {
    const aliasRow = await knex.raw(
      `select d.nim, d.kdmk, d.ntot, d.na, d.prak+d.teori as sks, (select mk.matkul from mk where kdmk = d.kdmk) as nama, (select mk.smtr from mk where kdmk = d.kdmk ) as semester from nilai d where d.nim in ?`,
      [[nim]]
    );
    const rows = aliasRow[0];
    const lookup = rows.reduce((acc, val) => {
      const { nim } = val;
      const trimmed = nim.trim();
      !acc[trimmed]
        ? (acc[trimmed] = [])
        : acc[trimmed].push({ ...val, nim: trimmed });
      return acc;
    }, {});
    const mapped = nim.map((val) => lookup[val]);
    return mapped;
  }),
  ipk: new DataLoader(async (nim) => {
    const searchIPK = await knex.raw(
      `select d.nim, (select sum((teori+prak)*na)/sum(teori+prak) from nilai where nim=d.nim) AS IPK FROM du d WHERE d.nim in ?`,
      [[nim]]
    );
    const lookup = searchIPK[0].reduce((acc, val) => {
      acc[val.nim] = val;
      return acc;
    }, {});
    const mapped = nim.map((val) => lookup[val]);
    return mapped;
  }),
};

module.exports = { loader };
