{
  openssl,
  prismaEngines,
}: {
  LD_LIBRARY_PATH = "${openssl.out}/lib";
  PRISMA_QUERY_ENGINE_LIBRARY = "${prismaEngines}/lib/libquery_engine.node";
  PRISMA_SCHEMA_ENGINE_BINARY = "${prismaEngines}/bin/query-engine";
  PRISMA_SKIP_POSTINSTALL_GENERATE = "1";
}
