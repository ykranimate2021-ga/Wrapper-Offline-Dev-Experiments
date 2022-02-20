const nodezip = require("node-zip");
const fs = require("fs");
const https = require("https");
let dotenv = require('dotenv').config()
const savedFolder = process.env.SAVED_FOLDER;
const cacheFolder = process.env.CACHE_FOLDER;
const settings = require('./settings.json')
const RPC = require("discord-rpc");

if (settings.discord_rpc == "true") {
	var rpc = new RPC.Client({
		transport: "ipc"
	});
}

module.exports = {
	makeZip(zipName, buffer) {
		if (!buffer) return Promise.reject();
		const zip = nodezip.create();
		this.addToZip(zip, zipName, buffer);
		return zip.zip();
	},
	/**
	 *
	 * @summary Fixed version of ZipFile.add
	 * @param {nodezip.ZipFile} zip
	 * @param {string} zipName
	 * @param {string} buffer
	 */
	addToZip(zip, zipName, buffer) {
		zip.add(zipName, buffer);
		if (zip[zipName].crc32 < 0) zip[zipName].crc32 += 4294967296;
	},
  readFile(path) {
    fs.readFile(path, 'utf8', function(err, data) {
      return data
    });
  },
  readFileSync(path) {
    return fs.readFileSync(path);
  },
  padZero(n, l = 9) {
		return ("" + n).padStart(l, "0");
	},
	get(url, options = {}) {
		var data = [];
		return new Promise((res, rej) => {
			https.get(url, options, (o) =>
				o
					.on("data", (v) => data.push(v))
					.on("end", () => res(Buffer.concat(data)))
					.on("error", rej)
			);
		});
	},
	urlEncodeFV(fv) {
		return fv
						.replace(/'/g, '')
						.replace(/,/g, '&')
						.replace(/:/g, '=')
						.replace(/https=\/\/localhost=4664/g, 'https://localhost:4664')
						.replace(/\//g, '%2F')
						.replace(/:/g, '%3A')
						.replace(/</g, '%3C')
						.replace(/>/g, '%3E')
	},
	getNextFileId(s, suf = ".xml", l = 7) {
		const indicies = this.getValidFileIndicies(s, suf, l);
		return indicies.length ? indicies[indicies.length - 1] + 1 : 0;
	},
	getValidFileIndicies(s, suf = ".xml", l = 7) {
		const regex = new RegExp(`${s}[0-9]{${l}}${suf}$`);
		return fs
			.readdirSync(savedFolder)
			.filter((v) => v && regex.test(v))
			.map((v) => Number.parseInt(v.substr(s.length, l)));
	},
	getFileIndex(s, suf = ".xml", n, l = 7) {
		return this.getFileString(s, suf, this.padZero(n, l));
	},
	getFileString(s, suf = ".xml", name) {
		return `${savedFolder}/${s}${name}${suf}`;
	},
	addToSavedJson(options) {
		var json = JSON.parse(fs.readFileSync(`${savedFolder}/saved.json`));
		let entry = {
			"id": options.id,
			"type": options.type,
			"name": options.name || "Untitled",
			"description": options.desc || 0,
			"thumb": options.thumb || 0,
			"theme": options.theme || 0,
			"subtype": options.subtype || 0,
			"duration": options.duration || 0,
			"category": options.category || 0
		}
		json.unshift(entry);
		var newJson = JSON.stringify(json, null, 2);
		this.writeFile(`${savedFolder}/saved.json`, newJson)

		return true;
	},
	getFilePath(id, type) {
		var i = id.indexOf("-");
		var prefix = id.substr(0, i);
		var suffix = id.substr(i + 1);
		switch (prefix) {
			case "c":
				return this.getFileIndex("char-", ".xml", suffix);
				break;
			case "v":
				return this.getFileIndex("video-", ".xml", suffix);
				break;
			case "C":
			default: {
				switch (type) {
					case "char": {
						return `${cacheFolder}/char.${id}.xml`;
					}
					case "video": {
						return false;
					}
				}
				break;
			}
		}
	},
	getThumbPath(id, type) {
		var i = id.indexOf("-");
		var prefix = id.substr(0, i);
		var suffix = id.substr(i + 1);
		switch (prefix) {
			case "c":
				return this.getFileIndex("char-", ".png", suffix);
				break;
			case "v":
				return this.getFileIndex("video-", ".png", suffix);
				break;
			case "C":
			default: {
				switch (type) {
					case "char": {
						return `${cacheFolder}/char.${id}.png`;
					}
					case "video": {
						return false;
					}
				}
				break;
			}
		}
	},
	removeFromSavedJson(id) {
		var json = JSON.parse(fs.readFileSync(`${savedFolder}/saved.json`));
		var i = 0;
		json.forEach(asset => {
			if (asset.id == id) {
				var n = i;
				var del = json.splice(n,1);
				var newJson = JSON.stringify(json, null, 2);
				fs.writeFile(`${savedFolder}/saved.json`, newJson, (err) => {
					if (err) throw err;
				});
			}
			i++
		})
	},
	setRpcActivity(string, image) {
		rpc.setActivity({
			state: string,
			details: "Version 2.0.0",
			startTimestamp: new Date(),
			largeImageKey: "templogo",
			largeImageText: "Comedy Studio",
			smallImageKey: image,
			smallImageText: string,
		});
	},
	changeSetting(name) {
		var settingname;
		switch (name) {
			case "themes": {
				settingname = 'truncated_themelist';
				break;
			}
			case "rpc": {
				settingname = 'discord_rpc';
				break;
			}
			default: {
				settingname = name;
				break;
			}
		}
		var json = JSON.parse(fs.readFileSync(`./util/settings.json`));
		var previous = json[settingname];
		switch (previous) {
			case "true": {
				var changeTo = "false";
				break;
			}
			case "false": {
				var changeTo = "true";
				break;
			}
		}
		json[settingname] = changeTo;
		var newjson = JSON.stringify(json, null, 2);
		fs.writeFileSync(`./util/settings.json`, newjson);
		return changeTo;
	},
	writeFile(name, data) {
		fs.writeFileSync(name, data);
	},
	deleteFile(name) {
		fs.unlinkSync(name);
	},
	readFile(name, encoding = 'utf-8') {
		fs.readFileSync(name, encoding);
	}
};

if (settings.discord_rpc == "true") {
	rpc.on("ready", () => {
		rpc.setActivity({
			state: 'Starting',
			details: "Version 2.0.0",
			startTimestamp: new Date(),
			largeImageKey: "templogo",
			largeImageText: "Comedy Studio",
			smallImageKey: "Comedy Studio",
			smallImageText: "Comedy Studio",
		});
	});
	// Connects RPC to app
	try {
		rpc.login({
			clientId: "944419067140382730"
		});
		console.log('Rich presence is on!')
	} catch (e) {
		console.log(e);
	}
}