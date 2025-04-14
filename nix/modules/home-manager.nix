{mms}: {
  config,
  lib,
  pkgs,
  ...
}:
with lib; let
  cfg = config.services.mms;
in {
  options.services.mms = {
    enable = mkEnableOption "mms service";

    package = mkOption {
      type = types.package;
      default = mms;
      description = "The mms package to use.";
    };

    port = mkOption {
      type = types.port;
      default = 3536;
      description = "Port on which mms will listen.";
    };

    host = mkOption {
      type = types.str;
      default = "localhost";
      description = "Host on which mms will listen.";
    };
  };

  config = mkIf cfg.enable {
    home.packages = [mms];

    nix = {
      settings = {
        substituters = [
          "https://cache.nixos.org"
          "https://ony-boom.cachix.org"
        ];
        trusted-public-keys = [
          "ony-boom.cachix.org-1:izooku2hlRwUYHwcBo6b6CBYOoGqB7Gga9/EWpE9CW8="
        ];
      };
    };
    # Create systemd user service
    systemd.user.services.mms = {
      Unit = {
        Description = "MMS Service";
        After = ["network.target"];
      };

      Service = {
        ExecStart = "${cfg.package}/bin/mms";
        Restart = "on-failure";
        Environment = [
          "PORT=${toString cfg.port}"
          "HOST=${toString cfg.host}"
        ];
      };

      Install = {
        WantedBy = ["default.target"];
      };
    };
  };
}
