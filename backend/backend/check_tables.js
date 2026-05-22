const prisma = require('./prisma');
async function test() {
  const tables = await prisma.$queryRawUnsafe('SHOW TABLES');
  console.log(tables);
  process.exit(0);
}
test();
