mms: {
  config,
  lib,
  pkgs,
  ...
}:
with lib; let
  cfg = config.services.mms;
  defaultMMSPackage = mms;
in {
  options.services.mms = {
    enable = mkEnableOption "Enable the MMS system service.";

    package = mkOption {
      type = types.package;
      default = defaultMMSPackage;
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
      default = "root";
      description = "User to run the MMS service as.";
    };

    sessionSecretFile = mkOption {
      type = types.nullOr types.str;
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

    systemd.services.mms = {
      description = "MMS Service";
      after = ["network.target"];
      wantedBy = ["multi-user.target"];

      serviceConfig = {
        User = cfg.user;
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
          # Provide the secret file to systemd as a credential named "sessionSecret"
          "sessionSecret:${cfg.sessionSecretFile}"
        ];
      };
    };
  };
}
