const DataLoader = require("dataloader");
const knex = require("./knexInit");

const loader = {
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
