{self}: {
  config,
  lib,
  ...
}:
with lib; let
  cfg = config.services.mms;
  mms = self.packages.${lib.system.system}.default;
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
  };

  config = mkIf cfg.enable {
    environment.systemPackages = [cfg.package];

    systemd.services.mms = {
      description = "MMS Service";
      after = ["network.target"];
      wantedBy = ["multi-user.target"];

      serviceConfig = {
        ExecStart = "${cfg.package}/bin/mms";
        Restart = "on-failure";
        Environment = [
          "PORT=${toString cfg.port}"
          "HOST=${toString cfg.host}"
        ];
      };
    };
  };
}
