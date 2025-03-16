{pkgs}:
pkgs.stdenv.mkDerivation (finalAttrs: {
  pname = "mms";
  src = ../.;
  version = "0.0.1";

  # Dependencies
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

  # Environment variables
  LD_LIBRARY_PATH = "${pkgs.openssl.out}/lib";
  PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
  PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";

  # pnpm configuration
  prePnpmInstall = ''
    # pnpm v8 configuration
    pnpm config set dedupe-peer-dependents false
    # Skip Prisma binary download
    export PRISMA_SKIP_POSTINSTALL_GENERATE=1
  '';

  # Fetch dependencies
  pnpmDeps = pkgs.pnpm.fetchDeps {
    inherit
      (finalAttrs)
      pname
      version
      src
      prePnpmInstall
      ;
    hash = "sha256-e7fAlql3wpBp4rTu4X3T4685zHA8vSJP0rHIwsc9w6o=";
  };

  # Build phase
  buildPhase = ''
    runHook preBuild

    # Install dependencies
    pnpm install --frozen-lockfile

    # Build the application
    pnpm run build

    runHook postBuild
  '';

  # Install phase
  installPhase = ''
    runHook preInstall

    # Create output directories
    mkdir -p $out/{bin,lib}

    # Copy build artifacts
    cp -r build/* $out/lib

    # Create executable wrapper
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
