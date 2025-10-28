{
  description = "mms flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
        lib = nixpkgs.lib;
      in {
        packages = {
          default =
            (lib.callPackageWith {
              inherit self pkgs;
            })
            ./nix/package.nix
            {};
        };
        devShells.default = import ./nix/shell.nix {inherit pkgs;};
      }
    )
    // {
      homeManagerModules.default = import ./nix/modules/home-manager.nix self;
      nixosModules.default = import ./nix/modules/nixos.nix self;

      overlays.default = final: prev: {
        mms = self.packages.${prev.system}.default;
      };
    };
}
