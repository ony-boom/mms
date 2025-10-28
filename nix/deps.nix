{pkgs}: {
  node = pkgs.nodejs_22;
  pnpm = pkgs.pnpm_9;

  prisma = pkgs.prisma;
  prismaEngines = pkgs.prisma-engines;

  openssl = pkgs.openssl;
}
