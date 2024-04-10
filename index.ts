import request from "superagent";

import * as cheerio from "cheerio";
import { Elysia } from "elysia";
import urlparser from "urlparser";
import urlParser from "urlparser";

class CONSTANTS {
  static BASE_URL: string = "https://playsrc.xyz/";
  static PROVIDER_URL: string = "https://vidplay.online"; // vidplay.site / vidplay.online / vidplay.lol
  static source_name: string = "Vidplay";
  static DEFAULT_KEY: string = "WXrUARXb1aDLaZjI";
}

interface sourcereq {
  status: number;

  result: {
    sources: [
      {
        file: string;
      }
    ];
  };
}

new Elysia()
  .get(
    "/",
    () =>
      " [ route for fetching movies /movie/:tmdbId ] : [ route for fetching movies /tv/:tmdbId/:season/:ep ] "
  )

  .get("/movie/:tmdbId", async  ({ params: { tmdbId } }) => 
     await main_func(`embed/movie/${tmdbId}`)
   )
  .get("/tv/:tmdbId/:season/:episode",async ({ params: { tmdbId, season, episode } })=>
     await main_func(`embed/tv/${tmdbId}/${season}/${episode}`)
  )
  .listen(7000);

const getdecodedurl = (url: string) => {
  const encoded: Buffer = getbase64(url);

  const decoded: Buffer = getdecoded(encoded, CONSTANTS.DEFAULT_KEY);

  const decoded_text = decoded.toString();

  return decodeURIComponent(decoded_text);
};

const getbase64 = (url: string) => {
  const standardized_input = url.replace("_", "/").replace("-", "+");

  const binaryData = Buffer.from(standardized_input, "base64");

  return Buffer.from(binaryData);
};

const getdecoded = (encoded: Buffer | string, key: string) => {
  const key_bytes = Buffer.from(key, "utf-8");

  const s = Buffer.from(
    Array(256)
      .fill(0)
      .map((_, i) => i)
  );

  let j: number = 0;

  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key_bytes[i % key_bytes.length]) & 0xff;
    [s[i], s[j]] = [s[j], s[i]]; // Destructuring assignment for swap
  }

  const decoded = Buffer.alloc(encoded.length);

  let i: number = 0;
  let k: number = 0;

  for (let index = 0; index < encoded.length; index++) {
    i = (i + 1) & 0xff;
    k = (k + s[i]) & 0xff;
    [s[i], s[k]] = [s[k], s[i]]; // Destructuring assignment for swap
    const t = (s[i] + s[k]) & 0xff;

    const currval: Number | String = encoded[index];

    if (typeof currval == "string") {
      decoded[index] = currval.charCodeAt(0) ^ s[t];
    } else {
      if (Number.isInteger(currval)) {
        decoded[index] = (currval as number) ^ s[t];
      } else {
        console.log(currval);
        // console.log(typeof ())
        // throw new Error("Unsupported data type in the input");
      }
    }
  }

  return decoded;
};

const encodeid = (v_id: string, key1: string, key2: string) => {
  const decode_id = getdecoded(v_id, key1);
  const encoded_result = getdecoded(decode_id, key2).toString("latin1");
  const encoded_base64 = btoa(encoded_result);

  return encoded_base64.replace("/", "_");
};

const getfutoken = async (url: string, key: string) => {
  const response = await request
    .get(`${CONSTANTS.PROVIDER_URL}/futoken`)
    .set({ Referer: url });

  const re = /var\s+k\s*=\s*'([^']+)/;

  const resstring: string = response.text;

  const fa_key = resstring.match(re);

  if (fa_key) {
    const fuKey = fa_key[1];

    const encryptedString = `${fuKey},${Array.from(
      { length: key.length },
      (_, i) =>
        (fuKey.charCodeAt(i % fuKey.length) + key.charCodeAt(i)).toString()
    ).join(",")}`;
    return encryptedString;
  }
};

const getVidplaySubtitles = async (url_data: string) => {
  var u = urlParser.parse(url_data);

  var out = u.query.parts[0].split("=");

  console.log();

  const conn = urlParser.parse(decodeURIComponent(out[1]));

  const resp = await request.get(`${CONSTANTS.BASE_URL}${conn.path.base}`);

  return JSON.parse(resp.text);
};

const main_func = async (endpnt : string) => {
  const res = await request.get(`${CONSTANTS.BASE_URL}${endpnt}`);
  const $ = cheerio.load(res?.text);
  const data_id: string | undefined = $("a[data-id]").first().attr("data-id");
  const get_source_id = await request.get(
    `${CONSTANTS.BASE_URL}ajax/embed/episode/${data_id}/sources`
  );
  if (get_source_id) {
    const source_id = await JSON.parse(get_source_id.text).result[0].id;

    const geturl = await request.get(
      `https://playsrc.xyz/ajax/embed/source/${source_id}`
    );
    const url = await JSON.parse(geturl.text).result.url;

    const decoded_url = getdecodedurl(url);

    const cloud_keys = await request.get(
      "https://raw.githubusercontent.com/Ciarands/vidsrc-keys/main/keys.json"
    );

    const [key1, key2] = await JSON.parse(cloud_keys.text);

    const url_data = decoded_url.split("?");

    const key = encodeid(url_data[0].split("/e/")[1], key1, key2);

    const futoken = await getfutoken(decoded_url, key);
    const subtitles: JSON = await getVidplaySubtitles(decoded_url);

    const fetchlinks = await request
      .get(
        `${CONSTANTS.PROVIDER_URL}/mediainfo/${futoken}?${url_data[1]}&autostart=true`
      )
      .set({ Referer: decoded_url });

    const finaljson: sourcereq | undefined = JSON.parse(fetchlinks.text);

    // console.log(JSON.parse(fetchlinks.text));
    if (finaljson) {
      return {
        source: finaljson.result.sources[0].file,
        subtitles: subtitles,
      };
    }
  }
};
