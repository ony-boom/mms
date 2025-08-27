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

    sessionSecretFile = mkOption {
      type = types.nullOr (
        types.str
        // {
          # We don't want users to be able to pass a path literal here but
          # it should look like a path.
          check = it: isString it && types.path.check it;
        }
      );
      default = null;
      example = "/run/secrets/mmsSecret";
      description = ''
        A file containing a secure random string. This is used for signing user sessions.
        The contents of the file are read through systemd credentials, therefore the
        user running mms does not need permissions to read the file.
      '';
    };
  };

  config = mkIf cfg.enable {
    assertions = [
      {
        assertion = cfg.sessionSecretFile != null;
        message = "You must set services.mms.sessionSecretFile when services.mms.enable = true.";
      }
    ];

    # Create systemd user service
    systemd.user.services.mms = {
      Unit = {
        Description = "MMS Service";
        After = ["network.target"];
      };

      Service = {
        ExecStart = "${cfg.package}/bin/mms";
        Restart = "on-failure";
        Environment =
          [
            "PORT=${toString cfg.port}"
            "HOST=${toString cfg.host}"
          ]
          ++ optionals (cfg.sessionSecretFile != null) [
            "SESSION_SECRET=${"\${CREDENTIALS_DIRECTORY}"}/sessionSecret"
          ];
        LoadCredential = optionals (cfg.sessionSecretFile != null) [
          "sessionSecret:${cfg.sessionSecretFile}"
        ];
      };

      Install = {
        WantedBy = ["default.target"];
      };
    };
  };
}
