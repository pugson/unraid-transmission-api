import { NextResponse } from "next/server";
// @ts-expect-error no types for this package
import Transmission from "transmission";

enum transmissionTorrentStatus {
  STOPPED,
  CHECK_WAIT,
  CHECK,
  DOWNLOAD_WAIT,
  DOWNLOAD,
  SEED_WAIT,
  SEED,
  ISOLATED,
}

const transmission = new Transmission({
  host: process.env.TRANSMISSION_HOST,
  port: process.env.TRANSMISSION_PORT,
  username: process.env.TRANSMISSION_USERNAME,
  password: process.env.TRANSMISSION_PASSWORD,
});

const convertBytesToUnits = (bytes: number) => {
  // return kb, mb, gb, tb when appropriate
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  while (bytes >= 1000) {
    bytes /= 1000;
    unitIndex++;
  }
  return `${bytes.toFixed(2)} ${units[unitIndex]}`;
};

export async function GET(request: Request) {
  const torrentsPromise = new Promise<any[]>((resolve, reject) => {
    transmission.get((err: any, result: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.torrents);
      }
    });
  }).catch(() => []);

  const sessionPromise = new Promise<any>((resolve, reject) => {
    transmission.sessionStats((err: any, result: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }).catch(() => ({}));

  const [torrents, session] = await Promise.all([torrentsPromise, sessionPromise]);

  const simpleTorrents = (torrents ?? []).map((torrent: any) => ({
    id: torrent.id,
    name: torrent.name,
    percentDone: torrent.percentDone,
    status: transmissionTorrentStatus[torrent.status],
    totalSize: convertBytesToUnits(torrent.totalSize),
    rateDownload: torrent.rateDownload,
    rateUpload: torrent.rateUpload,
    leftUntilDone: convertBytesToUnits(torrent.leftUntilDone),
    eta: torrent.eta,
    peersConnected: torrent.peersConnected,
    peersSendingToUs: torrent.peersSendingToUs,
    activityDate: torrent.activityDate,
    addedDate: torrent.addedDate,
  }));

  return NextResponse.json({
    ok: true,
    torrents: simpleTorrents,
    stats: session || {},
  });
}
