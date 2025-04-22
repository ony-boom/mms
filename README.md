# MMS - My Music Server

![Demo](./apps/client/assets/banner.png)

## Overview

MMS is a web-based local music player that allows you to manage and play your music collection from your browser. It consists of a client-server architecture that provides a seamless music listening experience.

**Status**: Work in progress, but fully functional for basic music playback.

## Features

- 🎵 **Local Music Playback**: Stream your music collection from your local server
- 🌐 **Web-Based Interface**: Access your music from any device with a web browser
- 🔍 **Search Functionality**: Find tracks in your music library
- 📋 **Playlist Management**: Create and manage playlists. (40% complete)
- 🎨 **Modern UI**: Clean and responsive interface built with React

## Architecture

MMS is structured as a monorepo using Turborepo and pnpm, consisting of:

- **Client**: A React-based web application for the user interface
- **Server**: A TypeScript backend that manages your music library and serves audio files
- **Shared Packages**: Common utilities and types shared between client and server

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

## Development

The project uses:
- TypeScript for type safety
- React for the client UI
- SQL (SQLite) database (via Prisma) for data storage
- pnpm for package management
- Turborepo for monorepo management

For more detailed information about the components:

- [Client Documentation](./apps/client/README.md)
- [Server Documentation](./apps/server/README.md)

> [!NOTE]
> The client should support using other servers, but the server is only compatible with the client.
> If you want to use the client with another server, you can implement the same API as the server.
> See `apps/client/src/clients/rest` for an example.

## Roadmap

- [ ] Maybe switch to a desktop application framework (Tauri or Wails are preferred over Electron)
- [ ] Improve mobile responsiveness
- [ ] Add more advanced music library management features
- [ ] Nix remote binary cache
