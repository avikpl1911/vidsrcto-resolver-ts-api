"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const superagent_1 = __importDefault(require("superagent"));
const cheerio = __importStar(require("cheerio"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const urlparser_1 = __importDefault(require("urlparser"));
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
dotenv_1.default.config();
app
    .use((0, cors_1.default)())
    .get('/', (req, res) => {
    res.send("hello from A1ze");
})
    .get("/movie/:tmdbId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield main_func(`embed/movie/${req.params.tmdbId}`);
    if (resp) {
        res.json(resp);
    }
    else {
        res.json({});
    }
}))
    .get("/tv/:tmdbId/:season/:episode", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield main_func(`embed/tv/${req.params.tmdbId}/${req.params.season}/${req.params.episode}`);
    if (resp) {
        res.json(resp);
    }
    else {
        res.json({});
    }
}))
    .listen(port, () => {
    console.log(`server is running on port http//localhost:${port}`);
});
class CONSTANTS {
}
CONSTANTS.BASE_URL = "https://playsrc.xyz/";
CONSTANTS.PROVIDER_URL = "https://vidplay.online"; // vidplay.site / vidplay.online / vidplay.lol
CONSTANTS.source_name = "Vidplay";
CONSTANTS.DEFAULT_KEY = "WXrUARXb1aDLaZjI";
// init({
//   routes: ["./src"],
//   serve: { port: 8080 },
// });
const file_get = (urlg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const url = new URL(`https://pdrz.v4507fb3559.site/_v2-mwxk/12a3c523fd105800ed8c394685aeeb0b962efc5c1be6e5e80c437baea93ece832257df1a4b6125fcfa38c35da05dee86aad28d46d73fc4e9d4e5a3385772f4d5338246f60549ed0a11c2b4bc6e4e7b5131358a7f56496989899fb80dcdf6789b7d14ae57116ca602/h/list;15a38634f803584ba8926411d7bee906856cab0654b5b6.m3u8`);
    const refererUrl = decodeURIComponent(url.searchParams.get("referer") || "");
    const targetUrl = decodeURIComponent(url.searchParams.get("url") || "");
    const originUrl = decodeURIComponent(url.searchParams.get("origin") || "");
    const proxyAll = decodeURIComponent(url.searchParams.get("all") || "");
    const response = yield fetch(targetUrl, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            Referer: refererUrl || "",
            Origin: originUrl || "",
        },
    });
    let modifiedM3u8;
    if (targetUrl.includes(".m3u8")) {
        modifiedM3u8 = yield response.text();
        const targetUrlTrimmed = `${encodeURIComponent(targetUrl.replace(/([^/]+\.m3u8)$/, "").trim())}`;
        const encodedUrl = encodeURIComponent(refererUrl);
        const encodedOrigin = encodeURIComponent(originUrl);
        modifiedM3u8 = modifiedM3u8
            .split("\n")
            .map((line) => {
            if (line.startsWith("#") || line.trim() == "") {
                return line;
            }
            else if (proxyAll == "yes" && line.startsWith("http")) {
                //https://yourproxy.com/?url=https://somevideo.m3u8&all=yes
                return `${url.origin}?url=${line}`;
            }
            return `?url=${targetUrlTrimmed}${line}${originUrl ? `&origin=${encodedOrigin}` : ""}${refererUrl ? `&referer=${encodedUrl}` : ""}`;
        })
            .join("\n");
        return {
            body: modifiedM3u8 || response.body,
            status: response.status,
            statusText: response.statusText,
            headers: {
                alloworigin: "*",
                contenttype: ((_a = response.headers) === null || _a === void 0 ? void 0 : _a.get("Content-Type")) ||
                    "application/vnd.apple.mpegurl",
            },
        };
    }
});
const getdecodedurl = (url) => {
    const encoded = getbase64(url);
    const decoded = getdecoded(encoded, CONSTANTS.DEFAULT_KEY);
    const decoded_text = decoded.toString();
    return decodeURIComponent(decoded_text);
};
const getbase64 = (url) => {
    const standardized_input = url.replace("_", "/").replace("-", "+");
    const binaryData = Buffer.from(standardized_input, "base64");
    return Buffer.from(binaryData);
};
const getdecoded = (encoded, key) => {
    const key_bytes = Buffer.from(key, "utf-8");
    const s = Buffer.from(Array(256)
        .fill(0)
        .map((_, i) => i));
    let j = 0;
    for (let i = 0; i < 256; i++) {
        j = (j + s[i] + key_bytes[i % key_bytes.length]) & 0xff;
        [s[i], s[j]] = [s[j], s[i]]; // Destructuring assignment for swap
    }
    const decoded = Buffer.alloc(encoded.length);
    let i = 0;
    let k = 0;
    for (let index = 0; index < encoded.length; index++) {
        i = (i + 1) & 0xff;
        k = (k + s[i]) & 0xff;
        [s[i], s[k]] = [s[k], s[i]]; // Destructuring assignment for swap
        const t = (s[i] + s[k]) & 0xff;
        const currval = encoded[index];
        if (typeof currval == "string") {
            decoded[index] = currval.charCodeAt(0) ^ s[t];
        }
        else {
            if (Number.isInteger(currval)) {
                decoded[index] = currval ^ s[t];
            }
            else {
                console.log(currval);
                // console.log(typeof ())
                // throw new Error("Unsupported data type in the input");
            }
        }
    }
    return decoded;
};
const encodeid = (v_id, key1, key2) => {
    const decode_id = getdecoded(v_id, key1);
    const encoded_result = getdecoded(decode_id, key2).toString("latin1");
    const encoded_base64 = btoa(encoded_result);
    return encoded_base64.replace("/", "_");
};
const getfutoken = (url, key) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield superagent_1.default
        .get(`${CONSTANTS.PROVIDER_URL}/futoken`)
        .set({ Referer: url });
    const re = /var\s+k\s*=\s*'([^']+)/;
    const resstring = response.text;
    const fa_key = resstring.match(re);
    if (fa_key) {
        const fuKey = fa_key[1];
        const encryptedString = `${fuKey},${Array.from({ length: key.length }, (_, i) => (fuKey.charCodeAt(i % fuKey.length) + key.charCodeAt(i)).toString()).join(",")}`;
        return encryptedString;
    }
});
const getVidplaySubtitles = (url_data) => __awaiter(void 0, void 0, void 0, function* () {
    var u = urlparser_1.default.parse(url_data);
    var out = u.query.parts[0].split("=");
    const conn = urlparser_1.default.parse(decodeURIComponent(out[1]));
    if (conn) {
        const resp = yield superagent_1.default.get(`${CONSTANTS.BASE_URL}${conn.path.base}`);
        try {
            const parse = JSON.parse(resp.text);
            return parse;
        }
        catch (e) {
            return [];
        }
    }
    else {
        return [];
    }
});
const main_func = (endpnt) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield superagent_1.default.get(`${CONSTANTS.BASE_URL}${endpnt}`);
        const $ = cheerio.load(res === null || res === void 0 ? void 0 : res.text);
        const data_id = $("a[data-id]").first().attr("data-id");
        const get_source_id = yield superagent_1.default.get(`${CONSTANTS.BASE_URL}ajax/embed/episode/${data_id}/sources`);
        if (get_source_id) {
            const source_id = yield JSON.parse(get_source_id.text).result[0].id;
            const geturl = yield superagent_1.default.get(`https://playsrc.xyz/ajax/embed/source/${source_id}`);
            const url = yield JSON.parse(geturl.text).result.url;
            const decoded_url = getdecodedurl(url);
            const cloud_keys = yield superagent_1.default.get("https://raw.githubusercontent.com/Ciarands/vidsrc-keys/main/keys.json");
            const [key1, key2] = yield JSON.parse(cloud_keys.text);
            const url_data = decoded_url.split("?");
            const key = encodeid(url_data[0].split("/e/")[1], key1, key2);
            const futoken = yield getfutoken(decoded_url, key);
            const subtitles = yield getVidplaySubtitles(decoded_url);
            const ip = Math.floor(Math.random() * 255) +
                1 +
                "." +
                Math.floor(Math.random() * 255) +
                "." +
                Math.floor(Math.random() * 255) +
                "." +
                Math.floor(Math.random() * 255);
            const fetchlinks = yield superagent_1.default
                .get(`${CONSTANTS.PROVIDER_URL}/mediainfo/${futoken}?${url_data[1]}&autostart=true`)
                .set({ referer: decoded_url })
                .set({ origin: ip })
                .set({ host: "vidplay.online" });
            const finaljson = JSON.parse(fetchlinks.text);
            // console.log(JSON.parse(fetchlinks.text));
            if (finaljson) {
                return {
                    source: finaljson.result.sources[0].file,
                    subtitles: subtitles,
                    status: 200,
                };
            }
        }
    }
    catch (e) {
        return {
            status: 404,
        };
    }
});
//# sourceMappingURL=index.js.map