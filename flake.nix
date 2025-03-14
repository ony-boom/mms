{
  description = "mms flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        packages = {
          default = pkgs.stdenv.mkDerivation (finalAttrs: {
            pname = "mms";
            src = ./.;
            version = "0.0.1";

            dontUnpack = true;

            buildInputs = [pkgs.nodejs pkgs.pnpm];
            nativeBuildInputs = [pkgs.nodejs pkgs.pnpm.configHook];

            pnpmDeps = pkgs.pnpm.fetchDeps {
              inherit
                (finalAttrs)
                pname
                version
                src
                ;
              hash = "sha256-UpLfCixNiTGmoQGslkkphz1XC9UCKSiKxvneUy07sag=";
            };

            buildPhase = ''
              runHook preBuild
              pnpm build
              runHook postBuild
            '';

            installPhase = ''
              mkdir -p $out
              cp -r build/* $out
            '';
          });
        };
      }
    );
}
