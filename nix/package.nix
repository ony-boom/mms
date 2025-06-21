{
  pkgs,
  self,
}: let
  pkgJson = builtins.fromJSON (builtins.readFile ../package.json);
  pname = pkgJson.name;
  version = pkgJson.version;
in
  pkgs.stdenv.mkDerivation (finalAttrs: {
    inherit pname version;
    src = self;

    # included in the final package
    buildInputs = [
      pkgs.nodejs
      pkgs.openssl
    ];

    # only at build
    nativeBuildInputs = [
      pkgs.nodejs
      pkgs.pnpm
      pkgs.pnpm.configHook
      pkgs.makeWrapper
    ];

    LD_LIBRARY_PATH = "${pkgs.openssl.out}/lib";
    PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
    PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";
    PRISMA_SKIP_POSTINSTALL_GENERATE = "1";

    prePnpmInstall = ''
      pnpm config set dedupe-peer-dependents false
    '';

    pnpmDeps = pkgs.pnpm.fetchDeps {
      inherit
        (finalAttrs)
        pname
        version
        src
        prePnpmInstall
        ;
      hash = "sha256-BhTSnS+zGNCPBJAYirCz4c+a8Wr89X5idr/WCpOAdjU=";
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
      cp ${pkgs.prisma-engines}/bin/* $out/lib/prisma-engines
      cp ${pkgs.prisma-engines}/lib/* $out/lib/prisma-engines

      cp ${pkgs.prisma}/bin/prisma $out/bin/

      makeWrapper ${pkgs.nodejs}/bin/node $out/bin/mms \
        --add-flags "$out/lib/server/index.mjs" \
        --set NODE_PATH "$out/lib:${pkgs.nodejs}/lib/node_modules" \
        --set PRISMA_QUERY_ENGINE_LIBRARY "$out/lib/prisma-engines/libquery_engine.node" \
        --set PRISMA_SCHEMA_ENGINE_BINARY "$out/lib/prisma-engines/query-engine" \
        --set PRISMA_SCHEMA_PATH "$out/lib/schema.prisma" \
        --set PATH "$out/bin:${pkgs.prisma}/bin:${pkgs.nodejs}/bin:$PATH" \
        --set LD_LIBRARY_PATH "${pkgs.openssl.out}/lib"

      runHook postInstall
    '';
  })
