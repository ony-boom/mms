{
  pkgs,
  self,
}:
let
  pkgJson = builtins.fromJSON (builtins.readFile (self + /package.json));
  pname = pkgJson.name;
  version = pkgJson.version;

  node = pkgs.nodejs_22;
  pnpm = pkgs.pnpm_9;

  prisma = pkgs.prisma;
  prismaEngines = pkgs.prisma-engines;
in
pkgs.stdenv.mkDerivation (finalAttrs: {
  inherit pname version;
  src = self;

  # included in the final package
  buildInputs = [
    node
    pkgs.openssl
  ];

  # only at build
  nativeBuildInputs = [
    node
    pnpm.configHook
    pkgs.makeWrapper
  ];

  LD_LIBRARY_PATH = "${pkgs.openssl.out}/lib";
  PRISMA_QUERY_ENGINE_LIBRARY = "${prismaEngines}/lib/libquery_engine.node";
  PRISMA_SCHEMA_ENGINE_BINARY = "${prismaEngines}/bin/query-engine";
  PRISMA_SKIP_POSTINSTALL_GENERATE = "1";

  prePnpmInstall = ''
    pnpm config set dedupe-peer-dependents false
  '';

  pnpmDeps = pnpm.fetchDeps {
    fetcherVersion = 1;
    inherit (finalAttrs)
      pname
      version
      src
      prePnpmInstall
      ;
    hash = "sha256-/Qt8KvAAJc4FdqMKAgDgJC89AZr50g8x35caMoAMuiY=";
  };

  buildPhase = ''
    runHook preBuild

    pnpm install --frozen-lockfile
    pnpm run build

    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall

    mkdir -p $out/{bin,lib}
    cp -r build/* $out/lib

    mkdir -p $out/lib/prisma-engines
    cp ${prismaEngines}/bin/* $out/lib/prisma-engines
    cp ${prismaEngines}/lib/* $out/lib/prisma-engines

    cp ${prisma}/bin/prisma $out/bin/

    makeWrapper ${node}/bin/node $out/bin/mms \
      --add-flags "$out/lib/server/index.mjs" \
      --set NODE_PATH "$out/lib:${node}/lib/node_modules" \
      --set PRISMA_QUERY_ENGINE_LIBRARY "$out/lib/prisma-engines/libquery_engine.node" \
      --set PRISMA_SCHEMA_ENGINE_BINARY "$out/lib/prisma-engines/query-engine" \
      --set PRISMA_SCHEMA_PATH "$out/lib/schema.prisma" \
      --set PATH "$out/bin:${prisma}/bin:${node}/bin:$PATH" \
      --set NODE_ENV "production" \
      --set LD_LIBRARY_PATH "${pkgs.openssl.out}/lib"

    runHook postInstall
  '';
})
