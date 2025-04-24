{pkgs ? import <nixpkgs> {}}:
pkgs.stdenv.mkDerivation (finalAttrs: {
  pname = "mms";
  version = "0.0.1";
  src = ../.;

  buildInputs = [
    pkgs.nodejs
    pkgs.pnpm
    pkgs.openssl
    pkgs.pkg-config
    pkgs.prisma-engines
    pkgs.makeWrapper
  ];

  nativeBuildInputs = [
    pkgs.nodejs
    pkgs.pnpm.configHook
    pkgs.makeWrapper
  ];

  LD_LIBRARY_PATH = "${pkgs.openssl.out}/lib";
  PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
  PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";

  prePnpmInstall = ''
    pnpm config set dedupe-peer-dependents false
    export PRISMA_SKIP_POSTINSTALL_GENERATE=1
  '';

  pnpmDeps = pkgs.pnpm.fetchDeps {
    inherit
      (finalAttrs)
      pname
      version
      src
      prePnpmInstall
      ;
    hash = "sha256-+1a4ozWdjvHDd1b8cXw/BHZuTdJpJsKlPC6SM7TGpWs=";
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

    makeWrapper ${pkgs.nodejs}/bin/node $out/bin/mms \
      --add-flags "index.mjs" \
      --set NODE_PATH "$out/lib:${pkgs.nodejs}/lib/node_modules" \
      --set PRISMA_QUERY_ENGINE_LIBRARY "${pkgs.prisma-engines}/lib/libquery_engine.node" \
      --set PRISMA_SCHEMA_ENGINE_BINARY "${pkgs.prisma-engines}/bin/query-engine" \
      --set LD_LIBRARY_PATH "${pkgs.openssl.out}/lib" \
      --chdir "$out/lib/server" \
      --run "exec -a \"$0\" \"\$@\""

    runHook postInstall
  '';
})
