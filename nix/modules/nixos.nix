{self}: {
  config,
  lib,
  pkgs,
  ...
}:
with lib; let
  cfg = config.services.mms;
  mms = self.packages.${pkgs.system}.default;
in {
  options.services.mms = {
    enable = mkEnableOption "Enable the MMS system service.";

    package = mkOption {
      type = types.package;
      default = mms;
      description = "The MMS package to use.";
    };

    port = mkOption {
      type = types.port;
      default = 3536;
      description = "Port on which MMS will listen.";
    };

    host = mkOption {
      type = types.str;
      default = "localhost";
      description = "Host on which MMS will listen.";
    };

    user = mkOption {
      type = types.str;
      default = "mms";
      description = "User to run the MMS service as.";
    };
  };

  config =
    mkIf cfg.enable {
      systemd.services.mms = {
        description = "MMS Service";
        after = ["network.target"];
        wantedBy = ["multi-user.target"];

        serviceConfig = {
          User = cfg.user;
          ExecStart = "${cfg.package}/bin/mms";
          Restart = "on-failure";
          Environment = [
            "PORT=${toString cfg.port}"
            "HOST=${toString cfg.host}"
          ];
        };
      };
    }
    // (
      lib.mkIf (cfg.user == "mms") {
        users.users.${cfg.user} = {
          isSystemUser = true;
          description = "User for MMS service";
        };
      }
    );
}
