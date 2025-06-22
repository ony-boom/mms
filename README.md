# MMS - My Music Server

[mini demo](https://music.ony.world)
![Demo](./apps/client/assets/banner.png)

## Overview

MMS is a web-based local music player that allows you to manage and play your music collection from your browser.

**Status**: Work in progress, but fully functional for basic music playback.

## Installation

### Nix/home-manager users

You can use the home-manager module in this repo to install:

```nix
# in your flake input
{
    inputs = {
        mms = {
            url = "github:ony-boom/mms";
            inputs.nixpkgs.follows = "nixpkgs";
       };
    };
}

# then somewhere in your config:
{
     services.mms = {
        enable = true;
        # see /nix/modules/home-manager.nix for the other options
    };
}
```

And optional but useful, add this to your flake or any method you prefer for extra subtituters, this way you avoid re-building the package:

```nix
  nixConfig = {
    extra-substituters = [
      "https://ony-boom.cachix.org"
    ];
    extra-trusted-public-keys = [
      "ony-boom.cachix.org-1:rPOTyyOCiAhLarertCrNnZLxsBFpcirEekoohcCZt10="
    ];
  };

```

> [!NOTE]
> For other installation methods, I haven't done anything with them yet.s

### Manual Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/ony-boom/mms.git
   cd mms
   ```

2. Install dependencies (requires Node.js ≥ 20 and pnpm):
   ```sh
   pnpm install
   ```

3. Set up the project:
   ```sh
   pnpm run setup
   ```

4. Start the development server:
   ```sh
   pnpm run dev
   ```

For more detailed information about the components:

- [Client Documentation](./apps/client/README.md)
- [Server Documentation](./apps/server/README.md)

> [!NOTE]
> The client should support using other servers, but the server is only compatible with the client.
> If you want to use the client with another server, you can implement the same API as the server.
> See `apps/client/src/clients/rest` for an example.

## Roadmap

- [ ] Maybe switch to a desktop application framework (Tauri or Wails are preferred over Electron)
- [ ] Add more advanced music library management features
