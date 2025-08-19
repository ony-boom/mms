# MMS - My Music Server (Archived)

![Demo](./apps/client/assets/banner.png)

⚠️ **This project is archived and no longer maintained.**

## About

MMS (*My Music Server*) was a personal project to build a web-based local music player.
It allowed managing and playing a personal music collection directly in the browser.

The project was primarily a **learning exercise** in building both client and server components for music playback.
However, the server component does not follow existing standards (such as the Subsonic API) and was only designed for **local use**.

## Why Archived?

After experimenting with MMS, I decided not to continue development and instead use existing, feature-rich music servers such as:

* [Gonic](https://github.com/sentriz/gonic)
* [Navidrome](https://www.navidrome.org/)

I’m now focusing my efforts on building a modern client for Subsonic-compatible servers (see: **Cadence**, WIP).

## Status

This repository remains as an archive of the learning journey.
No further development is planned.

## How to Run (for archival purposes)

If you’d like to try it locally:

1. Clone the repository:

   ```sh
   git clone https://github.com/ony-boom/mms.git
   cd mms
   ```

2. Install dependencies (requires **Node.js ≥ 20** and **pnpm**):

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

For more details on the client and server components:

* [Client Documentation](./apps/client/README.md)
* [Server Documentation](./apps/server/README.md)
