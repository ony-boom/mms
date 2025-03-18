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
      default = pkgs.mms;
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
