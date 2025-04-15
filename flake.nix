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
    ...
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        packages = {
          default = import ./nix/package.nix {inherit pkgs;};
        };
      }
    )
    // {
      # Home Manager module for linux
      homeManagerModules.x86_64-linux = import ./nix/modules/home-manager.nix {mms = self.packages.x86_64-linux.default;};

      # For convenience, expose the module as an overlay too
      overlays.default = final: prev: {
        mms = self.packages.${prev.system}.default;
      };
    };
}
