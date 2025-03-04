import { CantStream, NotLoggedIn } from "@/helpers/errors.js";
import { logger } from "@/helpers/logger.js";
import { GUI_VERSION, WEBUI_PACKAGE_VERSION } from "@/helpers/versions.js";
import {
  Collection,
  Convertable,
  DEFAULT_SETTINGS,
  Downloader,
  generateDownloadObject,
  loadSettings,
  saveSettings,
  Single,
  SpotifyPlugin,
  utils,
  type DownloadObject,
  type Listener,
  type Settings,
  type SpotifySettings,
} from "@repo/deemix";
import { Deezer, setDeezerCacheDir } from "@repo/deezer-sdk";
import fs from "fs";
import got, { type Response as GotResponse } from "got";
import { sep } from "path";
import { v4 as uuidv4 } from "uuid";

// Functions
export const getAccessToken = utils.getDeezerAccessTokenFromEmailPassword;
export const getArlFromAccessToken = utils.getDeezerArlFromAccessToken;

// Constants
export const configFolder: string = utils.getConfigFolder();
setDeezerCacheDir(configFolder);
export const defaultSettings: Settings = DEFAULT_SETTINGS;

export const deezSessionMap: Record<string, Deezer> = {};

type DeezerAvailable = "yes" | "no" | "no-network";

export class DeemixApp {
  queueOrder: string[];
  queue: Record<string, any>;
  currentJob: boolean | Downloader | null;

  deezerAvailabilityStatus?: DeezerAvailable;
  latestVersion: string | null;

  plugins: Record<string, SpotifyPlugin>;
  settings: Settings;

  listener: Listener;

  constructor(listener: Listener) {
    this.settings = loadSettings(configFolder);

    this.queueOrder = [];
    this.queue = {};
    this.currentJob = null;

    this.plugins = {
      spotify: new SpotifyPlugin(),
    };
    this.latestVersion = null;
    this.listener = listener;

    this.plugins.spotify.setup();
    this.restoreQueueFromDisk();
  }

  async isDeezerAvailable() {
    if (this.deezerAvailabilityStatus) return this.deezerAvailabilityStatus;

    let response: GotResponse<string>;
    try {
      response = await got.get("https://www.deezer.com/", {
        headers: {
          Cookie:
            "dz_lang=en; Domain=deezer.com; Path=/; Secure; hostOnly=false;",
        },
        https: {
          rejectUnauthorized: false,
        },
        retry: {
          limit: 5,
        },
      });
    } catch (e) {
      logger.error(e);
      this.deezerAvailabilityStatus = "no-network";

      return this.deezerAvailabilityStatus;
    }
    const title = (
      response.body.match(/<title[^>]*>([^<]+)<\/title>/)![1] || ""
    ).trim();

    this.deezerAvailabilityStatus =
      title !== "Deezer will soon be available in your country." ? "yes" : "no";

    return this.deezerAvailabilityStatus;
  }

  async getLatestVersion(force = false): Promise<string | null> {
    if (this.latestVersion === null || force) {
      try {
        const responseJson = await got
          .get(
            `https://raw.githubusercontent.com/bambanah/deemix/main/${GUI_VERSION !== undefined ? "gui" : "webui"}/package.json`,
          )
          .json();
        this.latestVersion = JSON.parse(JSON.stringify(responseJson)).version;
      } catch (e) {
        logger.error(e);
        this.latestVersion = "NotFound";
        return this.latestVersion;
      }
    }
    return this.latestVersion;
  }

  parseVersion(version: string | null): any {
    if (version === null || version === "continuous" || version === "NotFound")
      return null;
    try {
      const matchResult =
        version.match(/(\d+)\.(\d+)\.(\d+)-r(\d+)\.(.+)/) || [];
      return {
        year: parseInt(matchResult[1]),
        month: parseInt(matchResult[2]),
        day: parseInt(matchResult[3]),
        revision: parseInt(matchResult[4]),
        commit: matchResult[5] || "",
      };
    } catch (e) {
      logger.error(e);
      return null;
    }
  }

  isUpdateAvailable(): boolean {
    return (
      this.latestVersion.localeCompare(
        GUI_VERSION ?? WEBUI_PACKAGE_VERSION,
        undefined,
        {
          numeric: true,
        },
      ) === 1
    );
  }

  getSettings() {
    return {
      settings: this.settings,
      defaultSettings,
      spotifySettings: this.plugins.spotify.getSettings(),
    };
  }

  saveSettings(newSettings: Settings, newSpotifySettings: SpotifySettings) {
    newSettings.executeCommand = this.settings.executeCommand;
    saveSettings(newSettings, configFolder);
    this.settings = newSettings;
    this.plugins.spotify.saveSettings(newSpotifySettings);
  }

  /**
   * Retrieves the current download queue and order, along with the current job's slimmed dictionary if a job is in progress.
   *
   * @returns {object} An object containing the download queue, queue order, and the current job's slimmed dictionary if applicable.
   */
  getQueue() {
    const result: any = {
      queue: this.queue,
      queueOrder: this.queueOrder,
    };

    if (this.currentJob instanceof Downloader) {
      result.current = this.currentJob.downloadObject.getSlimmedDict();
    }

    return result;
  }

  /**
   * Adds a list of URLs to the download queue.
   *
   * @param {Deezer} dz - The Deezer instance.
   * @param {string[]} url - An array of URLs to add to the queue.
   * @param {number} bitrate - The desired bitrate for the download.
   * @param {boolean} [retry=false] - Whether to retry adding to the queue if already present.
   * @throws {NotLoggedIn} If the user is not logged in.
   * @throws {CantStream} If the user cannot stream at the desired bitrate.
   * @returns {Promise<Record<string, any>[]>} A promise that resolves to an array of slimmed download objects.
   */
  async addToQueue(
    dz: Deezer,
    url: string[],
    bitrate: number,
    retry: boolean = false,
  ) {
    if (!dz.loggedIn) throw new NotLoggedIn();
    if (
      !this.settings.feelingLucky &&
      ((!dz.currentUser.can_stream_lossless && bitrate === 9) ||
        (!dz.currentUser.can_stream_hq && bitrate === 3))
    )
      throw new CantStream(bitrate);

    let downloadObjs: DownloadObject[] = [];
    const downloadErrors: any[] = [];
    let link: string = "";
    const requestUUID = uuidv4();

    if (url.length > 1) {
      this.listener.send("startGeneratingItems", {
        uuid: requestUUID,
        total: url.length,
      });
    }

    for (let i = 0; i < url.length; i++) {
      link = url[i];
      logger.info(`Adding ${link} to queue`);
      try {
        const downloadObj = await generateDownloadObject(
          dz,
          link,
          bitrate,
          this.plugins,
          this.listener,
        );

        if (Array.isArray(downloadObj)) {
          downloadObjs = downloadObjs.concat(downloadObj);
        } else if (downloadObj) {
          downloadObjs.push(downloadObj);
        }
      } catch (e) {
        downloadErrors.push(e);
      }
    }

    if (downloadErrors.length) {
      downloadErrors.forEach((e: any) => {
        if (!e.errid) logger.error(e);
        this.listener.send("queueError", {
          link: e.link,
          error: e.message,
          errid: e.errid,
        });
      });
    }

    if (url.length > 1) {
      this.listener.send("finishGeneratingItems", {
        uuid: requestUUID,
        total: downloadObjs.length,
      });
    }

    const slimmedObjects: Record<string, any>[] = [];

    downloadObjs.forEach((downloadObj) => {
      // Check if element is already in queue
      if (Object.keys(this.queue).includes(downloadObj.uuid) && !retry) {
        this.listener.send("alreadyInQueue", downloadObj.getEssentialDict());
        return;
      }

      // Save queue status when adding something to the queue
      if (!fs.existsSync(configFolder + "queue"))
        fs.mkdirSync(configFolder + "queue");

      this.queueOrder.push(downloadObj.uuid);
      fs.writeFileSync(
        configFolder + `queue${sep}order.json`,
        JSON.stringify(this.queueOrder),
      );
      this.queue[downloadObj.uuid] = downloadObj.getEssentialDict();
      this.queue[downloadObj.uuid].status = "inQueue";

      fs.writeFileSync(
        configFolder + `queue${sep}${downloadObj.uuid}.json`,
        JSON.stringify({ ...downloadObj.toDict(), status: "inQueue" }),
      );

      slimmedObjects.push(downloadObj.getSlimmedDict());
    });
    if (slimmedObjects.length === 1)
      this.listener.send("addedToQueue", slimmedObjects[0]);
    else this.listener.send("addedToQueue", slimmedObjects);

    this.startQueue(dz);
    return slimmedObjects;
  }

  /**
   * Starts processing the download queue. This function will process each item in the queue
   * one by one, downloading them using the appropriate method based on their type.
   *
   * @param {Deezer} dz - The Deezer instance used for downloading.
   * @returns {Promise<null>} - Returns null if no job is started or the queue is empty.
   *
   * @remarks
   * This function will lock the current job to prevent multiple downloads from starting simultaneously.
   * It will read the queue order and process each item until the queue is empty. The status of each
   * download will be updated and saved to the queue.
   *
   * @throws {Error} - Throws an error if there is an issue with reading or writing files.
   */
  async startQueue(dz: Deezer) {
    do {
      if (this.currentJob !== null || this.queueOrder.length === 0) {
        // Should not start another download
        return null;
      }
      this.currentJob = true; // lock currentJob

      let currentUUID: string;
      do {
        currentUUID = this.queueOrder.shift() || "";
      } while (this.queue[currentUUID] === undefined && this.queueOrder.length);
      if (this.queue[currentUUID] === undefined) {
        fs.writeFileSync(
          configFolder + `queue${sep}order.json`,
          JSON.stringify(this.queueOrder),
        );
        this.currentJob = null;
        return null;
      }
      this.queue[currentUUID].status = "downloading";
      const currentItem = JSON.parse(
        fs
          .readFileSync(configFolder + `queue${sep}${currentUUID}.json`)
          .toString(),
      );
      let downloadObject: Single | Collection | Convertable | undefined =
        undefined;

      switch (currentItem.__type__) {
        case "Single":
          downloadObject = new Single(currentItem);
          break;
        case "Collection":
          downloadObject = new Collection(currentItem);
          break;
        case "Convertable": {
          const convertable = new Convertable(currentItem);
          downloadObject = await this.plugins[convertable.plugin].convert(
            dz,
            convertable,
            this.settings,
            this.listener,
          );
          fs.writeFileSync(
            configFolder + `queue${sep}${downloadObject.uuid}.json`,
            JSON.stringify({ ...downloadObject.toDict(), status: "inQueue" }),
          );
          break;
        }
      }

      if (typeof downloadObject === "undefined") return;

      this.currentJob = new Downloader(
        dz,
        downloadObject,
        this.settings,
        this.listener,
      );

      this.listener.send("startDownload", currentUUID);
      await this.currentJob.start();

      if (!downloadObject.isCanceled) {
        // Set status
        if (
          downloadObject.failed === downloadObject.size &&
          downloadObject.size !== 0
        ) {
          this.queue[currentUUID].status = "failed";
        } else if (downloadObject.failed > 0) {
          this.queue[currentUUID].status = "withErrors";
        } else {
          this.queue[currentUUID].status = "completed";
        }

        const savedObject = {
          ...downloadObject.getSlimmedDict(),
          status: this.queue[currentUUID].status,
        };
        // Save queue status
        this.queue[currentUUID] = savedObject;
        fs.writeFileSync(
          configFolder + `queue${sep}${currentUUID}.json`,
          JSON.stringify(savedObject),
        );
      }

      fs.writeFileSync(
        configFolder + `queue${sep}order.json`,
        JSON.stringify(this.queueOrder),
      );

      this.currentJob = null;
    } while (this.queueOrder.length);
  }

  /**
   * Cancels a download based on the provided UUID.
   *
   * @param uuid - The unique identifier of the download to be canceled.
   *
   * If the download is currently in progress, it sets the `isCanceled` flag to true
   * and sends a "cancellingCurrentItem" event with the UUID.
   *
   * If the download is in the queue, it removes the UUID from the queue order,
   * updates the queue order file, and sends a "removedFromQueue" event with the UUID.
   *
   * In both cases, it deletes the corresponding queue file and removes the UUID from the queue.
   */
  stopDownload(uuid: string) {
    if (Object.keys(this.queue).includes(uuid)) {
      switch (this.queue[uuid].status) {
        case "downloading":
          if (this.currentJob instanceof Downloader) {
            this.currentJob.downloadObject.isCanceled = true;
          }
          this.listener.send("cancellingCurrentItem", uuid);
          break;
        case "inQueue":
          this.queueOrder.splice(this.queueOrder.indexOf(uuid), 1);
          fs.writeFileSync(
            configFolder + `queue${sep}order.json`,
            JSON.stringify(this.queueOrder),
          );
          this.listener.send("removedFromQueue", { uuid });
          break;

        default:
          this.listener.send("removedFromQueue", { uuid });
          break;
      }
      fs.unlinkSync(configFolder + `queue${sep}${uuid}.json`);
      delete this.queue[uuid];
    }
  }

  stopDownloads() {
    this.queueOrder = [];
    let currentItem: string | null = null;
    Object.values(this.queue).forEach((downloadObject: any) => {
      if (downloadObject.status === "downloading") {
        if (this.currentJob instanceof Downloader) {
          this.currentJob.downloadObject.isCanceled = true;
        }

        this.listener.send("cancellingCurrentItem", downloadObject.uuid);
        currentItem = downloadObject.uuid;
      }
      fs.unlinkSync(configFolder + `queue${sep}${downloadObject.uuid}.json`);
      delete this.queue[downloadObject.uuid];
    });
    fs.writeFileSync(
      configFolder + `queue${sep}order.json`,
      JSON.stringify(this.queueOrder),
    );
    this.listener.send("removedAllDownloads", currentItem);
  }

  /**
   * Cleans up completed downloads from the queue.
   *
   * This method iterates over the download queue and removes any download objects
   * that have a status of "completed". It deletes the corresponding JSON file from
   * the filesystem and removes the download object from the queue. After cleaning up,
   * it sends a "removedFinishedDownloads" message to the listener.
   *
   * @returns {void}
   */
  cleanupCompletedDownloads() {
    Object.values(this.queue).forEach((downloadObject: any) => {
      if (downloadObject.status === "completed") {
        fs.unlinkSync(configFolder + `queue${sep}${downloadObject.uuid}.json`);
        delete this.queue[downloadObject.uuid];
      }
    });
    this.listener.send("removedFinishedDownloads");
  }

  /**
   * Restores the download queue from the disk.
   *
   * This method checks if the queue directory exists, creates it if it doesn't,
   * and then reads all items from the directory. It processes each item based on
   * its filename and type, reconstructing the queue from the saved state.
   *
   * - If the item is `order.json`, it attempts to parse the queue order from it.
   * - For other items, it attempts to parse the item and add it to the queue.
   * - If an item is invalid or incompatible, it is removed from the queue.
   *
   * @throws Will throw an error if the queue directory cannot be created or read.
   */
  restoreQueueFromDisk() {
    if (!fs.existsSync(configFolder + "queue"))
      fs.mkdirSync(configFolder + "queue");
    const allItems: string[] = fs.readdirSync(configFolder + "queue");
    allItems.forEach((filename: string) => {
      if (filename === "order.json") {
        try {
          this.queueOrder = JSON.parse(
            fs.readFileSync(configFolder + `queue${sep}order.json`).toString(),
          );
        } catch {
          this.queueOrder = [];
          fs.writeFileSync(
            configFolder + `queue${sep}order.json`,
            JSON.stringify(this.queueOrder),
          );
        }
      } else {
        let currentItem: any;
        try {
          currentItem = JSON.parse(
            fs.readFileSync(configFolder + `queue${sep}${filename}`).toString(),
          );
        } catch {
          fs.unlinkSync(configFolder + `queue${sep}${filename}`);
          return;
        }
        if (currentItem.status === "inQueue") {
          let downloadObject: any;
          switch (currentItem.__type__) {
            case "Single":
              downloadObject = new Single(currentItem);
              // Remove old incompatible queue items
              if (downloadObject.single.trackAPI_gw) {
                fs.unlinkSync(configFolder + `queue${sep}${filename}`);
                return;
              }
              break;
            case "Collection":
              downloadObject = new Collection(currentItem);
              // Remove old incompatible queue items
              if (downloadObject.collection.tracks_gw) {
                fs.unlinkSync(configFolder + `queue${sep}${filename}`);
                return;
              }
              break;
            case "Convertable":
              downloadObject = new Convertable(currentItem);
              break;
          }
          this.queue[downloadObject.uuid] = downloadObject.getEssentialDict();
          this.queue[downloadObject.uuid].status = "inQueue";
        } else {
          this.queue[currentItem.uuid] = currentItem;
        }
      }
    });
  }
}
