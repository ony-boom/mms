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

        # Home Manager module for linux
        homeManagerModules.default = import ./nix/modules/home-manager.nix self.packages.${system}.default;
        nixosModules.default = import ./nix/modules/nixos.nix self.packages.${system}.default;

        # For convenience, expose the module as an overlay too
        overlays.default = final: prev: {
          mms = self.packages.${prev.system}.default;
        };
      }
    );
}
