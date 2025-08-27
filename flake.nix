{
  description = "mms flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    nixpkgs-prisma-6.url = "github:NixOS/nixpkgs/7db9cd9d3f2a6a257d5e52d3173200b1c8650782";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    ...
  } @ inputs:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
        prisma-6-pkgs = inputs.nixpkgs-prisma-6.legacyPackages.${system};
      in {
        packages = {
          default = import ./nix/package.nix {inherit pkgs self prisma-6-pkgs;};
        };
      }
    )
    // {
      # Home Manager module for linux
      homeManagerModules.x86_64-linux =
        import ./nix/modules/home-manager.nix {inherit self;};
      nixosModules.x86_64-linux = import ./nix/modules/nixos.nix {inherit self;};

      # For convenience, expose the module as an overlay too
      overlays.default = final: prev: {
        mms = self.packages.${prev.system}.default;
      };
    };
}
