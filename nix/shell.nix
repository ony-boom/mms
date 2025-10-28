{pkgs}: let
  deps = import ./deps.nix {inherit pkgs;};
  prismaEnv = import ./prisma-env.nix {
    inherit (deps) openssl prismaEngines;
  };
in
  pkgs.mkShell ({
      packages = with deps; [
        node
        pnpm
        openssl
        prismaEngines
        prisma
        pkgs.nodePackages."@antfu/ni"
      ];
    }
    // prismaEnv)
