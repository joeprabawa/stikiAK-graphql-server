const DataLoader = require("dataloader");
const knex = require("./knexInit");

const loader = {
  khs: new DataLoader(async (nim) => {
    const query = await knex
      .select("d.nim", "d.kdmk", "d.ntot", "d.na", {
        sks: knex.raw("d.prak+d.teori"),
        nama: knex("mk").select("mk.matkul").where(knex.raw("kdmk = d.kdmk")),
        semester: knex("mk").select("mk.smtr").where(knex.raw("kdmk = d.kdmk")),
      })
      .from({ d: "nilai" })
      .whereIn("d.nim", nim);

    const lookup = query.reduce((acc, val) => {
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
    const query = await knex({ d: "du" })
      .select("nim", {
        IPK: knex("nilai")
          .select(knex.raw("sum((teori+prak)*na)/sum(teori+prak)"))
          .where(knex.raw("nim=d.nim")),

        totalSKS: knex("nilai")
          .select(knex.raw("sum(teori+prak)"))
          .where(knex.raw("nim=d.nim")),
      })
      .whereIn("d.nim", nim);

    const lookup = query.reduce((acc, val) => {
      acc[val.nim] = val;
      return acc;
    }, {});
    const mapped = nim.map((val) => lookup[val]);
    return mapped;
  }),
};

module.exports = { loader };
