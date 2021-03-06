﻿/*
 * projekktor zwei V 0.8.20 [speakker edition] built Monday 18th of April 2011 10:02:36 AM
 * http://www.projekktor.com
 * Copyright 2010, Sascha Kluger, Spinning Airwhale Media, http://www.spinningairwhale.com
 * under GNU General Public License
 * http://www.projekktor.com/license/
 *
 * You can use, modify and distribute the software, but do so in the spirit of Open Source.
 * You need to leave the copyright notices intact.
 * You need to be able to share any modifications you make to the Projekktor source (not the software Projekktor is integrated to).
 * Give credit where credit is due, spread the word, link to us if you can.
 */
var playerModelYTVIDEO = function () { };
var playerModelYTAUDIO = function () { };
jQuery(function (a) {
    playerModelYTVIDEO.prototype = {
        modelReady: false,
        allowRandomSeek: true,
        _updateTimer: null,
        init: function (b) {
            var c = this.pp.getId();
            if (window.ProjekktorYoutubePlayerAPIReady !== true) {
                a.getScript("http://www.youtube.com/player_api")
            } else {
                this.ready()
            }
            window.onYouTubePlayerAPIReady = function () {
                window.ProjekktorYoutubePlayerAPIReady = true;
                projekktor(c).playerModel.ready()
            };
            window["onStateChange" + c] = function (d) {
                projekktor(c).playerModel.stateChange(d)
            };
            window["onReady" + c] = function (d) {
                projekktor(c).playerModel.onReady(d)
            };
            window["onError" + c] = function (d) {
                projekktor(c).playerModel.errorListener(d)
            }
        },
        applyMedia: function (b) {
            var c = this.pp.getId();
            this._setBufferState("empty");
            this.mediaElement = new YT.Player(c + "_media", {
                width: (this.pp.getIsMobileClient()) ? this.pp.config.width : "100%",
                height: (this.pp.getIsMobileClient()) ? this.pp.config.height : "100%",
                playerVars: {
                    autoplay: 1,
                    disablekb: 1,
                    start: 0,
                    controls: 0,
                    enablejsapi: 1,
                    playerapiid: c,
                    origin: location.host,
                    wmode: "transparent"
                },
                videoId: this.youtubeGetId(),
                events: {
                    onReady: "onReady" + c,
                    onStateChange: "onStateChange" + c,
                    onError: "onError" + c
                }
            });
            a(this.mediaElement.a).attr("ALLOWTRANSPARENCY", true).attr("scrolling", "no").attr("frameborder", "0").css({
                overflow: "hidden",
                border: "0px",
                display: "block"
            });
            if (a.browser.mozilla) {
                this.requiresFlash = 8
            }
        },
        addListeners: function () { },
        setSeek: function (c) {
            try {
                this.mediaElement.seekTo(c, true)
            } catch (b) { }
        },
        setVolume: function (b) {
            try {
                this.mediaElement.setVolume(b * 100)
            } catch (c) { }
        },
        setPause: function (b) {
            try {
                this.mediaElement.pauseVideo()
            } catch (c) { }
        },
        setPlay: function (b) {
            try {
                this.mediaElement.playVideo()
            } catch (c) { }
        },
        getVolume: function () {
            try {
                return this.mediaElement.getVolume()
            } catch (b) { }
            return 0
        },
        getPoster: function () {
            return this.media.config["poster"] || this.pp.config.poster || "http://img.youtube.com/vi/" + this.youtubeGetId() + "/0.jpg"
        },
        errorListener: function (b) {
            switch (b) {
                case 100:
                    this.setTestcard(0, "This Youtube video has been removed or set to private");
                    break;
                case 101:
                case 150:
                    this.setTestcard(0, "The Youtube user owning this video disabled embedding.");
                    break;
                case 2:
                    this.setTestcard(0, "Invalid Youtube Video-Id specified.");
                    break
            }
        },
        stateChange: function (b) {
            clearTimeout(this._updateTimer);
            if (this.mediaElement === null) {
                return
            }
            switch (b.data) {
                case -1:
                    break;
                case 0:
                    this.endedListener({});
                    break;
                case 1:
                    this._setBufferState("full");
                    this.playingListener({});
                    this.canplayListener({});
                    this.updateInfo();
                    break;
                case 2:
                    this.pauseListener({});
                    break;
                case 3:
                    this.waitingListener({});
                    break
            }
        },
        onReady: function () {
            this.setVolume(this.pp.getVolume());
            if (this.media.title || this.pp.config.title || this.elementReady) {
                this.elementReady = true;
                return
            }
            var b = this;
            a.ajax({
                url: "http://gdata.youtube.com/feeds/api/videos/" + this.youtubeGetId() + "?v=2&alt=jsonc",
                complete: function (f, c) {
                    try {
                        data = f.responseText;
                        if (typeof data == "string") {
                            data = a.parseJSON(data)
                        }
                        if (data.data.title) {
                            b.sendUpdate("config", {
                                title: data.data.title + " (" + data.data.uploader + ")"
                            })
                        }
                    } catch (d) { }
                    b.elementReady = true
                }
            })
        },
        youtubeGetId: function () {
            return encodeURIComponent(this.media.file.replace(/^[^v]+v.(.{11}).*/, "$1"))
        },
        updateInfo: function () {
            var b = this;
            clearTimeout(this._updateTimer);
            (function () {
                if (b.mediaElement == null) {
                    clearTimeout(b._updateTimer);
                    return
                }
                try {
                    if (b.getState() !== "IDLE" && b.getState() !== "COMPLETED") {
                        b.timeListener({
                            position: b.mediaElement.getCurrentTime(),
                            duration: b.mediaElement.getDuration()
                        });
                        b.progressListener({
                            loaded: b.mediaElement.getVideoBytesLoaded(),
                            total: b.mediaElement.getVideoBytesTotal()
                        })
                    }
                } catch (c) { }
                b._updateTimer = setTimeout(arguments.callee, 500)
            })()
        }
    };
    playerModelYTAUDIO.prototype = a.extend(true, {}, playerModelYTVIDEO.prototype, {
        applyMedia: function (b) {
            this.imageElement = this.applyImage(this.pp.getItemConfig("cover") || this.pp.getItemConfig("poster"), b);
            this._setBufferState("empty");
            this.mediaElement = new YT.Player(this.pp.getId() + "_media", {
                width: "100px",
                height: "100px",
                playerVars: {
                    autoplay: 1,
                    disablekb: 1,
                    start: 0,
                    controls: 0,
                    enablejsapi: 1,
                    playerapiid: this.pp.getId(),
                    origin: location.host
                },
                videoId: this.youtubeGetId(),
                events: {
                    onReady: "onReady" + this.pp.getId(),
                    onStateChange: "onStateChange" + this.pp.getId(),
                    onError: "onError" + this.pp.getId()
                }
            })
        }
    })
});
var playerModelNA = function () { };
jQuery(function (a) {
    playerModelNA.prototype = {
        hasGUI: true,
        applyMedia: function (b) {
            if (this.pp.getItemConfig("enableTestcard") && !this.pp.getIsMobileClient()) {
                this.setTestcard((this.media.file !== "" && this.media.errorCode === 7) ? 5 : this.media.errorCode);
                this.elementReady = true
            } else {
                this.elementReady = true;
                this.applyCommand("stop");
                window.location.href = this.media.file
            }
        },
        setPlay: function () {
            this.sendUpdate("start")
        },
        setPause: function () {
            if (this._hasEnded == false) {
                this._hasEnded = true;
                this.sendUpdate("ended")
            }
        }
    }
});
jQuery(function ($) {
    if ($.browser.msie) {
        (function () {
            if (! /*@cc_on!@*/
			0) {
                return
            }
            var e = "div,audio,video,source".split(",");
            document.createElement(e[0]);
            document.createElement(e[1]);
            document.createElement(e[2]);
            document.createElement(e[3]);
        })();
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function (obj, start) {
                for (var i = (start || 0), j = this.length; i < j; i++) {
                    if (this[i] == obj) {
                        return i
                    }
                }
                return -1
            }
        }
    }
    var projekktors = [];

    function Iterator(arr) {
        this.length = arr.length;
        this.each = function (fn) {
            $.each(arr, fn)
        };
        this.size = function () {
            return arr.length
        }
    }
    window.projekktor = window.$p = function () {
        var arg = arguments[0];
        var instance = null;
        if (!arguments.length) {
            return projekktors[0] || null
        }
        if (typeof arg == "number") {
            return projekktors[arg]
        }
        if (typeof arg == "string") {
            if (arg == "*") {
                return new Iterator(projekktors)
            }
            $.each(projekktors, function () {
                try {
                    if (this.getId() == arg.id || this.getId() == arg || this.getParent() == arg) {
                        instance = this
                    }
                } catch (e) { }
            });
            if (instance !== null) {
                return instance
            }
        }
        if (instance === null) {
            var cfg = arguments[1] || {};
            var callback = arguments[2] || {};
            if (typeof arg == "string") {
                var count = 0;
                var player;
                $.each($(arg), function () {
                    player = new PPlayer($(this), cfg, callback);
                    projekktors.push(player);
                    count++
                });
                return (count > 1) ? new Iterator(projekktors) : player
            } else {
                if (arg) {
                    projekktors.push(new PPlayer(arg, cfg, callback));
                    return new Iterator(projekktors)
                }
            }
        }
        return null;

        function PPlayer(srcNode, cfg, onReady) {
            this.config = $.extend({
                cookieName: "projekktor",
                cookieExpiry: 356,
                plugins: ["Display", "Controlbar"],
                version: "0.8.20",
                reelParser: function (data) {
                    return data
                },
                cssClassPrefix: "pp",
                platformPriority: ["native", "flash"],
                playerFlashMP4: "jarisplayer.swf",
                playerFlashMP3: "jarisplayer.swf",
                enableFlashFallback: true,
                enableNativePlayback: true,
                enableKeyboard: true,
                enableFullscreen: true,
                enableTestcard: true,
                bypassFlashFFFix: false,
                defaultPoster: "default-poster.jpg",
                forceFullViewport: false,
                sandBox: false,
                loop: false,
                autoplay: false,
                continuous: true,
                poster: false,
                title: "",
                loop: false,
                allowPlaybackFrom: [],
                dynamicTypeExtensions: false,
                FilePosterSeparator: ";",
                messages: {
                    0: "An error occurred.",
                    1: "You aborted the media playback. ",
                    2: "A network error caused the media download to fail part-way. ",
                    3: "The media playback was aborted due to a corruption problem. ",
                    4: "The media ({src}) could not be loaded because the server or network failed.",
                    5: "Sorry, your browser does not support the media format of the requested file ({type}).",
                    6: "Your client is in lack of the Flash Plugin V{flashver} or higher.",
                    7: "No media scheduled.",
                    8: "! Invalid media model configured !",
                    9: "File ({src}) not found.",
                    97: "No media scheduled.",
                    98: "Invalid or malformed playlist data!",
                    99: "Click display to proceed. ",
                    1000: "Copy this text and send it to your webmaster:"
                },
                debug: false,
                debugLevel: 1,
                desginGrid: "style/layout_grid.gif",
                designMode: false,
                ID: 0,
                controls: false,
                start: false,
                stop: false,
                volume: 0.5,
                cover: "",
                disablePause: false,
                disallowSkip: false,
                fixedVolume: false,
                imageScaling: "aspectratio",
                videoScaling: "fill",
                flashVideoModel: "videoflash",
                flashAudioModel: "audioflash",
                flashStreamType: "file",
                flashRTMPServer: "",
                flashVars: null,
                width: 0,
                height: 0,
                minHeight: 160,
                minWidth: 160
            }, cfg || {});
            this._dynCfg = ["ID", "title", "cover", "controls", "start", "stop", "volume", "poster", "disablePause", "disallowSkip", "fixedVolume", "imageScaling", "videoScaling", "flashVars", "flashAudioModel", "flashVideoModel", "playerFlashMP4", "playerFlashMP3", "flashStreamType", "flashRTMPServer"];
            this._persCfg = ["volume", "enableNativePlayback", "enableFlashFallback"];
            this._queue = [];
            this.env = {
                inFullscreen: false,
                playerStyle: null,
                scrollTop: null,
                scrollLeft: null,
                bodyOverflow: null,
                playerDom: null,
                mediaContainer: null,
                agent: "standard",
                mouseIsOver: false,
                loading: false,
                autoSize: false
            };
            this.mediaTypes = {
                0: {
                    ext: "NaN",
                    type: "none/none",
                    model: "NA",
                    platform: "native"
                },
                1: {
                    ext: "json",
                    type: "text/json",
                    model: "playlist",
                    platform: "internal"
                },
                2: {
                    ext: "xml",
                    type: "text/xml",
                    model: "playlist",
                    platform: "internal"
                },
                3: {
                    ext: "ogv",
                    type: "video/ogg",
                    model: "video",
                    platform: "native"
                },
                4: {
                    ext: "m4v",
                    type: "video/mp4",
                    model: "video",
                    platform: "flash"
                },
                5: {
                    ext: "webm",
                    type: "video/webm",
                    model: "video",
                    platform: "native"
                },
                6: {
                    ext: "ogg",
                    type: "video/ogg",
                    model: "video",
                    platform: "native"
                },
                7: {
                    ext: "anx",
                    type: "video/ogg",
                    model: "video",
                    platform: "native"
                },
                8: {
                    ext: "jpg",
                    type: "image/jpeg",
                    model: "image",
                    platform: "native"
                },
                9: {
                    ext: "gif",
                    type: "image/gif",
                    model: "image",
                    platform: "native"
                },
                10: {
                    ext: "png",
                    type: "image/png",
                    model: "image",
                    platform: "native"
                },
                11: {
                    ext: "flv",
                    type: "video/x-flv",
                    model: "videoflash",
                    platform: "flash",
                    fixed: true
                },
                12: {
                    ext: "flv",
                    type: "video/flv",
                    model: "videoflash",
                    platform: "flash",
                    fixed: true
                },
                13: {
                    ext: "mp4",
                    type: "video/mp4",
                    model: "videoflash",
                    platform: "flash"
                },
                14: {
                    ext: "mov",
                    type: "video/quicktime",
                    model: "videoflash",
                    platform: "flash"
                },
                15: {
                    ext: "youtube.com",
                    type: "video/youtube",
                    model: "ytvideo",
                    platform: "flash",
                    fixed: "maybe"
                },
                16: {
                    ext: "youtube.com",
                    type: "audio/youtube",
                    model: "ytaudio",
                    platform: "flash",
                    fixed: "maybe"
                },
                17: {
                    ext: "ogg",
                    type: "audio/ogg",
                    model: "audio",
                    platform: "native"
                },
                18: {
                    ext: "oga",
                    type: "audio/ogg",
                    model: "audio",
                    platform: "native"
                },
                19: {
                    ext: "mp3",
                    type: "audio/mp3",
                    model: "audioflash",
                    platform: "native"
                },
                20: {
                    ext: "html",
                    type: "text/html",
                    model: "html",
                    platform: "internal"
                }
            };
            this.media = [null];
            this.plugins = [];
            this.listeners = [];
            this.mediaGrid = {};
            this.playerModel = {};
            this._isReady = false;
            this._currentItem = 0;
            this._playlistServer = "";
            this._id = "";
            this.getFromUrl = function (url, dest, callback, customParser) {
                var dataType = null,
					data = null,
					ref = this;
                if (dest == ref) {
                    this._bubbleEvent("scheduleLoading", 1 + this.getItemCount())
                }
                $.ajax({
                    url: url,
                    complete: function (xhr, status) {
                        dataType = (xhr.getResponseHeader("Content-Type").indexOf("xml") > -1) ? "xml" : null;
                        dataType = (xhr.getResponseHeader("Content-Type").indexOf("json") > -1 && dataType === null) ? "json" : dataType;
                        switch (dataType) {
                            case "xml":
                                if (window.DOMParser) {
                                    data = DOMParser().parseFromString(xhr.responseText, "text/xml")
                                } else {
                                    data = new ActiveXObject("Microsoft.XMLDOM");
                                    data.async = "false";
                                    data.loadXML(xhr.responseText)
                                }
                                break;
                            case "json":
                                data = xhr.responseText;
                                if (typeof data == "string") {
                                    data = $.parseJSON(data)
                                }
                                break;
                            default:
                                data = xhr.responseText;
                                break
                        }
                        if (dest === ref) {
                            try {
                                data = customParser(data, xhr.responseText)
                            } catch (e) { }
                        }
                        dest[callback](data)
                    },
                    error: function (data) {
                        dest[callback](false)
                    }
                });
                return this
            };
            this._reelUpdate = function (obj) {
                this.env.loading = true;
                if (typeof obj != "object") {
                    obj = [{
                        file: "none",
                        type: "NA",
                        errorCode: 98
                    }]
                } else {
                    try {
                        if (obj.length == 0) {
                            obj = [{
                                file: "none",
                                type: "NA",
                                errorCode: 97
                            }]
                        }
                    } catch (e) { }
                }
                var ref = this;
                var data = obj;
                this.media = [];
                try {
                    var changes = false;
                    for (var props in data.config) {
                        if (typeof data.config[props].indexOf("objectfunction") > -1) {
                            continue
                        }
                        this.config[props] = this._cleanValue(data.config[props]);
                        changes = true
                    }
                    delete (data.config);
                    if (changes === true) {
                        this._debug("Updated config var: " + props + " to " + this.config[props]);
                        this._bubbleEvent("configModified")
                    }
                } catch (e) { }
                var files = data.playlist || data;
                for (var item in files) {
                    if (typeof files[item] == "function") {
                        continue
                    }
                    if (typeof files[item] == undefined) {
                        continue
                    }
                    if (files[item]) {
                        this._addItem(this._prepareMedia({
                            file: files[item],
                            config: files[item].config || {},
                            errorCode: files[item].errorCode
                        }))
                    }
                }
                this.env.loading = false;
                this._bubbleEvent("scheduled", this.getItemCount());
                this._syncPlugins(function () {
                    ref.setActiveItem(0)
                })
            };
            this._addItem = function (data, idx, replace) {
                var resultIdx = 0;
                if (this.media.length === 1 && this.media[0].mediaModel == "NA") {
                    this._detachplayerModel();
                    this.media = []
                }
                if (idx === undefined || idx < 0 || idx > this.media.length - 1) {
                    this.media.push(data);
                    resultIdx = this.media.length - 1
                } else {
                    this.media.splice(idx, (replace === true) ? 1 : 0, data);
                    resultIdx = idx
                }
                if (this.env.loading === false) {
                    this._bubbleEvent("scheduleModified", this.getItemCount())
                }
                return resultIdx
            };
            this._removeItem = function (idx) {
                var resultIdx = 0;
                if (this.media.length === 1) {
                    if (this.media[0].mediaModel == "NA") {
                        return 0
                    } else {
                        this.media[0] = this._prepareMedia({
                            file: ""
                        });
                        return 0
                    }
                }
                if (idx === undefined || idx < 0 || idx > this.media.length - 1) {
                    this.media.pop();
                    resultIdx = this.media.length
                } else {
                    this.media.splice(idx, 1);
                    resultIdx = idx
                }
                if (this.env.loading === false) {
                    this._bubbleEvent("scheduleModified", this.getItemCount())
                }
                return resultIdx
            };
            this._prepareMedia = function (data) {
                var mediaFile = "",
					indexChoosen = 0,
					mediaType = "",
					mediaModel = "NA",
					fileExt = "",
					extTypes = {},
					typesModels = {},
					errorCode = data.errorCode || 7,
					lastLevel = 100;
                var extRegEx = [];
                for (var i in this.mediaTypes) {
                    extRegEx.push("." + this.mediaTypes[i].ext);
                    extTypes[this.mediaTypes[i].ext] = this.mediaTypes[i];
                    typesModels[this.mediaTypes[i].type] = this.mediaTypes[i]
                }
                extRegEx = "^.*.(" + extRegEx.join("|") + ")$";
                if (typeof data.file == "string") {
                    data.file = [{
                        src: data.file
                    }];
                    if (typeof data.type == "string") {
                        data.file = [{
                            src: data.file,
                            type: data.type
                        }]
                    }
                }
                if (data.file === false) {
                    data.file = [{
                        src: ""
                    }]
                }
                try {
                    var dynConf = this.config.dynamicTypeExtensions;
                    var tagsUsed, tag, filename;
                    if (dynConf) {
                        filename = data.file[0].src + "";
                        if (data.file.length == 1) {
                            for (var j in dynConf) {
                                if (filename.match("{*}")) {
                                    if (!data.file[j]) {
                                        data.file[j] = {}
                                    }
                                    data.file[j].src = filename.replace("{*}", dynConf[j].ext);
                                    for (var k in dynConf[j]) {
                                        if (k == "ext") {
                                            continue
                                        }
                                        data.file[j][k] = dynConf[j][k]
                                    }
                                }
                            }
                        }
                    }
                    for (var i in data.file) {
                        tagsUsed = data.file[0][i].src.match(/\{[a-z\*]*\}/gi);
                        tag = "";
                        if (tagsUsed) {
                            for (var i = 0; i < tagsUsed.length; i++) {
                                tag = tagsUsed[i].replace("{", "").replace("}", "");
                                if (this.getItemConfig(tag) !== false) {
                                    data.file[0][i].src = data.file[0][i].src.replace("{" + tag + "}", this.getItemConfig(tag))
                                } else {
                                    data.file[0][i].src = data.file[0][i].src.replace("{" + tag + "}", "")
                                }
                            }
                        }
                    }
                } catch (e) { }
                var sourceObj = {};
                for (var index in data.file) {
                    if (index == "config") {
                        continue
                    }
                    sourceObj = data.file[index];
                    if (typeof sourceObj == "string") {
                        sourceObj = {
                            src: sourceObj
                        }
                    }
                    if (sourceObj.src == undefined) {
                        continue
                    }
                    try {
                        fileExt = sourceObj.src.match(new RegExp(extRegEx))[1];
                        fileExt = (!fileExt) ? "NaN" : fileExt.replace(".", "")
                    } catch (e) {
                        fileExt = "NaN"
                    }
                    if (sourceObj.type === undefined || sourceObj.type === "") {
                        if (extTypes[fileExt]) {
                            $.extend(sourceObj, extTypes[fileExt])
                        }
                    } else {
                        try {
                            var codecMatch = sourceObj.type.split(" ").join("").split(/[\;]codecs=.([a-zA-Z0-9\,]*)[\'|\"]/i);
                            if (codecMatch[1] !== undefined) {
                                sourceObj.codec = codecMatch[1];
                                sourceObj.type = codecMatch[0]
                            }
                        } catch (e) { }
                        if (typesModels[sourceObj.type]) {
                            $.extend(sourceObj, typesModels[sourceObj.type])
                        }
                    }
                    if (lastLevel === 100) {
                        mediaFile = sourceObj.src
                    }
                    if (lastLevel > this.config.platformPriority.indexOf(sourceObj.platform) && this.mediaGrid[sourceObj.type] != "NA") {
                        lastLevel = this.config.platformPriority.indexOf(sourceObj.platform);
                        try {
                            mediaModel = this.mediaGrid[sourceObj.type].toUpperCase()
                        } catch (e) {
                            mediaModel = "NA"
                        }
                        mediaFile = sourceObj.src;
                        mediaType = sourceObj.type;
                        indexChoosen = index
                    }
                    if (index === "src") {
                        break
                    }
                }
                try {
                    if (typeof eval("playerModel" + mediaModel) !== "function") {
                        mediaModel = "NA";
                        errorCode = 0
                    } else {
                        if (data.config.flashStreamType == "rtmp" && mediaModel.indexOf("FLASH") == -1) {
                            mediaModel += "FLASH"
                        }
                    }
                } catch (e) { }
                var block = 0;
                if (this.config.allowPlaybackFrom.length > 0) {
                    for (var i = 0; i < this.config.allowPlaybackFrom.length; i++) {
                        if (mediaFile.indexOf(this.config.allowPlaybackFrom[i]) > -1) {
                            block++
                        }
                    }
                    if (block == 0) {
                        mediaFile = ""
                    }
                }
                data._originalConfig = data.file;
                data.fileConfig = data.file[indexChoosen];
                data.file = this.toAbsoluteURL(mediaFile);
                data.mediaModel = mediaModel;
                data.mediaType = mediaType;
                data.errorCode = errorCode;
                data.ID = this.randomId(8);
                data._VALIDATED = true;
                data.config = data.config || {};
                this._debug("Set item of type: " + mediaType + " Model: " + data.mediaModel + " File:" + data.file + " Priority: " + lastLevel);
                return data
            };
            this._modelUpdateListener = function (type, value) {
                var ref = this;
                if (!this.playerModel.init) {
                    return
                }
                if (type != "time" && type != "progress") {
                    this._debug("Received model Update: '" + type + "' (" + value + ") while handling '" + this.playerModel.getFile() + "' using '" + this.playerModel.getModelName() + "'")
                }
                switch (type) {
                    case "state":
                        this._bubbleEvent("state", value);
                        switch (value) {
                            case "IDLE":
                                break;
                            case "AWAKENING":
                                break;
                            case "BUFFERING":
                                break;
                            case "ERROR":
                                this._bubbleEvent("error", {});
                                break;
                            case "PLAYING":
                                break;
                            case "STOPPED":
                                this._bubbleEvent("stopped", {});
                                break;
                            case "PAUSED":
                                if (this.getItemConfig("disablePause") === true) {
                                    this.playerModel.applyCommand("play", 0)
                                }
                                break;
                            case "COMPLETED":
                                if (this._currentItem + 1 >= this.media.length) {
                                    this._bubbleEvent("done", {})
                                }
                                this.setActiveItem("next");
                                break
                        }
                        break;
                    case "buffer":
                        this._bubbleEvent("buffer", value);
                        this._bubbleEvent("time", value);
                        break;
                    case "modelReady":
                        this._bubbleEvent("item", ref._currentItem);
                        break;
                    case "displayReady":
                        this._bubbleEvent("displayReady", true);
                        this._addGUIListeners();
                        this._syncPlugins();
                        break;
                    case "FFreinit":
                        break;
                    case "seek":
                        this._bubbleEvent("seek", {
                            dest: value
                        });
                        break;
                    case "volume":
                        this.setItemConfig({
                            volume: value
                        });
                        this._bubbleEvent("volume", value);
                        break;
                    case "progress":
                        this._bubbleEvent("progress", value);
                        break;
                    case "time":
                        this._bubbleEvent("time", value);
                        break;
                    case "fullscreen":
                        this._bubbleEvent("fullscreen", value);
                        break;
                    case "resize":
                        this.playerModel.applyCommand("resize");
                        this._bubbleEvent("resize", value);
                        break;
                    case "playlist":
                        this.setFile(value, true);
                        break;
                    case "config":
                        this.setItemConfig(value);
                        break;
                    case "scaled":
                        if (this.env.autoSize === true) {
                            this.env.playerDom.css({
                                height: value.realHeight + "px",
                                width: value.realWidth + "px"
                            });
                            this._bubbleEvent("resize", value);
                            this.env.autoSize = false;
                            break
                        }
                        this._bubbleEvent("scaled", value);
                        break
                }
            };
            this._syncPlugins = function (callback) {
                var ref = this;
                this.env.loading = true;
                (function () {
                    try {
                        if (ref.plugins.length > 0) {
                            for (var i = 0; i < ref.plugins.length; i++) {
                                if (ref.plugins[i].pluginReady !== true) {
                                    setTimeout(arguments.callee, 50);
                                    return
                                }
                            }
                        }
                        ref.env.loading = false;
                        ref._bubbleEvent("pluginsReady", {});
                        if (ref._isReady === true) {
                            ref._bubbleEvent("ready", {})
                        }
                        try {
                            callback()
                        } catch (e) { }
                    } catch (e) { }
                })()
            };
            this._addGUIListeners = function () {
                var ref = this;
                this.env.playerDom.unbind();
                this.env.playerDom.mousemove(function (event) {
                    ref._displayMousemoveListener(event)
                });
                this.env.playerDom.mouseenter(function (event) {
                    ref._displayMouseEnterListener(event)
                });
                this.env.playerDom.mouseleave(function (event) {
                    ref._displayMouseLeaveListener(event)
                });
                if (this.config.enableKeyboard === true) {
                    if (!$.browser.mozilla) {
                        $(document.documentElement).unbind("keydown.pp" + this._id);
                        $(document.documentElement).bind("keydown.pp" + this._id, function (evt) {
                            ref._keyListener(evt)
                        })
                    } else {
                        $(document.documentElement).unbind("keypress.pp" + this._id);
                        $(document.documentElement).bind("keypress.pp" + this._id, function (evt) {
                            ref._keyListener(evt)
                        })
                    }
                }
            };
            this._removeGUIListeners = function () {
                $("#" + this.getId()).unbind();
                this.env.playerDom.unbind()
            };
            this._registerPlugins = function () {
                if (this.config.plugins.length > 0 && this.plugins.length == 0) {
                    for (var i = 0; i < this.config.plugins.length; i++) {
                        var pluginName = "projekktor" + this.config.plugins[i];
                        try {
                            typeof eval(pluginName)
                        } catch (e) {
                            continue
                        }
                        var pluginObj = $.extend(true, {}, new projekktorPluginInterface(), eval(pluginName).prototype);
                        pluginObj.name = this.config.plugins[i].toLowerCase();
                        pluginObj.pp = this;
                        pluginObj.playerDom = this.env.playerDom;
                        pluginObj._init(this.config["plugin_" + this.config.plugins[i].toLowerCase()] || {});
                        this.plugins.push(pluginObj)
                    }
                }
            };
            this._unbindPlugins = function (rmvPl) {
                if (this.plugins.length == 0) {
                    return
                }
                var pluginsToRemove = rmvPl || [];
                for (var j = 0; j < this.plugins.length; j++) {
                    if ($.inArray(j, pluginsToRemove) || pluginsToRemove.length === 0) {
                        $(this.plugins[j]).unbind()
                    }
                }
            };
            this._bubbleEvent = function (evt, value) {
                var event = evt,
					pluginData = {};
                if (typeof event == "object") {
                    if (!event._plugin) {
                        return
                    }
                    value.PLUGIN = event._plugin + "";
                    value.EVENT = event._event + "";
                    event = "pluginevent"
                }
                if (event != "time" && event != "progress" && event != "mousemove") {
                    this._debug("Fireing :" + event)
                }
                if (this.plugins.length > 0) {
                    for (var i in this.plugins) {
                        try {
                            this.plugins[i][event + "Handler"](value, this)
                        } catch (e) { }
                    }
                }
                if (this.listeners.length > 0) {
                    for (var i in this.listeners) {
                        try {
                            if (this.listeners[i]["event"] == event || this.listeners[i]["event"] == "*") {
                                this.listeners[i]["callback"](value, this)
                            }
                        } catch (e) { }
                    }
                }
            };
            this._detachplayerModel = function () {
                try {
                    $(this).unbind();
                    this._unbindPlugins();
                    this._removeGUIListeners();
                    this.playerModel.destroy()
                } catch (e) {
                    this.playerModel = new playerModel();
                    this.playerModel._init({
                        pp: this,
                        autoplay: false
                    })
                }
                this._bubbleEvent("detach", {})
            };
            this._displayMousemoveListener = function (evt) {
                this._bubbleEvent("mousemove", {})
            };
            this._displayMouseEnterListener = function (evt) {
                this._bubbleEvent("mouseenter", {});
                this.env.mouseIsOver = true;
                if ($.browser.msie) {
                    evt.cancelBubble = true
                } else {
                    evt.stopPropagation()
                }
            };
            this._displayMouseLeaveListener = function (evt) {
                this._bubbleEvent("mouseleave", {});
                this.env.mouseIsOver = false;
                if ($.browser.msie) {
                    evt.cancelBubble = true
                } else {
                    evt.stopPropagation()
                }
            };
            this._keyListener = function (evt) {
                if (this.env.mouseIsOver !== true) {
                    return false
                }
                if ($.browser.msie) {
                    evt.cancelBubble = true
                } else {
                    evt.stopPropagation()
                }
                evt.preventDefault();
                this._debug("Keypress: " + evt.keyCode);
                this._bubbleEvent("key", evt.keyCode);
                switch (evt.keyCode) {
                    case 27:
                        this.setFullscreen(false);
                        break;
                    case 13:
                        this.setFullscreen(true);
                        break;
                    case 39:
                        this.setActiveItem("next");
                        break;
                    case 37:
                        this.setActiveItem("previous");
                        break;
                    case 0:
                        this.setPlayPause();
                        break
                }
                return false
            };
            this._enterFullViewport = function () {
                if (this.env.inFullscreen === true) {
                    return
                }
                this.env.scrollTop = $(window).scrollTop();
                this.env.scrollLeft = $(window).scrollLeft();
                this.env.playerStyle = this.env.playerDom.attr("style");
                this.env.bodyOverflow = $("body").css("overflow");
                $(window).scrollTop(0);
                $(window).scrollLeft(0);
                $("body").css("overflow", "hidden");
                this.env.playerDom.css({
                    position: "fixed",
                    display: "block",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 99997
                });
                this.env.inFullscreen = true
            };
            this._exitFullViewport = function () {
                if (this.env.inFullscreen === false) {
                    return
                }
                this.env.playerDom.attr("style", this.env.playerStyle);
                $("body").css("overflow", this.env.bodyOverflow);
                $(window).scrollTop(this.env.scrollTop);
                $(window).scrollLeft(this.env.scrollLef);
                this.env.inFullscreen = false
            };
            this._enterSandboxFullViewport = function () {
                if (this.env.inFullscreen === true) {
                    return
                }
                var win = this.getSandboxWindow();
                var iframe = this.getSandboxIframe();
                if (!win || !iframe) {
                    return
                }
                this.env.scrollTop = win.scrollTop();
                this.env.scrollLeft = win.scrollLeft();
                this.env.playerStyle = iframe.attr("style");
                this.env.sandBoxWidth = iframe.attr("width");
                this.env.sandBoxHeight = iframe.attr("height");
                this.env.bodyOverflow = $(win[0].document.body).css("overflow");
                win.scrollTop(0);
                win.scrollLeft(0);
                $(win[0].document.body).css("overflow", "hidden");
                iframe.css({
                    position: "fixed",
                    display: "block",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 9999
                });
                this.env.inFullscreen = true
            };
            this._exitSandboxFullViewport = function () {
                if (this.env.inFullscreen === false) {
                    return
                }
                var win = this.getSandboxWindow();
                var iframe = this.getSandboxIframe();
                if (!win || !iframe) {
                    return
                }
                win.scrollTop(this.env.scrollTop);
                win.scrollLeft(this.env.scrollLef);
                $(win[0].document.body).css("overflow", this.env.bodyOverflow);
                iframe.attr("width", this.env.sandBoxWidth + "px");
                iframe.attr("height", this.env.sandBoxHeight + "px");
                iframe.attr("style", (this.env.playerStyle == undefined) ? "" : this.env.playerStyle);
                this.env.inFullscreen = false
            };
            this.getItemConfig = function (name, itemIdx) {
                var idx = itemIdx || this._currentItem;
                var result = false;
                if (this.config[name] !== undefined) {
                    result = this.config[name];
                    if ($.inArray(name, this._persCfg) > -1) {
                        if (this._cookie(name) !== null) {
                            result = this._cookie(name)
                        }
                    }
                    if ($.inArray(name, this._dynCfg) > -1 || name.indexOf("plugin_") > -1) {
                        try {
                            if (this.media[idx]["config"][name] !== undefined && this.media[idx]["config"][name] !== false) {
                                result = this.media[idx]["config"][name]
                            }
                        } catch (e) { }
                    }
                } else {
                    try {
                        if (this.media[idx]["config"][name]) {
                            result = this.media[idx]["config"][name]
                        }
                    } catch (e) { }
                }
                return result
            };
            this.getItemCount = function () {
                return this.media.length
            };
            this.getState = function () {
                try {
                    return this.playerModel.getState()
                } catch (e) {
                    return "IDLE"
                }
            };
            this.getIsAutoslide = function () {
                return this.playerModel.getIsAutoslide()
            };
            this.getLoadProgress = function () {
                try {
                    return this.playerModel.getLoadProgress()
                } catch (e) {
                    return 0
                }
            };
            this.getKbPerSec = function () {
                try {
                    return this.playerModel.getKbPerSec()
                } catch (e) {
                    return 0
                }
            };
            this.getItemId = function (idx) {
                if (this.config.poster === undefined) {
                    if (idx == undefined) {
                        return this.media[this._currentItem].ID
                    }
                    return this.media[idx].ID
                } else {
                    if (idx == undefined) {
                        return this.media[this._currentItem + 1].ID
                    }
                    return this.media[idx + 1].ID
                }
            };
            this.getItemIdx = function () {
                return this._currentItem
            };
            this.getItem = function () {
                arg = arguments[0] || "current";
                switch (arg) {
                    case "next":
                        return $.extend(true, [], this.media[this._currentItem + 1]);
                    case "prev":
                        return $.extend(true, [], this.media[this._currentItem - 1]);
                    case "current":
                        return $.extend(true, [], this.media[this._currentItem]);
                    case "*":
                        return $.extend(true, [], this.media);
                    default:
                        return $.extend(true, [], this.media[arg])
                }
            };
            this.getVolume = function () {
                return (this.getItemConfig("fixedVolume") === true) ? this.config.volume : this.getItemConfig("volume")
            };
            this.getTrackId = function () {
                if (this.getItemConfig("trackId")) {
                    return this.config.trackId
                }
                if (this._playlistServer != null) {
                    return "pl" + this._currentItem
                }
                return null
            };
            this.getLoadPlaybackProgress = function () {
                try {
                    return this.playerModel.getLoadPlaybackProgress()
                } catch (e) {
                    return 0
                }
            };
            this.getDuration = function () {
                try {
                    return this.playerModel.getDuration()
                } catch (e) {
                    return 0
                }
            };
            this.getPosition = function () {
                try {
                    return this.playerModel.getPosition() || 0
                } catch (e) {
                    return 0
                }
            };
            this.getTimeLeft = function () {
                try {
                    return this.playerModel.getDuration() - this.playerModel.getPosition()
                } catch (e) {
                    return this.media[this._currentItem].duration
                }
            };
            this.getInFullscreen = function () {
                return this.env.inFullscreen
            };
            this.getMediaContainer = function () {
                if (this.env.mediaContainer == null) {
                    this.env.mediaContainer = $("#" + this.getMediaId())
                }
                if (this.env.mediaContainer.length == 0) {
                    if (this.env.playerDom.find("." + this.config.cssClassPrefix + "display").length > 0) {
                        this.env.mediaContainer = $(document.createElement("div")).attr({
                            id: this.getId() + "_media"
                        }).css({
                            position: "absolute",
                            overflow: "hidden",
                            height: "100%",
                            width: "100%",
                            top: 0,
                            left: 0,
                            padding: 0,
                            margin: 0,
                            display: "block"
                        }).appendTo(this.env.playerDom.find("." + this.config.cssClassPrefix + "display"))
                    } else {
                        this.env.mediaContainer = $(document.createElement("div")).attr({
                            id: this.getMediaId()
                        }).css({
                            width: "1px",
                            height: "1px"
                        }).appendTo($(document.body))
                    }
                }
                return this.env.mediaContainer
            };
            this.getMediaId = function () {
                return this.getId() + "_media"
            };
            this.getMediaType = function () {
                return this.media[this._currentItem].mediaType
            };
            this.getUsesFlash = function () {
                return (this.playerModel.requiresFlash !== false)
            };
            this.getModel = function () {
                try {
                    return this.media[this._currentItem].mediaModel
                } catch (e) {
                    return "NA"
                }
            };
            this.getSandboxWindow = function () {
                try {
                    return $(parent.window)
                } catch (e) {
                    return false
                }
            };
            this.getSandboxIframe = function () {
                try {
                    return window.$(frameElement)
                } catch (e) {
                    return false
                }
            };
            this.getPlaylist = function () {
                return this.getItem("*")
            };
            this.getFlashVersion = function () {

                return "6,0,0";
            };
            this.getCanPlayNatively = function (type) {
                var checkFor = [];
                compTable = this._testMediaSupport(true);
                if (typeof type == "string") {
                    checkFor.push(type)
                }
                if (typeof type == "array") {
                    checkFor = type
                }
                for (var i in this.mediaGrid) {
                    if (compTable[i] == "video" || compTable[i] == "audio") {
                        if (arguments.length === 0) {
                            return true
                        } else {
                            if ($.inArray(i, checkFor) > -1) {
                                return true
                            }
                        }
                    }
                }
                return false
            };
            this.getId = function () {
                return this._id
            };
            this.getCssClass = function () {
                return this.config.cssClassPrefix
            };
            this.getPlayerDimensions = function () {
                return {
                    width: this.config.width,
                    height: this.config.height
                }
            };
            this.getMediaDimensions = function () {
                return {
                    width: this.config.width,
                    height: this.config.height
                }
            };
            this.setActiveItem = function (mixedData) {
                var newItem = 0;
                var lastItem = this._currentItem;
                if (this.env.loading === true) {
                    return this
                }
                if (typeof mixedData == "string") {
                    switch (mixedData) {
                        case "previous":
                            if (this.getItemConfig("disallowSkip") == true && this.getState() !== "COMPLETED") {
                                return this
                            }
                            newItem = this._currentItem - 1;
                            break;
                        case "next":
                            if (this.getItemConfig("disallowSkip") == true && this.getState() !== "COMPLETED") {
                                return this
                            }
                            newItem = this._currentItem + 1;
                            break;
                        default:
                        case "poster":
                            result = 0;
                            break
                    }
                } else {
                    if (typeof mixedData == "number") {
                        newItem = parseInt(mixedData)
                    } else {
                        newItem = 0
                    }
                }
                if (newItem != this._currentItem) {
                    if (this.getItemConfig("disallowSkip") == true && this.getState() !== "COMPLETED") {
                        return this
                    }
                    this._detachplayerModel()
                }
                var ap = false;
                if (newItem === 0 && lastItem == 0 && this.config.autoplay === true) {
                    ap = true
                } else {
                    if (this.getItemCount() > 1 && newItem != lastItem && this.config.continuous === true && newItem < this.getItemCount()) {
                        ap = true
                    }
                }
                if (newItem >= this.getItemCount() || newItem < 0) {
                    ap = this.config.loop;
                    newItem = 0
                }
                this._currentItem = newItem;
                var newModel = this.media[this._currentItem].mediaModel;
                if (newModel == "AUDIOFLASH") {
                    newModel = this.getItemConfig("flashAudioModel")
                } else {
                    if (newModel == "VIDEOFLASH") {
                        newModel = this.getItemConfig("flashVideoModel")
                    }
                }
                newModel = newModel.toUpperCase();
                try {
                    typeof eval("playerModel" + newModel)
                } catch (e) {
                    newModel = "NA";
                    this.media[this._currentItem].mediaModel = newModel;
                    this.media[this._currentItem].errorCode = 8
                }
                this.playerModel = new playerModel();
                this.playerModel = $.extend(true, {}, new playerModel(), eval("playerModel" + newModel).prototype);
                this.playerModel._init({
                    media: $.extend(true, {}, this.media[this._currentItem]),
                    model: newModel,
                    pp: this,
                    environment: $.extend(true, {}, this.env),
                    autoplay: ap
                });
                return this
            };
            this._enqueue = function (command, params) {
                this._queue.push({
                    command: command,
                    params: params
                });
                this._processQueue()
            };
            this._clearqueue = function (command, params) {
                if (this._isReady !== true) {
                    return
                }
                this._queue = []
            };
            this._processQueue = function () {
                var ref = this,
					modelReady = false;
                if (this._processing === true) {
                    return
                }
                if (this.env.loading === true) {
                    return
                }
                this._processing = true;
                (function () {
                    modelReady = false;
                    try {
                        modelReady = ref.playerModel.getIsReady()
                    } catch (e) { }
                    if (ref.env.loading !== true && modelReady) {
                        var msg = ref._queue.shift();
                        if (!msg) {
                            ref._processing = false;
                            if (ref._isReady === false) {
                                ref._bubbleEvent("ready", true);
                                ref._isReady = true
                            }
                            return
                        }
                        if (typeof msg.command == "string") {
                            ref.playerModel.applyCommand(msg.command, msg.params)
                        } else {
                            msg.command()
                        }
                        arguments.callee();
                        return
                    }
                    setTimeout(arguments.callee, 50)
                })()
            };
            this.getIsLastItem = function () {
                return ((this._currentItem == this.media.length - 1) && this.config.loop !== true)
            };
            this.getIsFirstItem = function () {
                return ((this._currentItem == 0) && this.config.loop !== true)
            };
            this.getIsMobileClient = function () {
                var uagent = navigator.userAgent.toLowerCase();
                var mobileAgents = ["android", "windows ce", "blackberry", "palm", "mobile"];
                for (var i = 0; i < mobileAgents.length; i++) {
                    if (uagent.indexOf(mobileAgents[i]) > -1) {
                        return true
                    }
                }
                return false
            };
            this.setPlay = function () {
                this._enqueue("play", false);
                return this
            };
            this.setPause = function () {
                this._enqueue("pause", false);
                return this
            };
            this.setStop = function (toZero) {
                var ref = this;
                this._enqueue("stop", false);
                if (toZero) {
                    this._enqueue(function () {
                        ref._currentItem = 0;
                        ref.setActiveItem(0)
                    })
                }
                return this
            };
            this.setPlayPause = function () {
                if (this.getState() !== "PLAYING") {
                    this.setPlay()
                } else {
                    this.setPause()
                }
                return this
            };
            this.setVolume = function (vol) {
                if (this.getItemConfig("fixedVolume") == true) {
                    return this
                }
                if (typeof vol == "string") {
                    var dir = vol.substr(0, 1);
                    vol = parseFloat(vol.substr(1));
                    vol = (vol > 1) ? vol / 100 : vol;
                    if (dir == "+") {
                        vol = this.getVolume() + vol
                    } else {
                        if (dir == "-") {
                            vol = this.getVolume() - vol
                        } else {
                            vol = this.getVolume()
                        }
                    }
                }
                if (typeof vol == "number") {
                    vol = (vol > 1) ? 1 : vol;
                    vol = (vol < 0) ? 0 : vol;
                    this._enqueue("volume", vol)
                }
                return this
            };
            this.setPlayhead = function (position) {
                if (this.getItemConfig("disallowSkip") == true) {
                    return this
                }
                if (typeof position == "string") {
                    var dir = position.substr(0, 1);
                    position = parseFloat(position.substr(1));
                    if (dir == "+") {
                        position = this.getPosition() + position
                    } else {
                        if (dir == "-") {
                            position = this.getPosition() - position
                        } else {
                            position = this.getPosition()
                        }
                    }
                }
                if (typeof position == "number") {
                    this._enqueue("seek", position)
                }
                return this
            };
            this.setPlayerPoster = function (url) {
                var ref = this;
                this._enqueue(function () {
                    ref.setItemConfig({
                        poster: url
                    }, 0)
                });
                return this
            };
            this.setItemConfig = function () {
                var ref = this;
                var args = arguments;
                this._enqueue(function () {
                    ref._setItemConfig(args[0] || null, args[1] || null)
                });
                return this
            };
            this._setItemConfig = function () {
                if (!arguments.length) {
                    return result
                }
                var confObj = arguments[0];
                var dest = "*";
                if (typeof confObj != "object") {
                    return this
                }
                if (arguments[1] == "string" || arguments[1] == "number") {
                    dest = arguments[1]
                } else {
                    dest = this._currentItem
                }
                var value = false;
                for (var i in confObj) {
                    if ($.inArray(i, this._persCfg) > -1) {
                        this._cookie(i, this._cleanValue(confObj[i]))
                    }
                    if ($.inArray(i, this._dynCfg) === -1) {
                        continue
                    }
                    value = this._cleanValue(confObj[i]);
                    if (dest == "*") {
                        $.each(this.media, function () {
                            if (this.config == undefined) {
                                this.config = {}
                            }
                            this.config[i] = value
                        });
                        continue
                    }
                    if (this.media[dest] == undefined) {
                        return this
                    }
                    if (this.media[dest]["config"] == undefined) {
                        this.media[dest]["config"] = {}
                    }
                    this.media[dest]["config"][i] = value
                }
                return this
            };
            this.setFullscreen = function (full) {
                if (full == this.getInFullscreen() || !this.config.enableFullscreen || this.getIsMobileClient()) {
                    return this
                }
                if (this.config.sandBox !== false) {
                    if (full == true) {
                        this._enterSandboxFullViewport()
                    } else {
                        this._exitSandboxFullViewport()
                    }
                } else {
                    if (full == true) {
                        this._enterFullViewport()
                    } else {
                        this._exitFullViewport()
                    }
                }
                this.playerModel.applyCommand("fullscreen", full);
                return this
            };
            this.setResize = function () {
                this._modelUpdateListener("resize");
                return this
            };
            this.addListener = function (evt, callback) {
                var ref = this;
                this._enqueue(function () {
                    ref._addListener(evt, callback)
                })
            };
            this._addListener = function (evt, callback) {
                var listenerObj = {
                    event: evt,
                    callback: callback
                };
                this.listeners.push(listenerObj);
                return this
            };
            this.removeListener = function (evt, callback) {
                var len = this.listeners.length;
                for (var i = 0; i < len; i++) {
                    if (this.listeners[i].event != evt && evt !== "*") {
                        continue
                    }
                    if (this.listeners[i].callback != callback && callback !== undefined) {
                        continue
                    }
                    this.listeners.splice(i, 1)
                }
                return this
            };
            this.setItem = function () {
                var itemData = arguments[0];
                var affectedIdx = 0;
                this._clearqueue();
                if (this.env.loading === true) {
                    return this
                }
                if (itemData == null) {
                    affectedIdx = this._removeItem(arguments[1]);
                    if (affectedIdx === this._currentItem) {
                        this.setActiveItem("previous")
                    }
                } else {
                    affectedIdx = this._addItem(this._prepareMedia({
                        file: itemData,
                        config: itemData.config || {}
                    }), arguments[1], arguments[2]);
                    if (affectedIdx === this._currentItem) {
                        this.setActiveItem(this._currentItem)
                    }
                }
                return this
            };
            this.setFile = function (arg, ext, dt) {
                var data = arg || {};
                var externalData = ext || false;
                var result = {};
                var dataType = dt || false;
                this._clearqueue();
                if (this.env.loading === true) {
                    return this
                }
                if (typeof data == "object" && data.length == 0) {
                    return false
                }
                this.env.loading = true;
                this._detachplayerModel();
                if (typeof data == "object") {
                    if (data.length == 0) {
                        this._reelUpdate({});
                        return false
                    }
                    this._debug("Applying incoming JS Object", data);
                    this._reelUpdate(data);
                    return this
                }
                if (typeof data == "string") {
                    var splt = [];
                    splt[0] = data;
                    if (data.indexOf(this.config.FilePosterSeparator) > -1) {
                        splt = data.split(this.config.FilePosterSeparator);
                        data.config = {
                            poster: splt[1]
                        }
                    } else {
                        result[0] = {};
                        result[0].file = data
                    }
                    if (externalData === false) {
                        this._debug("Applying incoming single file:" + result[0]["file"], data);
                        this._reelUpdate(result)
                    } else {
                        this._debug("Loading external data from " + splt[0]);
                        this._playlistServer = splt[0];
                        this.getFromUrl(splt[0], this, "_reelUpdate", this.config.reelParser)
                    }
                }
                return this
            };
            this.selfDestruct = function () {
                var ref = this;
                this._enqueue(function () {
                    ref._selfDestruct()
                });
                return this
            }, this._selfDestruct = function () {
                var ref = this;
                $(this).unbind();
                this._unbindPlugins();
                this._removeGUIListeners();
                this.env.playerDom.replaceWith(this.env.srcNode);
                $.each(projekktors, function (idx) {
                    try {
                        if (this.getId() == ref.getId() || this.getId() == ref.getId() || this.getParent() == ref.getId()) {
                            projekktors.splice(idx, 1);
                            return
                        }
                    } catch (e) { }
                });
                return this
            };
            this.reset = function () {
                var ref = this;
                this._clearqueue();
                this._enqueue(function () {
                    ref._reset()
                });
                return this
            }, this._reset = function () {
                var ref = this;
                $(this).unbind();
                this._unbindPlugins();
                this._removeGUIListeners();
                this.mediaGrid = this._testMediaSupport();
                this._reelUpdate(this.config.playlist);
                return this
            }, this._cookie = function (key, value) {
                if (document.cookie === undefined) {
                    return null
                }
                if (document.cookie === false) {
                    return null
                }
                var options = {};
                if (arguments.length > 1 && (value === null || typeof value !== "object")) {
                    if (value === null) {
                        options.expires = -1
                    }
                    if (typeof options.expires === "number") {
                        var days = options.expires,
							t = options.expires = new Date();
                        t.setDate(t.getDate() + days)
                    }
                    return (document.cookie = [encodeURIComponent(this.config.cookieName + "_" + key), "=", options.raw ? String(value) : encodeURIComponent(String(value)), options.expires ? "; expires=" + this.config.cookieExpiry.toUTCString() : "", options.path ? "; path=" + options.path : "", options.domain ? "; domain=" + options.domain : "", options.secure ? "; secure" : ""].join(""))
                }
                options = value || {};
                var result, decode = options.raw ?
				function (s) {
				    return s
				} : decodeURIComponent;
                var returnthis = (result = new RegExp("(?:^|; )" + encodeURIComponent(this.config.cookieName + "_" + key) + "=([^;]*)").exec(document.cookie)) ? decode(result[1]) : null;
                return (returnthis != null) ? this._cleanValue(returnthis) : null
            };
            this._testMediaSupport = function (foceTest) {
                var result = [];
                var hasNativeAudio = false;
                var hasFlash = (this.getFlashVersion() > 0);
                var nativeElementType = "";
                for (i in this.mediaTypes) {
                    result[this.mediaTypes[i]["type"]] = "NA";
                    if (this.mediaTypes[i]["model"] == "image" && this.mediaTypes[i]["platform"] == "native") {
                        result[this.mediaTypes[i]["type"]] = "image";
                        continue
                    }
                    if (this.mediaTypes[i]["platform"] == "internal") {
                        result[this.mediaTypes[i]["type"]] = this.mediaTypes[i]["model"];
                        continue
                    }
                    if ((hasFlash == true || this.mediaTypes[i]["fixed"] === "maybe") && this.mediaTypes[i]["platform"] == "flash") {
                        if (this.mediaTypes[i]["model"].indexOf("flash") > -1) {
                            if (this.getItemConfig("enableFlashFallback") == true || foceTest === true) {
                                result[this.mediaTypes[i]["type"]] = (this.mediaTypes[i]["type"].indexOf("audio") > -1) ? "audioflash" : "videoflash"
                            }
                        } else {
                            result[this.mediaTypes[i]["type"]] = this.mediaTypes[i]["model"]
                        }
                    }
                    if (this.mediaTypes[i]["fixed"] !== true && (this.getItemConfig("enableNativePlayback") !== false || foceTest === true)) {
                        if ((this.mediaTypes[i]["type"].indexOf("video") > -1 || this.mediaTypes[i]["type"].indexOf("audio") > -1)) {
                            try {
                                nativeElementType = (this.mediaTypes[i]["type"].indexOf("video") > -1) ? "video" : "audio";
                                var testObject = document.createElement(nativeElementType);
                                if (testObject.canPlayType != false) {
                                    switch (testObject.canPlayType(this.mediaTypes[i]["type"])) {
                                        case "no":
                                            break;
                                        case "":
                                            break;
                                        case "maybe":
                                            if ($.browser.opera) {
                                                if ($.browser.version.slice(0, 2) < 11) {
                                                    break
                                                }
                                            }
                                        case "probably":
                                        default:
                                            result[this.mediaTypes[i]["type"]] = nativeElementType
                                    }
                                }
                            } catch (e) { }
                        }
                    }
                }
                return result
            };
            this.randomId = function (length) {
                var chars = "abcdefghiklmnopqrstuvwxyz";
                var result = "";
                for (var i = 0; i < length; i++) {
                    var rnum = Math.floor(Math.random() * chars.length);
                    result += chars.substring(rnum, rnum + 1)
                }
                return result
            };
            this.toAbsoluteURL = function (s) {
                var l = location,
					h, p, f, i;
                if (s == null || s == "") {
                    return ""
                }
                if (/^\w+:/.test(s)) {
                    return s
                }
                h = l.protocol + "//" + l.host;
                if (s.indexOf("/") == 0) {
                    return h + s
                }
                p = l.pathname.replace(/\/[^\/]*$/, "");
                f = s.match(/\.\.\//g);
                if (f) {
                    s = s.substring(f.length * 3);
                    for (i = f.length; i--;) {
                        p = p.substring(0, p.lastIndexOf("/"))
                    }
                }
                return h + p + "/" + s
            };
            this.parseTemplate = function (template, data) {
                var i;
                if (data === undefined || data.length == 0 || typeof data != "object") {
                    return template
                }
                for (i in data) {
                    template = template.replace(new RegExp("{" + i + "}", "gi"), data[i])
                }
                template = template.replace(/{(.*?)}/gi, "");
                return template
            };
            this._cleanValue = function (value) {
                switch (value) {
                    case "false":
                        return false;
                    case "true":
                        return true;
                    case "null":
                        return null;
                    case "undefined":
                        return "";
                    case undefined:
                        return false;
                    default:
                        return (typeof value != "string" && typeof value != "number" && typeof value != "boolean") ? false : value
                }
            };
            this._getFilesFromHash = function (idx) {
                var data = window.location.hash.substring(1);
                if (data == undefined || data == null) {
                    return false
                }
                if (data.indexOf(this.config.FilePosterSeparator) > -1) {
                    data = data.split(this.config.FilePosterSeparator)
                }
                if (data[1] && idx == 1) {
                    return data[1]
                } else {
                    if (idx == 0) {
                        return data[0]
                    }
                }
                return false
            };
            this._getTypeFromFileExtension = function (url) {
                var fileExt = "",
					extRegEx = [],
					extTypes = {},
					extRegEx = [];
                for (var i in this.mediaTypes) {
                    extRegEx.push("." + this.mediaTypes[i].ext);
                    extTypes[this.mediaTypes[i].ext] = this.mediaTypes[i]
                }
                extRegEx = "^.*.(" + extRegEx.join("|") + ")$";
                try {
                    fileExt = url.match(new RegExp(extRegEx))[1];
                    fileExt = (!fileExt) ? "NaN" : fileExt.replace(".", "")
                } catch (e) {
                    fileExt = "NaN"
                }
                return extTypes[fileExt].type
            };
            this._debug = function (desc, data) {
                if (this.config.debug === false) {
                    return
                }
                if (this.config.debug == "console") {
                    try {
                        if (desc) {
                            console.log(desc)
                        }
                        if (data && this.config.debugLevel > 1) {
                            console.log(data)
                        }
                    } catch (e) { }
                    return
                }
                var result = "<pre><b>" + desc + "</b>\n";
                if (data && this.config.debugLevel > 1) {
                    switch (typeof data) {
                        case "undefined":
                            break;
                        case "object":
                            var temp = "";
                            if (temp == "") {
                                temp = "";
                                for (var i in data) {
                                    temp += i + " : " + data[i] + "\n"
                                }
                            }
                            result += temp;
                            break;
                        case "string":
                            result += data
                    }
                    result += "</pre>"
                }
                try {
                    $("#" + this.config.debug).prepend(result)
                } catch (e) { }
            };
            this.cDump = function () {
                try {
                    JSON.stringify({})
                } catch (e) {
                    return
                }
                if ($("#debug" + this.getId()).length > 0) {
                    $("#debug" + this.getId()).remove();
                    return
                }
                var result = {
                    timestamp: new Date().getTime(),
                    agent: navigator.userAgent.toLowerCase(),
                    dom: $($("<div></div>").html($(this.env.srcNode).clone())).html(),
                    media: this.media,
                    grid: {},
                    config: this.config
                };
                for (var i in this.mediaGrid) {
                    result.grid[i] = this.mediaGrid[i]
                }
                var w = $(document.createElement("div")).attr("id", "debug" + this.getId()).css({
                    backgroundColor: "#FF0000",
                    color: "#fdfdfd",
                    padding: "5px",
                    width: (this.env.playerDom.width() - 10) + "px",
                    zIndex: 99999,
                    position: "absolute",
                    top: this.env.playerDom.position().top,
                    left: this.env.playerDom.position().left
                }).html("<b>" + this.config.messages[1000] + "</b>");
                var tA = $(document.createElement("textarea")).attr("id", "debug" + this.getId()).css({
                    backgroundColor: "#fdfdfd",
                    width: "100%",
                    height: "100px",
                    border: 0
                }).html(JSON.stringify(result)).appendTo(w);
                $("body").append(w);
                tA.select()
            };
            this._init = function (srcNode, onReady) {
                var ref = this,
					files = [];
                this._id = srcNode[0].id || this.randomId(8);
                srcNode[0].id = this._id;
                this.env.srcNode = $.extend(true, {}, srcNode);
                if (this.config.height !== false && this.config.width !== false) {
                    if (this.config.width <= 0) {
                        this.config.width = (srcNode.attr("width")) ? srcNode.attr("width") : srcNode.width()
                    }
                    if (this.config.width <= this.config.minWidth) {
                        this.config.width = this.config.minWidth;
                        this.env.autoSize = true
                    }
                    if (this.config.height <= 0) {
                        this.config.height = (srcNode.attr("height")) ? srcNode.attr("height") : srcNode.height()
                    }
                    if (this.config.height <= this.config.minHeight) {
                        this.config.height = this.config.minHeight;
                        this.env.autoSize = true
                    }
                }
                this.config.autoplay = (this.config.autoplay || (srcNode.attr("autoplay") !== undefined && srcNode.attr("autoplay") !== false));
                this.config.controls = ((srcNode.attr("controls") !== undefined && srcNode.attr("controls") !== false) || this.config.controls === true);
                this.config.loop = (srcNode.attr("loop") !== undefined && srcNode.attr("loop") !== false) ? true : this.config.loop;
                this.config.title = (srcNode.attr("title") !== "" && srcNode.attr("title") !== undefined && srcNode.attr("title") !== false) ? srcNode.attr("title") : false;
                this.config.poster = ($(srcNode).attr("poster") !== "" && srcNode.attr("poster") !== undefined && srcNode.attr("poster") !== false) ? $(srcNode).attr("poster") : this.config.poster;
                $(window).resize(function () {
                    ref._modelUpdateListener("resize")
                });
                if ($.browser.msie) {
                    var htmlTag = srcNode.html().toLowerCase();
                    var attr = ["autoplay", "controls", "loop"];
                    for (var i = 0; i < attr.length; i++) {
                        if (htmlTag.indexOf(attr[i]) == -1) {
                            continue
                        }
                        this.config[attr[i]] = true
                    }
                }
                files[0] = [];
                if (this.config.sandBox !== false) {
                    files[0].push({
                        src: this._getFilesFromHash(0),
                        type: $(this).attr("type") || this._getTypeFromFileExtension(this._getFilesFromHash(0))
                    });
                    this.config.poster = this._getFilesFromHash(1)
                }
                if (srcNode[0].tagName.toUpperCase() == "VIDEO" || srcNode[0].tagName.toUpperCase() == "AUDIO") {
                    if (srcNode.attr("src")) {
                        files[0].push({
                            src: srcNode.attr("src"),
                            type: srcNode.attr("type") || this._getTypeFromFileExtension(srcNode.attr("src"))
                        })
                    }
                    if ($.browser.msie && $.browser.version < 9) {
                        var childNode = srcNode;
                        do {
                            childNode = childNode.next("source");
                            if (childNode.attr("src")) {
                                files[0].push({
                                    src: childNode.attr("src"),
                                    type: childNode.attr("type") || this._getTypeFromFileExtension(childNode.attr("src"))
                                })
                            }
                        } while (childNode.attr("src"))
                    } else {
                        srcNode.children("source").each(function () {
                            if ($(this).attr("src")) {
                                files[0].push({
                                    src: $(this).attr("src"),
                                    type: $(this).attr("type") || ref._getTypeFromFileExtension($(this).attr("src"))
                                })
                            }
                        })
                    }
                } else {
                    if (this.config.playlist) {
                        files = this.config.playlist
                    }
                }
                if (this.config.designMode === true) {
                    this.config.poster = this.config.desginGrid
                }
                if (srcNode[0].nodeName == "VIDEO" || srcNode[0].nodeName == "AUDIO") {
                    this.env.playerDom = $(document.createElement("div")).attr({
                        id: srcNode[0].id,
                        "class": srcNode[0].className,
                        style: srcNode.attr("style")
                    });
                    srcNode.replaceWith(this.env.playerDom)
                } else {
                    this.env.playerDom = srcNode
                }
                this.env.playerDom.css("overflow", "hidden").css("display", "block");
                if (this.config.width !== false && this.config.height !== false) {
                    this.env.playerDom.css("width", this.config.width + "px").css("height", this.config.height + "px")
                }
                this.mediaGrid = this._testMediaSupport();
                try {
                    $("#projekktorver").html("V" + this.config.version)
                } catch (e) { }
                this._registerPlugins();
                if (this.config.forceFullViewport == true && this.config.sandBox !== true) {
                    this.config.enableFullscreen = false;
                    this._enterFullViewport()
                }
                if (this.config.sandBox !== false) {
                    if (this.getSandboxWindow()) {
                        this.getSandboxWindow().ready(function () {
                            ref._enterFullViewport();
                            ref.env.inFullscreen = false
                        })
                    } else {
                        ref._enterFullViewport();
                        ref.env.inFullscreen = false;
                        this.config.disableFullscreen = true
                    }
                }
                if (typeof onReady === "function") {
                    this._enqueue(function () {
                        onReady(ref)
                    })
                }
                for (var i in files[0]) {
                    if (files[0][i].type == "text/json" || files[0][i].type == "text/xml") {
                        var dataType = null;
                        try {
                            dataType = files[0][i].type.split("/")[1]
                        } catch (e) { }
                        this.setFile(files[0][i].src, true, dataType);
                        return this
                    }
                }
                if (files.length == undefined) {
                    this._reelUpdate(this.config.playlist)
                } else {
                    this._reelUpdate((files[0].length > 0 && files !== this.config.playlist) ? files : this.config.playlist)
                }
                return this
            };
            return this._init(srcNode, onReady)
        }
    }
});
var projekktorPluginInterface = function () { };
jQuery(function (a) {
    projekktorPluginInterface.prototype = {
        pluginReady: false,
        name: "",
        pp: {},
        config: {},
        playerDom: null,
        canvas: {
            media: null,
            projekktor: null
        },
        _init: function (b) {
            this.config = a.extend(true, this.config, b);
            this.initialize()
        },
        getItemConfig: function (b) {
            var c = this.pp.getItemConfig("plugin_" + this.name);
            if (c === false || c[b] === false) {
                return (this.config[b] || false)
            }
            return (c[b] || false)
        },
        getPlayerConfig: function (b) {
            return (this.pp.config[b] || this.config[b] || false)
        },
        sendEvent: function (b, c) {
            this.pp._bubbleEvent({
                _plugin: this.name,
                _event: b
            }, c)
        },
        parseTemplate: function (b, c) {
            return this.pp.parseTemplate(b, c)
        },
        blockSelection: function (b) {
            if (!b) {
                return
            }
            if (a.browser.mozilla) {
                b.css("MozUserSelect", "none")
            } else {
                if (a.browser.msie) {
                    b.bind("selectstart", function () {
                        return false
                    })
                } else {
                    b.mousedown(function () {
                        return false
                    })
                }
            }
        },
        applyToPlayer: function (c, d) {
            var e = this.getPlayerConfig("cssClassPrefix");
            if (!c) {
                return null
            }
            if (this.playerDom.find("." + e + c.attr("class")).length == 0) {
                var b = c.attr("class");
                c.removeClass(b);
                c.addClass(e + b);
                if (d === true) {
                    c.prependTo(this.playerDom)
                } else {
                    c.appendTo(this.playerDom)
                }
                return c
            }
            var b = c.attr("class");
            c = this.playerDom.find("." + e + c.attr("class"));
            c.removeClass(b);
            c.addClass(e + b);
            return c
        },
        initialize: function () { },
        detachHandler: function (b) { },
        displayReadyHandler: function (b) { },
        pluginsReadyHandler: function (b) { },
        stateHandler: function () { },
        bufferHandler: function () { },
        scheduleLoading: function (b) { },
        configModified: function (b) { },
        scheduledHandler: function (b) { },
        scheduleModifiedHandler: function (b) { },
        itemHandler: function (b) { },
        startHandler: function (b) { },
        doneHandler: function (b) { },
        stopHandler: function (b) { },
        endedHandler: function (b) { },
        canplayHandler: function (b) { },
        volumeHandler: function (b) { },
        timeHandler: function (b) { },
        progressHandler: function (b) { },
        mousemoveHandler: function (b) { },
        mouseleaveHandler: function (b) { },
        mouseeterHandler: function (b) { },
        fullscreenHandler: function (b) { },
        awakingHandler: function (b) { },
        keyHandler: function (b) { }
    }
});
var playerModel = function () { };
jQuery(function (a) {
    playerModel.prototype = {
        _states: {
            idle: "IDLE",
            awakening: "AWAKENING",
            paused: "PAUSED",
            playing: "PLAYING",
            starting: "STARTING",
            buffering: "BUFFERING",
            completed: "COMPLETED",
            stopped: "STOPPED",
            error: "ERROR"
        },
        _bufferStates: {
            empty: "EMPTY",
            full: "FULL",
            done: "DONE"
        },
        _currentState: null,
        _currentBufferState: null,
        _KbPerSec: 0,
        _bandWidthTimer: null,
        _isPoster: false,
        _isPlaying: false,
        _modelName: "player",
        modelReady: true,
        requiresFlash: false,
        bypassFlashFFFix: false,
        hasGUI: false,
        isAutoslide: false,
        allowRandomSeek: false,
        flashVerifyMethod: "api_get",
        elementReady: false,
        mediaElement: null,
        pp: {},
        media: {
            duration: 0,
            position: 0,
            startOffset: 0,
            file: false,
            poster: "",
            ended: false,
            message: "",
            error: null,
            mediaType: "",
            loadProgress: 0,
            errorCode: 0,
            message: "",
            type: "NA",
            volume: 0
        },
        _init: function (b) {
            this.pp = b.pp || null;
            this.media = b.media || this.media;
            this._modelName = b.model;
            this._ap = b.autoplay;
            this.init()
        },
        init: function (b) {
            this.ready()
        },
        ready: function () {
            this.sendUpdate("modelReady");
            this.displayItem(this._ap)
        },
        displayItem: function (b) {
            if (b !== true || this.getState() === "STOPPED") {
                this._setState("idle");
                this.applyImage(this.getPoster(), this.pp.getMediaContainer().html(""));
                this._isPoster = true;
                this.elementReady = true
            } else {
                if (this.requiresFlash !== false) {
                    if (this.requiresFlash > this.pp.getFlashVersion()) {
                        this.setTestcard(6);
                        return
                    }
                }
                this.elementReady = false;
                this._isPoster = false;
                this.applyMedia(this.pp.getMediaContainer().html("").show())
            }
            this.waitTillReady(b)
        },
        applyMedia: function () { },
        sendUpdate: function (b, c) {
            this.pp._modelUpdateListener(b, c)
        },
        waitTillReady: function (c) {
            var b = this;
            (function () {
                try {
                    if (b.elementReady !== true) {
                        setTimeout(arguments.callee, 70);
                        return
                    }
                } catch (d) { }
                if (b.getState() !== "STOPPED" || c === true) {
                    try {
                        b.addListeners()
                    } catch (d) { }
                }
                b.pp._modelUpdateListener("displayReady");
                if (c === true) {
                    b.setPlay()
                }
            })()
        },
        addListeners: function () { },
        removeListeners: function () {
            try {
                this.mediaElement.unbind()
            } catch (b) { }
        },
        detachMedia: function () { },
        destroy: function () {
            this.removeListeners();
            this.detachMedia();
            try {
                a("#" + this.mediaElement.id).empty()
            } catch (b) { }
            try {
                a("#" + this.mediaElement.id).remove()
            } catch (b) { }
            try {
                this.mediaElement.remove()
            } catch (b) { }
            this.pp.getMediaContainer().html("");
            this.mediaElement = null;
            this.media.loadProgress = 0;
            this.media.playProgress = 0;
            this.media.position = 0;
            this.media.duration = 0;
            this._setState("stopped")
        },
        reInit: function () {
            if (this.requiresFlash === false || !(a.browser.mozilla) || this.getState() === "ERROR" || this.pp.getItemConfig("bypassFlashFFFix") === true || this.bypassFlashFFFix === true) {
                return
            }
            this.sendUpdate("FFreinit");
            this.removeListeners();
            this.displayItem((this.getState() !== "IDLE"))
        },
        applyCommand: function (c, b) {
            switch (c) {
                case "play":
                    if (this.getState() === "IDLE") {
                        this._setState("awakening");
                        this.displayItem(true);
                        break
                    }
                    this.setPlay();
                    break;
                case "pause":
                    this.setPause();
                    break;
                case "volume":
                    if (!this.setVolume(b)) {
                        this.sendUpdate("volume", b)
                    }
                    break;
                case "stop":
                    this.setStop();
                    break;
                case "seek":
                    if (this.media.loadProgress == -1) {
                        break
                    }
                    this.setSeek(b);
                    break;
                case "fullscreen":
                    this.sendUpdate("fullscreen", b);
                    this.setFullscreen(b);
                    this.reInit();
                    break;
                case "resize":
                    this.setResize();
                    break
            }
        },
        setSeek: function (b) { },
        setPlay: function () { },
        setPause: function () { },
        setStop: function () {
            this.detachMedia();
            this.destroy();
            this.displayItem(false)
        },
        setVolume: function (b) { },
        setFullscreen: function (b) { },
        setResize: function () { },
        getVolume: function () {
            var b = this.mediaElement.attr("muted");
            return (b == true) ? 0 : this.mediaElement.attr("volume")
        },
        getLoadProgress: function () {
            return this.media.loadProgress || 0
        },
        getLoadPlaybackProgress: function () {
            return this.media.playProgress || 0
        },
        getPosition: function () {
            return this.media.position || 0
        },
        getDuration: function () {
            return this.media.duration || 0
        },
        getInFullscreen: function () {
            return this.pp.getInFullscreen()
        },
        getIsAutoslide: function () {
            return this.isAutoslide
        },
        getKbPerSec: function () {
            return this._KbPerSec
        },
        getIsPlaying: function () {
            return this._isPlaying
        },
        getState: function () {
            return (this._currentState == null) ? this._states.idle : this._currentState
        },
        getFile: function () {
            return this.media.file || null
        },
        getModelName: function () {
            return this._modelName || null
        },
        getHasGUI: function () {
            return (this.hasGUI && !this._isPoster)
        },
        getIsReady: function () {
            return this.elementReady
        },
        getPoster: function () {
            return this.pp.getItemConfig("poster")
        },
        timeListener: function (e) {
            if (e == undefined) {
                return
            }
            var d = (e.position != undefined) ? e.position : e.currentTime;
            var c = e.duration;
            var b = (d > 0 && c > 0) ? d * 100 / c : 0;
            this.media.duration = this._roundNumber(c, 2);
            this.media.position = this._roundNumber(d, 2);
            this.media.playProgress = b;
            this.sendUpdate("time", this.media.position);
            this.loadProgressUpdate()
        },
        loadProgressUpdate: function () {
            try {
                var d = this.mediaElement[0];
                if (typeof d.buffered !== "object") {
                    return
                }
                if (typeof d.buffered.length <= 0) {
                    return
                }
                var b = Math.round(d.buffered.end(d.buffered.length - 1) * 100) / 100,
					c = b * 100 / this.media.duration;
                if (c == this.media.loadProgress) {
                    return
                }
                this.media.loadProgress = (this.allowRandomSeek === true) ? 100 : -1;
                this.media.loadProgress = (this.media.loadProgress < 100 || this.media.loadProgress == undefined) ? c : 100;
                this.sendUpdate("progress", this.media.loadProgress)
            } catch (f) { }
        },
        progressListener: function (c, h) {
            try {
                if (typeof this.mediaElement[0].buffered == "object") {
                    if (this.mediaElement[0].buffered.length > 0) {
                        this.mediaElement.unbind("progress");
                        return
                    }
                }
            } catch (g) { }
            if (this._bandWidthTimer == null) {
                this._bandWidthTimer = (new Date()).getTime()
            }
            var f = 0,
				d = 0;
            if (!isNaN(c.loaded / c.total)) {
                f = c.loaded;
                d = c.total
            } else {
                if (c.originalEvent && !isNaN(c.originalEvent.loaded / c.originalEvent.total)) {
                    f = c.originalEvent.loaded;
                    d = c.originalEvent.total
                } else {
                    if (h && !isNaN(h.loaded / h.total)) {
                        f = h.loaded;
                        d = h.total
                    }
                }
            }
            var b = (f > 0 && d > 0) ? f * 100 / d : 0;
            if (Math.round(b) > Math.round(this.media.loadProgress)) {
                this._KbPerSec = ((f / 1024) / (((new Date()).getTime() - this._bandWidthTimer) / 1000))
            }
            b = (this.media.loadProgress !== 100) ? b : 100;
            b = (this.allowRandomSeek === true) ? 100 : b;
            if (this.media.loadProgress != b) {
                this.media.loadProgress = b;
                this.sendUpdate("progress", b)
            }
            if (this.media.loadProgress >= 100 && this.allowRandomSeek == false) {
                this._setBufferState("full")
            }
        },
        endedListener: function (b) {
            if (this.mediaElement === null) {
                return
            }
            this._setState("completed")
        },
        waitingListener: function (b) {
            this._setBufferState("empty")
        },
        canplayListener: function (b) {
            this._setBufferState("full")
        },
        canplaythroughListener: function (b) {
            this._setBufferState("full")
        },
        suspendListener: function (b) {
            this._setBufferState("full")
        },
        playingListener: function (b) {
            this._setState("playing")
        },
        startListener: function (b) {
            this.applyCommand("volume", this.pp.getItemConfig("volume"));
            this._setState("playing")
        },
        pauseListener: function (b) {
            this._setState("paused")
        },
        volumeListener: function (b) {
            this.sendUpdate("volume", this.getVolume())
        },
        flashReadyListener: function () {
            this.elementReady = true
        },
        errorListener: function (b, d) {
            try {
                switch (b.target.error.code) {
                    case b.target.error.MEDIA_ERR_ABORTED:
                        this.setTestcard(1);
                        break;
                    case b.target.error.MEDIA_ERR_NETWORK:
                        this.setTestcard(2);
                        break;
                    case b.target.error.MEDIA_ERR_DECODE:
                        this.setTestcard(3);
                        break;
                    case b.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        this.setTestcard(4);
                        break;
                    default:
                        this.setTestcard(5);
                        break
                }
            } catch (c) { }
        },
        metaDataListener: function (c) {
            try {
                this.videoWidth = c.videoWidth;
                this.videoHeight = c.videoHeight
            } catch (b) { }
            this._scaleVideo()
        },
        setTestcard: function (f, b) {
            var e = this.pp.getMediaContainer();
            var d = this.pp.getItemConfig("messages");
            var c = (d[f] != undefined) ? d[f] : d[0];
            c = (b != undefined && b != "") ? b : c;
            if (this.pp.getItemCount() > 1) {
                c += d[99]
            }
            if (c.length < 3) {
                c = "ERROR"
            }
            if (f == 100) {
                c = ""
            }
            c = this.pp.parseTemplate(c, a.extend({}, this.media.fileConfig, {
                flashver: this.requiresFlash
            }));
            e.attr("style", "width: 100%; height:100%;");
            e.html("");
            this.mediaElement = a(document.createElement("div")).attr({
                "class": "pptestcard"
            }).appendTo(e);
            if (c.length > 0) {
                a(document.createElement("p")).appendTo(this.mediaElement).html(c)
            }
            this._setState("error")
        },
        applyImage: function (d, b) {
            var e = this;
            var f = a(document.createElement("img")).hide();
            if (d == "" || d == undefined) {
                f = a(document.createElement("span")).attr({
                    id: this.pp.getMediaId() + "_image"
                }).appendTo(b);
                return f
            }
            f.appendTo(b).attr({
                id: this.pp.getMediaId() + "_image",
                src: d
            }).css({
                position: "absolute"
            });
            f.error(function (g) {
                a(this).remove()
            });
            if (a.browser.msie) {
                (function () {
                    try {
                        if (f[0].complete != null && f[0].complete == true) {
                            f.show();
                            e.stretch(e.pp.getItemConfig("imageScaling"), f, b.width(), b.height());
                            return
                        }
                        setTimeout(arguments.callee, 100)
                    } catch (g) {
                        setTimeout(arguments.callee, 100)
                    }
                })()
            } else {
                f.load(function (g) {
                    a(this).show();
                    f.realWidth = f.attr("width");
                    f.realHeight = f.attr("height");
                    e.stretch(e.pp.getItemConfig("imageScaling"), a(this), b.width(), b.height())
                })
            }
            var c = function () {
                if (f.is(":visible") === false) {
                    e.pp.removeListener("fullscreen", arguments.callee)
                }
                f.width = function () {
                    return f.realWidth
                };
                f.height = function () {
                    return f.realHeight
                };
                e.stretch(e.pp.getItemConfig("imageScaling"), f, b.width(), b.height())
            };
            this.pp.addListener("fullscreen", c);
            this.pp.addListener("resize", c);
            return f
        },
        stretch: function (b, d, n, l, f, h) {
            if (d == undefined) {
                return false
            }
            if (d._originalDimensions === undefined) {
                d._originalDimensions = {};
                d._originalDimensions = {
                    width: d.width(),
                    height: d.height()
                }
            }
            var g = (f !== undefined) ? f : d._originalDimensions.width;
            var c = (h !== undefined) ? h : d._originalDimensions.height;
            var j = (n / g);
            var m = (l / c);
            var e = n;
            var k = l;
            switch (b) {
                case "fill":
                    if (j < m) {
                        e = g * j;
                        k = c * j
                    } else {
                        if (j > m) {
                            e = g * m;
                            k = c * m
                        }
                    }
                    break;
                case "aspectratio":
                default:
                    if (j > m) {
                        e = g * m;
                        k = c * m
                    } else {
                        if (j < m) {
                            e = g * j;
                            k = c * j
                        }
                    }
                    break
            }
            n = this._roundNumber((e / n) * 100, 0);
            l = this._roundNumber((k / l) * 100, 0);
            d.css({
                margin: 0,
                padding: 0,
                width: n + "%",
                height: l + "%",
                left: (100 - n) / 2 + "%",
                top: (100 - l) / 2 + "%"
            });
            if (d._originalDimensions.width != d.width() || d._originalDimensions.height != d.height()) {
                return true
            }
            return false
        },
        toAttributeString: function (c) {
            var d = "";
            for (var b in c) {
                if (b.toUpperCase() === "FLASHVARS") {
                    continue
                }
                if (typeof c[b] != "function") {
                    d += b + '="' + c[b] + '" '
                }
            }
            return d
        },
        toFlashvarsString: function (d) {
            var f = "";
            var e = "";
            for (var c in d) {
                if (typeof d[c] != "function") {
                    e = d[c];
                    for (var b in this.media) {
                        if (typeof e != "string") {
                            continue
                        }
                        e = e.replace("{" + b + "}", this.media[b])
                    }
                    f += c + "=" + encodeURIComponent(e) + "&"
                }
            }
            return f.replace(/&$/, "")
        },
        createFlash: function (h, b) {
            var f = (h.FlashVars === null) ? this.pp.getItemConfig("flashVars") : h.FlashVars;
            var e = "",
				d = "",
				c = "",
				g = "";
            if (f) {
                f = this.toFlashvarsString(f);
                if (f.length > 0) {
                    h.src += "?" + f
                }
            }
            if (a.browser.msie) {
                g = ' id="' + h.id + '" '
            }
            var d = "<object" + g + ' codebase="https://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0"  name="' + h.name + '" width="' + h.width + '" height="' + h.height + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">';
            d += '<param name="movie" value="' + h.src + '"></param>';
            d += '<param name="allowScriptAccess" value="' + h.allowScriptAccess + '"></param>';
            d += '<param name="allowFullScreen" value="' + h.allowFullScreen + '"></param>';
            d += '<param name="wmode" value="' + h.wmode + '"></param>';
            var c = "<embed " + this.toAttributeString(h) + ' pluginspage="http://www.macromedia.com/go/getflashplayer" swliveconnect="true" type="application/x-shockwave-flash"></embed>';
            e = d + c;
            e += "</object>";
            if (a.browser.mozilla) {
                e = c
            }
            b[0].innerHTML = e;
            this.mediaElement = a("#" + h.id)[0];
            this._waitforPlayer()
        },
        _waitforPlayer: function () {
            if (this.elementReady == true) {
                return
            }
            var b = this;
            this._setBufferState("empty");
            (function () {
                try {
                    if (b.mediaElement == undefined) {
                        setTimeout(arguments.callee, 100)
                    } else {
                        if (b.mediaElement[b.flashVerifyMethod] == undefined) {
                            setTimeout(arguments.callee, 100)
                        } else {
                            b._setBufferState("full");
                            b.flashReadyListener()
                        }
                    }
                } catch (c) {
                    setTimeout(arguments.callee, 100)
                }
            })()
        },
        _roundNumber: function (b, c) {
            if (b <= 0 || isNaN(b)) {
                return 0
            }
            return Math.round(b * Math.pow(10, c)) / Math.pow(10, c)
        },
        _setState: function (b) {
            if (this._currentState != this._states[b]) {
                this._currentState = this._states[b].toUpperCase();
                this.sendUpdate("state", this._states[b].toUpperCase())
            }
        },
        _setBufferState: function (b) {
            if (this._currentBufferState != this._bufferStates[b]) {
                this._currentBufferState = this._bufferStates[b].toUpperCase();
                this.sendUpdate("buffer", this._bufferStates[b].toUpperCase())
            }
        },
        _scaleVideo: function (h) {
            var d = this.pp.getMediaContainer();
            if (this.pp.getIsMobileClient()) {
                return
            }
            try {
                var f = d.width();
                var j = d.height();
                var b = this.videoWidth;
                var c = this.videoHeight;
                if (this.stretch(this.pp.getItemConfig("videoScaling"), this.mediaElement, f, j, b, c)) {
                    this.sendUpdate("scaled", {
                        realWidth: b,
                        realHeight: c,
                        displayWidth: f,
                        displayHeight: j
                    })
                }
            } catch (g) { }
        }
    }
});
var playerModelPLAYLIST = function () { };
jQuery(function (a) {
    playerModelPLAYLIST.prototype = {
        applyMedia: function (b) {
            this.elementReady = true
        },
        setPlay: function () {
            this.sendUpdate("playlist", this.media.file)
        }
    }
});
var playerModelVIDEOFLASH = function () { };
var playerModelAUDIOFLASH = function () { };
jQuery(function (a) {
    playerModelVIDEOFLASH.prototype = {
        requiresFlash: 9,
        allowRandomSeek: false,
        flashVerifyMethod: "api_get",
        _jarisVolume: 0,
        applyMedia: function (b) {
            var c = {
                id: this.pp.getMediaId() + "_flash",
                name: this.pp.getMediaId() + "_flash",
                src: this.pp.getItemConfig("playerFlashMP4"),
                width: "100%",
                height: "100%",
                allowScriptAccess: "always",
                allowFullScreen: "true",
                allowNetworking: "all",
                wmode: "transparent",
                bgcolor: "#000000",
                FlashVars: {
                    source: this.media.file,
                    type: "video",
                    streamtype: this.pp.getItemConfig("flashStreamType"),
                    server: (this.pp.getItemConfig("flashStreamType") == "rtmp") ? this.pp.getItemConfig("flashRTMPServer") : "",
                    autostart: "false",
                    hardwarescaling: "true",
                    controls: "false",
                    jsapi: "true"
                }
            };
            switch (this.pp.getItemConfig("flashStreamType")) {
                case "rtmp":
                case "http":
                    this.allowRandomSeek = true;
                    this.media.loadProgress = 100;
                    break
            }
            this.createFlash(c, b)
        },
        addListeners: function () {
            this.mediaElement.api_addlistener("onprogress", "projekktor('" + this.pp.getId() + "').playerModel.progressListener");
            this.mediaElement.api_addlistener("ontimeupdate", "projekktor('" + this.pp.getId() + "').playerModel.timeListener");
            if (this.getModelName().indexOf("VIDEO") > -1) {
                this.mediaElement.api_addlistener("ondatainitialized", "projekktor('" + this.pp.getId() + "').playerModel.metaDataListener")
            }
            if (this.getModelName().indexOf("AUDIO") > -1) {
                this.mediaElement.api_addlistener("onconnectionsuccess", "projekktor('" + this.pp.getId() + "').playerModel.startListener")
            }
            this.mediaElement.api_addlistener("onplaypause", "projekktor('" + this.pp.getId() + "').playerModel._playpauseListener");
            this.mediaElement.api_addlistener("onplaybackfinished", "projekktor('" + this.pp.getId() + "').playerModel.endedListener");
            this.mediaElement.api_addlistener("onmute", "projekktor('" + this.pp.getId() + "').playerModel.volumeListener");
            this.mediaElement.api_addlistener("onvolumechange", "projekktor('" + this.pp.getId() + "').playerModel.volumeListener");
            this.mediaElement.api_addlistener("onbuffering", "projekktor('" + this.pp.getId() + "').playerModel.waitingListener");
            this.mediaElement.api_addlistener("onnotbuffering", "projekktor('" + this.pp.getId() + "').playerModel.canplayListener");
            this.mediaElement.api_addlistener("onconnectionfailed", "projekktor('" + this.pp.getId() + "').playerModel.errorListener")
        },
        removeListeners: function () {
            try {
                this.mediaElement.api_removelistener("*")
            } catch (b) { }
        },
        _playpauseListener: function (b) {
            if (b.isplaying) {
                this.playingListener()
            } else {
                this.pauseListener()
            }
        },
        metaDataListener: function (c) {
            this.startListener(c);
            try {
                this.videoWidth = c.width;
                this.videoHeight = c.height;
                this.sendUpdate("scaled", {
                    width: this.videoWidth,
                    height: this.videoHeight
                })
            } catch (b) { }
        },
        setSeek: function (c) {
            try {
                this.mediaElement.api_seek(c)
            } catch (b) { }
        },
        setVolume: function (b) {
            try {
                this.mediaElement.api_volume(b)
            } catch (c) {
                return false
            }
            return true
        },
        setPause: function (b) {
            try {
                this.mediaElement.api_pause()
            } catch (c) { }
        },
        setPlay: function (b) {
            try {
                this.mediaElement.api_play()
            } catch (c) { }
        },
        getVolume: function () {
            return this._jarisVolume
        },
        errorListener: function (b) {
            this.setTestcard(4)
        },
        volumeListener: function (b) {
            if (this._jarisVolume != b.volume) {
                this._jarisVolume = b.volume;
                this.sendUpdate("volume", b.volume)
            }
        },
        detachMedia: function () {
            try {
                a(this.mediaElement).remove()
            } catch (b) { }
        }
    };
    playerModelAUDIOFLASH.prototype = a.extend(true, {}, playerModelVIDEOFLASH.prototype, {
        applyMedia: function (b) {
            this.imageElement = this.applyImage(this.pp.getItemConfig("cover") || this.pp.getItemConfig("poster"), b);
            var c = a("#" + this.pp.getMediaId() + "_flash_container");
            if (c.length == 0) {
                c = a(document.createElement("div")).css({
                    width: "1px",
                    height: "1px"
                }).attr("id", this.pp.getMediaId() + "_flash_container").appendTo(a(document.body))
            }
            var d = {
                id: this.pp.getMediaId() + "_flash",
                name: this.pp.getMediaId() + "_flash",
                src: this.pp.getItemConfig("playerFlashMP3"),
                width: "1px",
                height: "1px",
                allowScriptAccess: "always",
                allowFullScreen: "true",
                allowNetworking: "all",
                wmode: "transparent",
                bgcolor: "#000000",
                FlashVars: {
                    source: this.media.file,
                    type: "audio",
                    streamtype: this.pp.getItemConfig("flashStreamType"),
                    server: (this.pp.getItemConfig("flashStreamType") == "rtmp") ? this.pp.getItemConfig("flashRTMPServer") : "",
                    autostart: "false",
                    hardwarescaling: "false",
                    controls: "false",
                    jsapi: "true"
                }
            };
            this.createFlash(d, c)
        }
    })
});
var playerModelVIDEO = function () { };
var playerModelAUDIO = function () { };
jQuery(function (a) {
    playerModelVIDEO.prototype = {
        allowRandomSeek: false,
        videoWidth: 0,
        videoHeight: 0,
        element: "video",
        applyMedia: function (d) {
            var c = "";
            this.elementReady = false;
            if (this.pp.getIsMobileClient() && this.element == "video") {
                this.pp.env.playerDom.children().not(".ppdisplay").hide();
                c = "controls"
            }
            if (this.media.mediaType.indexOf("/ogg") > -1) {
                this.allowRandomSeek = true
            }
            if (this.element == "audio") {
                this.imageElement = this.applyImage(this.pp.getItemConfig("cover") || this.pp.getItemConfig("poster"), d)
            }
            this.mediaElement = a(document.createElement(this.element)).attr({
                msAudioCategory:"BackgroundCapableMedia",
                id: this.pp.getMediaId() + "_html",
                controls: ((this.element == "video") ? c : false),
                //controls:true,
                autoplay: false,
                //msAudioCategory:"Communications",
                preload: "none",
                poster: "",
                loop: false,
                "x-webkit-airplay": "allow"
            }).css({
                width: ((this.element == "video") ? "100%" : "1px"),
                height: ((this.element == "video") ? "100%" : "1px"),
                position: "absolute",
                top: 0,
                left: 0
            }).appendTo((this.element == "video") ? d : a("body"));
            for (var b in this.media._originalConfig) {
                if (this.media._originalConfig[b].src) {
                    a(document.createElement("source")).appendTo(this.mediaElement).attr({
                        src: this.media._originalConfig[b].src,
                        type: this.media._originalConfig[b].type
                    })
                }
            }
            this.waitforPlayer()
        },
        waitforPlayer: function () {
            if (this.elementReady == true) {
                return
            }
            var d = this,
				c = a("#" + this.pp.getMediaId() + "_html");
            try {
                if (c == undefined) {
                    setTimeout(function () {
                        d.waitforPlayer()
                    }, 200);
                    return
                }
                if (c[0].networkState == undefined) {
                    setTimeout(function () {
                        d.waitforPlayer()
                    }, 200);
                    return
                }
            } catch (b) {
                setTimeout(function () {
                    d.waitforPlayer()
                }, 200);
                return
            }
            this.addListeners();
            this.elementReady = true
        },
        addListeners: function () {
            var b = this;
            if (this.element == "video") {
                this.mediaElement.bind("loadedmetadata", function () {
                    b.metaDataListener(this)
                })
            }
            this.mediaElement.bind("pause", function () {
                b.pauseListener(this)
            });
            this.mediaElement.bind("playing", function () {
                b.startListener(this)
            });
            this.mediaElement.bind("play", function () {
                b.playingListener(this)
            });
            this.mediaElement.bind("volumechange", function () {
                b.volumeListener(this)
            });
            this.mediaElement.bind("progress", function (c) {
                b.progressListener(c, this)
            });
            this.mediaElement.bind("timeupdate", function () {
                b.timeListener(this)
            });
            this.mediaElement.bind("ended", function () {
                b.endedListener(this)
            });
            this.mediaElement.bind("waiting", function () {
                b.waitingListener(this)
            });
            this.mediaElement.bind("canplaythrough", function () {
                b.canplayListener(this)
            });
            this.mediaElement.bind("canplay", function () {
                b.canplayListener(this)
            });
            this.mediaElement.bind("error", function (c) {
                b.errorListener(c, this)
            });
            this.mediaElement.bind("suspend", function () {
                b.suspendListener(this)
            })
        },
        updatePlayerInfo: function () {
            var c = this,
				b = 4;
            try {
                if (this.getState() !== "IDLE" && this.getState() !== "PAUSED") {
                    if (a.browser.opera) {
                        b = 3
                    }
                    if (this.mediaElement[0].networkState == b) {
                        this.errorListener();
                        return
                    }
                    if (this.getState() !== "ERROR") {
                        setTimeout(function () {
                            c.updatePlayerInfo()
                        }, 500)
                    }
                }
            } catch (d) { }
        },
        detachMedia: function () {
            try {
                this.mediaElement[0].pause();
                a(this.mediaElement[0]).attr("src", "");
                this.mediaElement[0].load()
            } catch (b) { }
        },
        setPlay: function () {
            try {
                this.mediaElement[0].play()
            } catch (b) { }
            this.updatePlayerInfo()
        },
        setPause: function () {
            try {
                this.mediaElement[0].pause()
            } catch (b) { }
        },
        setVolume: function (b) {
            try {
                this.mediaElement.attr("volume", b)
            } catch (c) {
                return false
            }
            return true
        },
        setSeek: function (c) {
            try {
                this.mediaElement.attr("currentTime", c)
            } catch (b) { }
        },
        setFullscreen: function (b) {
            if (this.element == "audio") {
                return
            }
            this._scaleVideo()
        },
        setResize: function () {
            if (this.element == "audio") {
                return
            }
            this._scaleVideo(false)
        }
    };
    playerModelAUDIO.prototype = a.extend(true, {}, playerModelVIDEO.prototype, {
        imageElement: {},
        element: "audio"
    })
});
var projekktorSchedule = function () { };
jQuery(function (a) {
    projekktorSchedule.prototype = {
        scheduleContainer: null,
        scheduleItems: [],
        config: {},
        initialize: function () {
            this.scheduleContainer = this.applyToPlayer(a(document.createElement("ul")).addClass("schedule"));
            this.pluginReady = true
        },
        scheduleModifiedHandler: function (b) {
            this.scheduledHandler(b)
        },
        scheduledHandler: function (b) {
            var c = this;
            this.scheduleContainer.html("");
            a(this.pp.getPlaylist()).each(function (e, f) {
                var g = (e + 1 < 10) ? "0" + (e + 1) + ". " : e + 1 + ". ",
					d = a(document.createElement("li")).appendTo(c.scheduleContainer).html("" + g + f.config.title + "").click(function () {
					    c.pp.setActiveItem(e)
					});
                c.blockSelection(d);
                c.scheduleItems[e] = d
            })
        },
        resizeHandler: function () {
            if (this.scheduleContainer.find(".scrollbar-pane").length > 0) {
                return
            }
            this.scheduleContainer.scrollbar()
        },
        itemHandler: function (b) {
            var c = this;
            a(this.scheduleItems).each(function (d, e) {
                a(e).removeClass("active");
                if (d == b) {
                    a(e).addClass("active")
                }
            })
        }
    }
});
(function (b, a) {
    b.fn.scrollbar = function (d) {
        var c = b.extend({}, b.fn.scrollbar.defaults, d);
        return this.each(function () {
            var f = b(this),
				e = {
				    arrows: c.arrows
				};
            if (c.containerHeight) {
                f.height(c.containerHeight)
            }
            e.containerHeight = f.height();
            e.contentHeight = 0;
            f.children().each(function () {
                e.contentHeight += b(this).outerHeight()
            });
            if (e.contentHeight <= e.containerHeight) {
                return true
            }
            var g = new b.fn.scrollbar.Scrollbar(f, e, c);
            g.buildHtml();
            g.initHandle();
            g.appendEvents()
        })
    };
    b.fn.scrollbar.defaults = {
        containerHeight: null,
        arrows: true,
        handleHeight: "auto",
        handleMinHeight: 30,
        scrollSpeed: 50,
        scrollStep: 20,
        scrollSpeedArrows: 40,
        scrollStepArrows: 3
    };
    b.fn.scrollbar.Scrollbar = function (e, d, c) {
        this.container = e;
        this.props = d;
        this.opts = c;
        this.mouse = {};
        this.props.arrows = this.container.hasClass("no-arrows") ? false : this.props.arrows
    };
    b.fn.scrollbar.Scrollbar.prototype = {
        buildHtml: function () {
            this.container.children().wrapAll('<div class="scrollbar-pane"/>');
            this.container.append('<div class="scrollbar-handle-container"><div class="scrollbar-handle"/></div>');
            if (this.props.arrows) {
                this.container.append('<div class="scrollbar-handle-up"/>').append('<div class="scrollbar-handle-down"/>')
            }
            var c = this.container.height();
            this.pane = this.container.find(".scrollbar-pane");
            this.handle = this.container.find(".scrollbar-handle");
            this.handleContainer = this.container.find(".scrollbar-handle-container");
            this.handleArrows = this.container.find(".scrollbar-handle-up, .scrollbar-handle-down");
            this.handleArrowUp = this.container.find(".scrollbar-handle-up");
            this.handleArrowDown = this.container.find(".scrollbar-handle-down");
            this.pane.defaultCss({
                top: 0,
                left: 0
            });
            this.handleContainer.defaultCss({
                right: 0
            });
            this.handle.defaultCss({
                top: 0,
                right: 0
            });
            this.handleArrows.defaultCss({
                right: 0
            });
            this.handleArrowUp.defaultCss({
                top: 0
            });
            this.handleArrowDown.defaultCss({
                bottom: 0
            });
            this.container.css({
                position: this.container.css("position") === "absolute" ? "absolute" : "relative",
                overflow: "hidden",
                height: c
            });
            this.pane.css({
                position: "absolute",
                overflow: "visible",
                height: "auto"
            });
            this.handleContainer.css({
                position: "absolute",
                top: this.handleArrowUp.outerHeight(true),
                height: (this.props.containerHeight - this.handleArrowUp.outerHeight(true) - this.handleArrowDown.outerHeight(true)) + "px"
            });
            this.handle.css({
                position: "absolute",
                cursor: "pointer"
            });
            this.handleArrows.css({
                position: "absolute",
                cursor: "pointer"
            })
        },
        initHandle: function () {
            this.props.handleContainerHeight = this.handleContainer.height();
            this.props.contentHeight = this.pane.height();
            this.props.handleHeight = this.opts.handleHeight == "auto" ? Math.max(Math.ceil(this.props.containerHeight * this.props.handleContainerHeight / this.props.contentHeight), this.opts.handleMinHeight) : this.opts.handleHeight;
            this.handle.height(this.props.handleHeight);
            this.handle.height(2 * this.handle.height() - this.handle.outerHeight(true));
            this.props.handleTop = {
                min: 0,
                max: this.props.handleContainerHeight - this.props.handleHeight
            };
            this.props.handleContentRatio = (this.props.contentHeight - this.props.containerHeight) / (this.props.handleContainerHeight - this.props.handleHeight);
            this.handle.top = 0
        },
        appendEvents: function () {
            this.handle.bind("mousedown.handle", b.proxy(this, "startOfHandleMove"));
            this.handleContainer.bind("mousedown.handle", b.proxy(this, "onHandleContainerMousedown"));
            this.handleContainer.bind("mouseenter.container mouseleave.container", b.proxy(this, "onHandleContainerHover"));
            this.handleArrows.bind("mousedown.arrows", b.proxy(this, "onArrowsMousedown"));
            this.container.bind("mousewheel.container", b.proxy(this, "onMouseWheel"));
            this.container.bind("mouseenter.container mouseleave.container", b.proxy(this, "onContentHover"));
            this.handle.bind("click.scrollbar", this.preventClickBubbling);
            this.handleContainer.bind("click.scrollbar", this.preventClickBubbling);
            this.handleArrows.bind("click.scrollbar", this.preventClickBubbling)
        },
        mousePosition: function (c) {
            return c.pageY || (c.clientY + (a.documentElement.scrollTop || a.body.scrollTop)) || 0
        },
        startOfHandleMove: function (c) {
            c.preventDefault();
            c.stopPropagation();
            this.mouse.start = this.mousePosition(c);
            this.handle.start = this.handle.top;
            this.handle.bind("mousemove.handle", b.proxy(this, "onHandleMove")).bind("mouseup.handle", b.proxy(this, "endOfHandleMove"));
            this.handle.addClass("move");
            this.handleContainer.addClass("move")
        },
        onHandleMove: function (c) {
            c.preventDefault();
            var d = this.mousePosition(c) - this.mouse.start;
            this.handle.top = this.handle.start + d;
            this.setHandlePosition();
            this.setContentPosition()
        },
        endOfHandleMove: function (c) {
            this.handle.unbind("mousemove.handle");
            this.handle.removeClass("move");
            this.handleContainer.removeClass("move")
        },
        setHandlePosition: function () {
            this.handle.top = (this.handle.top > this.props.handleTop.max) ? this.props.handleTop.max : this.handle.top;
            this.handle.top = (this.handle.top < this.props.handleTop.min) ? this.props.handleTop.min : this.handle.top;
            this.handle[0].style.top = this.handle.top + "px"
        },
        setContentPosition: function () {
            this.pane.top = -1 * this.props.handleContentRatio * this.handle.top;
            this.pane[0].style.top = this.pane.top + "px"
        },
        onMouseWheel: function (c, d) {
            this.handle.top -= d;
            this.setHandlePosition();
            this.setContentPosition();
            if (this.handle.top > this.props.handleTop.min && this.handle.top < this.props.handleTop.max) {
                c.preventDefault()
            }
        },
        onHandleContainerMousedown: function (d) {
            d.preventDefault();
            if (!b(d.target).hasClass("scrollbar-handle-container")) {
                return false
            }
            this.handle.direction = (this.handle.offset().top < this.mousePosition(d)) ? 1 : -1;
            this.handle.step = this.opts.scrollStep;
            var c = this;
            b(a).bind("mouseup.handlecontainer", function () {
                clearInterval(e);
                c.handle.unbind("mouseenter.handlecontainer");
                b(a).unbind("mouseup.handlecontainer")
            });
            this.handle.bind("mouseenter.handlecontainer", function () {
                clearInterval(e)
            });
            var e = setInterval(b.proxy(this.moveHandle, this), this.opts.scrollSpeed)
        },
        onArrowsMousedown: function (c) {
            c.preventDefault();
            this.handle.direction = b(c.target).hasClass("scrollbar-handle-up") ? -1 : 1;
            this.handle.step = this.opts.scrollStepArrows;
            b(c.target).addClass("move");
            var d = setInterval(b.proxy(this.moveHandle, this), this.opts.scrollSpeedArrows);
            b(a).one("mouseup.arrows", function () {
                clearInterval(d);
                b(c.target).removeClass("move")
            })
        },
        moveHandle: function () {
            this.handle.top = (this.handle.direction === 1) ? Math.min(this.handle.top + this.handle.step, this.props.handleTop.max) : Math.max(this.handle.top - this.handle.step, this.props.handleTop.min);
            this.handle[0].style.top = this.handle.top + "px";
            this.setContentPosition()
        },
        onContentHover: function (c) {
            if (c.type === "mouseenter") {
                this.container.addClass("hover");
                this.handleContainer.addClass("hover")
            } else {
                this.container.removeClass("hover");
                this.handleContainer.removeClass("hover")
            }
        },
        onHandleContainerHover: function (c) {
            if (c.type === "mouseenter") {
                this.handleArrows.addClass("hover")
            } else {
                this.handleArrows.removeClass("hover")
            }
        },
        preventClickBubbling: function (c) {
            c.stopPropagation()
        }
    };
    b.fn.defaultCss = function (c) {
        var d = {
            right: "auto",
            left: "auto",
            top: "auto",
            bottom: "auto",
            position: "static"
        };
        return this.each(function () {
            var f = b(this);
            for (var e in c) {
                if (f.css(e) === d[e]) {
                    f.css(e, c[e])
                }
            }
        })
    };
    b.event.special.mousewheel = {
        setup: function () {
            if (this.addEventListener) {
                this.addEventListener("mousewheel", b.fn.scrollbar.mouseWheelHandler, false);
                this.addEventListener("DOMMouseScroll", b.fn.scrollbar.mouseWheelHandler, false)
            } else {
                this.onmousewheel = b.fn.scrollbar.mouseWheelHandler
            }
        },
        teardown: function () {
            if (this.removeEventListener) {
                this.removeEventListener("mousewheel", b.fn.scrollbar.mouseWheelHandler, false);
                this.removeEventListener("DOMMouseScroll", b.fn.scrollbar.mouseWheelHandler, false)
            } else {
                this.onmousewheel = null
            }
        }
    };
    b.fn.extend({
        mousewheel: function (c) {
            return c ? this.bind("mousewheel", c) : this.trigger("mousewheel")
        },
        unmousewheel: function (c) {
            return this.unbind("mousewheel", c)
        }
    });
    b.fn.scrollbar.mouseWheelHandler = function (g) {
        var e = g || window.event,
			d = [].slice.call(arguments, 1),
			j = 0,
			c = true,
			f = 0,
			h = 0;
        g = b.event.fix(e);
        g.type = "mousewheel";
        if (g.wheelDelta) {
            j = g.wheelDelta / 120
        }
        if (g.detail) {
            j = -g.detail / 3
        }
        if (e.axis !== undefined && e.axis === e.HORIZONTAL_AXIS) {
            h = 0;
            f = -1 * j
        }
        if (e.wheelDeltaY !== undefined) {
            h = e.wheelDeltaY / 120
        }
        if (e.wheelDeltaX !== undefined) {
            f = -1 * e.wheelDeltaX / 120
        }
        d.unshift(g, j, f, h);
        return b.event.handle.apply(this, d)
    }
})(jQuery, document);
var projekktorShare = function () { };
jQuery(function (a) {
    projekktorShare.prototype = {
        _controlHideTimer: null,
        _isFading: false,
        _wasPlaying: false,
        embPopup: null,
        socialLink: false,
        socialSidebar: null,
        socialPopup: null,
        socialButtons: [],
        config: {
            useDisplay: true,
            socialbarDomId: "socialbar",
            socialButtonDomId: "socialbbutton",
            socialPopupDomId: "socialpopup",
            embed: {
                callback: "embedClick",
                domId: "embed",
                code: '<iframe id="{embedid}" src="{playerurl}" width="640" height="385" frameborder="0"></iframe>',
                enable: false,
                nameText: "embed",
                headlineText: "Copy this:",
                closeText: "Close Window",
                descText: "This is the embed code for the current video which supports iPad, iPhone, Flash and native players."
            },
            links: [{
                buttonText: "twitter",
                domId: "twitter",
                text: "I found a cool HTML5 video player. Check this out.",
                code: "http://twitter.com/share?url={pageurl}&text={text}&via=projekktor"
            }, {
                buttonText: "facebook",
                domId: "facebook",
                text: "I found a cool HTML5 video player. Check this out.",
                code: "http://www.facebook.com/sharer.php?u={pageurl}&t={text}"
            }]
        },
        initialize: function () {
            this.drawSidebar();
            if (this.getPlayerConfig("sandBox") !== false || this.getItemConfig("embed").enable == true) {
                this.drawPopup();
                this.addTool("embed")
            }
            for (var b = 0; b < this.getPlayerConfig("links").length; b++) {
                this.addTool(this.getPlayerConfig("links")[b])
            }
            this.pluginReady = true
        },
        itemHandler: function () {
            try {
                this.socialLink = (!this.getItemConfig("link")) ? this.pp.getSandboxWindow().attr("location") : this.getItemConfig("link")
            } catch (c) {
                this.socialLink = this.getItemConfig("link")
            }
            for (var b = 0; b < this.getPlayerConfig("links").length; b++) {
                this.toggleTool(this.getPlayerConfig("links")[b].domId, this.socialLink === false)
            }
        },
        drawSidebar: function () {
            this.socialSidebar = this.applyToPlayer(a(document.createElement("div")).addClass(this.config.socialbarDomId).hide())
        },
        drawPopup: function () {
            if (this.getItemConfig("useDisplay") == true) {
                this.socialPopup = this.applyToPlayer(a(document.createElement("div")).addClass(this.config.socialPopupDomId).hide())
            }
        },
        openWindow: function (b) {
            this._isFading = true;
            this._wasPlaying = (this.pp.getState() === "PLAYING");
            if (this._wasPlaying === true) {
                this.pp.setPause()
            }
            this[b + "FillWindow"](this.socialPopup);
            this.socialSidebar.hide();
            this.socialPopup.show()
        },
        closeWindow: function () {
            this._isFading = false;
            this.socialSidebar.show();
            this.socialPopup.hide().html("");
            if (this._wasPlaying === true) {
                this.pp.setPlay()
            }
        },
        openURL: function (c) {
            var b = window;
            b.open(c);
            return false
        },
        addTool: function (c) {
            var d = this,
				b = null;
            if (c.code == false) {
                return
            }
            if (this.playerDom.find("." + this.pp.getCssClass() + "shareicn_" + c.domId).length == 0) {
                if (this.socialSidebar && c.buttonText) {
                    b = a(document.createElement("div")).html(c.buttonText).addClass(this.pp.getCssClass() + "socialbutton").appendTo(this.socialSidebar).show();
                    a(document.createElement("div")).addClass(this.pp.getCssClass() + "shareicn_" + c.domId).prependTo(b)
                }
            } else {
                b = this.playerDom.find("." + this.pp.getCssClass() + "shareicn_" + c.domId)
            }
            if (b) {
                b.click(function (e) {
                    if (a.browser.msie) {
                        e.cancelBubble = true
                    } else {
                        e.stopPropagation()
                    }
                    d.buttonClick(c)
                })
            }
            this.socialButtons.push()
        },
        toggleTool: function (c, d) {
            var b = this;
            a.each(this.playerDom.find("." + this.pp.getCssClass() + "socialbutton"), function () {
                if (a(this).attr("id") === b.pp.getId() + "_" + c) {
                    if (d === true) {
                        a(this).hide()
                    } else {
                        a(this).show()
                    }
                }
            })
        },
        hideSidebar: function () {
            clearTimeout(this._controlHideTimer);
            if (!this.socialSidebar.is(":visible")) {
                return
            }
            this.socialSidebar.stop(true, true);
            this.socialSidebar.fadeOut("slow")
        },
        showSidebar: function () {
            var b = this;
            if (this._isFading == true) {
                return
            }
            if (this.pp.getState() === "IDLE") {
                return
            }
            clearTimeout(this._controlHideTimer);
            if (this.socialSidebar.is(":visible")) {
                b._controlHideTimer = setTimeout(function () {
                    b.hideSidebar()
                }, 1500);
                return
            }
            this._isFading = true;
            this.socialSidebar.stop(true, true);
            this.socialSidebar.fadeIn("fast", function () {
                b._isFading = false
            })
        },
        mousemoveHandler: function () {
            this.showSidebar()
        },
        embedClick: function (b) {
            this.openWindow("embed")
        },
        embedFillWindow: function (b) {
            var c = this;
            a(document.createElement("p")).appendTo(b).html(this.getPlayerConfig("embed").descText);
            a(document.createElement("p")).appendTo(b).html(this.getPlayerConfig("embed").headlineText);
            a(document.createElement("textarea")).appendTo(b).attr("readonly", "readonly").val(this.getEmbedCode()).click(function () {
                this.select()
            }).focus(function () {
                this.select()
            });
            a(document.createElement("a")).appendTo(b).html(this.getPlayerConfig("embed").closeText).click(function () {
                c.closeWindow()
            })
        },
        getEmbedCode: function () {
            var d = this.config.embed.code;
            var c = {};
            c.embedid = this.pp.randomId(8);
            c.playerurl = window.location.href + window.location.hash;
            c.ID = this.pp.getItemConfig("ID");
            for (var b in c) {
                d = d.replace("{" + b + "}", c[b])
            }
            return d
        },
        buttonClick: function (c) {
            var d = {};
            try {
                d.text = escape(c.text || "")
            } catch (f) { }
            d.pageurl = escape(this.socialLink || "");
            for (var b in d) {
                c.code = c.code.replace("{" + b + "}", d[b])
            }
            this.openURL(c.code)
        }
    }
});
var projekktorDisplay = function () { };
jQuery(function (a) {
    projekktorDisplay.prototype = {
        logo: null,
        logoIsFading: false,
        display: null,
        clickCatcher: null,
        displayClicks: 0,
        bufferingIcon: null,
        bufferingIconSprite: null,
        bufferDelayTimer: null,
        bufferIconDelay: 1,
        config: {
            bufferIconDelay: 200,
            spriteUrl: "",
            spriteWidth: 50,
            spriteHeight: 50,
            spriteTiles: 25,
            spriteOffset: 1,
            spriteCountUp: false,
            logoImage: "",
            logoDelay: 0,
            logoPosition: "tl",
            logoURL: false,
            logoTarget: "_self"
        },
        initialize: function () {
            var c = this;
            var b = {
                position: "absolute",
                overflow: "hidden",
                height: "100%",
                width: "100%",
                top: 0,
                left: 0,
                padding: 0,
                margin: 0,
                display: "block"
            };
            this.startButton = this.applyToPlayer(a(document.createElement("div")).addClass("start").hide());
            this.bufferingIcon = this.applyToPlayer(a(document.createElement("div")).addClass("buffering").hide());
            if (this.config.spriteUrl != "") {
                this.bufferingIconSprite = a(document.createElement("div")).appendTo(this.bufferingIcon).css({
                    width: this.config.spriteWidth,
                    height: this.config.spriteHeight,
                    marginLeft: ((this.bufferingIcon.width() - this.config.spriteWidth) / 2) + "px",
                    marginTop: ((this.bufferingIcon.height() - this.config.spriteHeight) / 2) + "px",
                    backgroundColor: "transparent",
                    backgroundImage: "url(" + this.config.spriteUrl + ")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "0 0"
                }).hide()
            }
            this.display = this.applyToPlayer(a(document.createElement("div")).addClass("display").css(b));
            this.pp.getMediaContainer();
            this.logo = this.applyToPlayer(a(document.createElement("img")).addClass("logo").attr("src", "").css("position", "absolute").css(((this.config.logoPosition.indexOf("r") > -1) ? "right" : "left"), "2%").css(((this.config.logoPosition.indexOf("t") > -1) ? "top" : "bottom"), "2%").hide());
            this.clickCatcher = a(document.createElement("div")).appendTo(this.display).css(b);
            this.pluginReady = true
        },
        displayReadyHandler: function () {
            var b = this;
            this.clickCatcher.unbind();
            this.clickCatcher.click(function (c) {
                b._displayClickListener(c)
            });
            this.startButton.unbind();
            this.startButton.click(function () {
                b.pp.setPlay()
            })
        },
        bufferHandler: function (b) {
            if (b == "EMPTY") {
                this.showBufferIcon()
            } else {
                this.hideBufferIcon()
            }
        },
        stateHandler: function (b) {
            if (b === "IDLE") {
                this.startButton.show()
            } else {
                this.startButton.hide()
            }
            if (b == "AWAKENING" || b == "COMPLETED" || b == "ERROR") {
                this.hideBufferIcon()
            }
            if (b == "ERROR" || b === "STOPPED") {
                this.logo.hide()
            }
        },
        stoppedHandler: function () {
            this.hideBufferIcon()
        },
        scheduleLoadingHandler: function () {
            this.startButton.hide();
            this.showBufferIcon()
        },
        scheduledHandler: function () {
            if (!this.getPlayerConfig("autoplay")) {
                this.startButton.show()
            }
            if (this.getPlayerConfig("designMode") != true) {
                this.hideBufferIcon()
            }
        },
        itemHandler: function () {
            var b = this;
            if (this.getPlayerConfig("designMode") != true) {
                this.hideBufferIcon()
            } else {
                this.showBufferIcon()
            }
            this.logoIsFading = false;
            this.logo.stop(true, true).hide().unbind();
            if (this.getItemConfig("logoImage") != false) {
                this.logo.attr("src", this.getItemConfig("logoImage")).css({
                    cursor: (this.getItemConfig("logoURL") != "") ? "pointer" : "normal"
                }).click(function () {
                    if (b.getItemConfig("logoURL") === false) {
                        return false
                    }
                    window.open(b.getItemConfig("logoURL"), b.getItemConfig("logoTarget")).focus();
                    return false
                })
            } else {
                this.logo.attr("src", "").hide()
            }
        },
        timeHandler: function () {
            if (this.getItemConfig("logoImage") == false) {
                return
            }
            if (this.pp.getIsMobileClient()) {
                return
            }
            var b = this.pp.getPosition(),
				d = this.pp.getDuration(),
				c = this;
            if (!this.logo.is(":visible") && !this.logoIsFading && b + this.config.logoDelay < d) {
                if (b > this.config.logoDelay && d > (this.config.logoDelay * 2)) {
                    this.logoIsFading = true;
                    this.logo.fadeIn("slow", function () {
                        c.logoIsFading = false
                    })
                }
            }
            if (this.logo.is(":visible") && !this.logoIsFading) {
                if (b + this.config.logoDelay > d) {
                    this.logoIsFading = true;
                    this.logo.fadeOut("slow", function () {
                        c.logoIsFading = false
                    })
                }
            }
        },
        _displayClickListener: function (b) {
            var c = this;
            if (this.pp.getState() == "ERROR") {
                this.pp.setActiveItem("next");
                return false
            }
            this.displayClicks++;
            if (this.displayClicks > 0) {
                setTimeout(function () {
                    if (c.displayClicks == 1) {
                        c._displaySingleClick()
                    } else {
                        if (c.displayClicks == 2) {
                            c._displayDblClick()
                        }
                    }
                    c.displayClicks = 0;
                    if (a.browser.msie) {
                        b.cancelBubble = true
                    } else {
                        b.stopPropagation()
                    }
                }, 250)
            }
            return false
        },
        _displaySingleClick: function () {
            this.pp.setPlayPause()
        },
        _displayDblClick: function () {
            var b = this;
            this.pp.setFullscreen(!this.pp.env.inFullscreen)
        },
        hideBufferIcon: function () {
            var b = this;
            clearTimeout(this.bufferDelayTimer);
            this.bufferingIcon.stop(true, true);
            this.bufferingIcon.fadeOut("fast")
        },
        showBufferIcon: function (b) {
            var c = this;
            clearTimeout(this.bufferDelayTimer);
            if (this.pp.getModel() === "YTAUDIO" && this.pp.getModel() === "YTVIDEO") {
                b = true
            }
            if (b != true && this.config.bufferIconDelay > 0) {
                this.bufferDelayTimer = setTimeout(function () {
                    c.showBufferIcon(true)
                }, c.config.bufferIconDelay);
                return
            }
            this.bufferingIcon.stop(true, true);
            this.bufferingIcon.fadeIn("fast", function () {
                if (c.bufferingIconSprite == null) {
                    return
                }
                var d = (c.config.spriteCountUp == true) ? 0 : (c.config.spriteHeight + c.config.spriteOffset) * c.config.spriteTiles;
                c.bufferingIconSprite.show();
                (function () {
                    if (!c.bufferingIcon.is(":visible")) {
                        return
                    }
                    c.bufferingIconSprite.css("backgroundPosition", "0px -" + d + "px");
                    if (c.config.spriteCountUp == true) {
                        d += c.config.spriteHeight + c.config.spriteOffset
                    } else {
                        d -= c.config.spriteHeight + c.config.spriteOffset
                    }
                    if (d >= c.config.spriteHeight * c.config.spriteTiles) {
                        d = 0
                    }
                    setTimeout(arguments.callee, 60)
                })()
            })
        }
    }
});
var projekktorControlbar = function () { };
jQuery(function (a) {
    projekktorControlbar.prototype = {
        _cTimer: null,
        _noCHide: false,
        _cFading: false,
        _vSliderAct: false,
        _storeVol: 0,
        _timeTags: {},
        cb: null,
        cbFS: null,
        _pos: {
            left: 0,
            right: 0
        },
        controlElements: {},
        controlElementsConfig: {
            cb: null,
            playhead: {
                on: null,
                call: null
            },
            loaded: {
                on: "click",
                call: "scrubberClk"
            },
            scrubber: {
                on: "click",
                call: "scrubberClk"
            },
            play: {
                on: "click",
                call: "playClk"
            },
            pause: {
                on: "click",
                call: "pauseClk"
            },
            prev: {
                on: "click",
                call: "prevClk"
            },
            next: {
                on: "click",
                call: "nextClk"
            },
            rewind: {
                on: "click",
                call: "rewindClk"
            },
            forward: {
                on: "click",
                call: "forwardClk"
            },
            fsexit: {
                on: "click",
                call: "exitFullscreenClk"
            },
            fsenter: {
                on: "click",
                call: "enterFullscreenClk"
            },
            vslider: {
                on: "click",
                call: "vsliderClk"
            },
            vmarker: {
                on: "click",
                call: "vsliderClk"
            },
            vknob: {
                on: "mousedown",
                call: "vknobStartDragListener"
            },
            mute: {
                on: "click",
                call: "muteClk"
            },
            unmute: {
                on: "click",
                call: "unmuteClk"
            },
            vmax: {
                on: "click",
                call: "vmaxClk"
            },
            open: {
                on: "click",
                call: "openCloseClk"
            },
            close: {
                on: "click",
                call: "openCloseClk"
            },
            loopon: {
                on: "click",
                call: "loopClk"
            },
            loopoff: {
                on: "click",
                call: "loopClk"
            },
            draghandle: {
                on: "mousedown",
                call: "handleStartDragListener"
            },
            controls: {
                on: null,
                call: null
            },
            title: null,
            sec_dur: null,
            min_dur: null,
            hr_dur: null,
            sec_elp: null,
            min_elp: null,
            hr_elp: null,
            sec_rem: null,
            min_rem: null,
            hr_rem: null
        },
        config: {
            controlsDisableFade: false,
            controlsTemplate: "<div {fsexit}></div><div {fsenter}></div><div {play}></div><div {pause}></div><div {prev}></div><div {next}></div><div {title}></div><div {timeleft}>{min_dur}:{sec_dur} | {min_rem}:{sec_rem}</div><div {scrubber}><div {loaded}></div><div {playhead}></div></div><div {vslider}><div {vmarker}></div><div {vknob}></div></div><div {mute}></div><div {vmax}></div>",
            controlsTemplateFull: null,
            toggleMute: false
        },
        initialize: function () {
            var f = this,
				d = this.playerDom.html(),
				c = true,
				g = this.getPlayerConfig("cssClassPrefix");
            for (var b in this.controlElementsConfig) {
                if (d.match(new RegExp(g + b, "gi"))) {
                    c = false;
                    break
                }
            }
            if (c) {
                this.cb = this.applyToPlayer(a(document.createElement("div")).addClass("controls"));
                this.cbFS = this.applyToPlayer(a(document.createElement("div")).addClass("controls").addClass("fullscreen").removeClass("active").addClass("inactive"));
                if (this.getItemConfig("controlsDisableFade") !== true) {
                    this.cb.addClass("fade");
                    this.cbFS.addClass("fade")
                }
                this.applyTemplate(this.cb, this.getItemConfig("controlsTemplate"));
                this.applyTemplate(this.cbFS, this.getItemConfig("controlsTemplateFull") || this.getItemConfig("controlsTemplate"))
            } else {
                this.cb = this.playerDom.find("." + g + "controls:not(.fullscreen)");
                this.cbFS = this.playerDom.children("." + g + "controls.fullscreen")
            }
            for (var b in this.controlElementsConfig) {
                this.controlElements[b] = a(this.playerDom).find("." + g + b);
                this.blockSelection(this.controlElements[b])
            }
            if (!this.getPlayerConfig("designMode") === true && this.cb !== null) {
                this.cb.removeClass("active").addClass("inactive");
                this.cbFS.removeClass("active").addClass("inactive")
            }
            if (this.getPlayerConfig("designMode") === true) {
                try {
                    this.drawTitle("Phnglui mglwnafh Cthulhu Rlyeh wgahnagl fhtagn.");
                    this.drawUpdateTimeDisplay();
                    this.controlElements.playhead.css("width", "50%");
                    this.controlElements.loaded.css("width", "80%")
                } catch (h) { }
            }
            this.addGuiListeners();
            this._storeVol = this.getPlayerConfig("volume");
            this.pluginReady = true
        },
        applyTemplate: function (d, c) {
            var e = this,
				f = this.getPlayerConfig("cssClassPrefix");
            if (c) {
                var b = c.match(/\{[a-zA-Z_]*\}/gi);
                a.each(b, function (g, h) {
                    var j = h.replace(/\{|}/gi, "");
                    if (h.match(/\_/gi)) {
                        c = c.replace(h, '<span class="' + f + j + '"></span>')
                    } else {
                        c = c.replace(h, 'class="' + f + j + '"')
                    }
                });
                d.html(c)
            }
        },
        itemHandler: function (b) {
            this.pluginReady = true;
            this.hidecb(true)
        },
        displayReadyHandler: function (b) {
            this.pluginReady = true;
            this.showcb(true)
        },
        drawUpdateControls: function () {
            var b = this;
            clearTimeout(this._cTimer);
            if (this.pp.getItemConfig("controls") == false) {
                this.hidecb(true);
                return
            }
            var c = (this.pp.getItemCount() < 2 || this.pp.getItemConfig("disallowSkip"));
            if (!c) {
                this.controlElements.prev.removeClass("inactive").addClass("active");
                this.controlElements.next.removeClass("inactive").addClass("active")
            } else {
                this.controlElements.prev.removeClass("active").addClass("inactive");
                this.controlElements.next.removeClass("active").addClass("inactive")
            }
            if (this.pp.getItemIdx() < 1) {
                this.controlElements.prev.removeClass("active").addClass("inactive")
            }
            if (this.pp.getItemIdx() >= this.pp.getItemCount() - 1) {
                this.controlElements.next.removeClass("active").addClass("inactive")
            }
            if (this.pp.getItemConfig("disablePause")) {
                this.controlElements.pause.removeClass("active").addClass("inactive");
                this.controlElements.play.removeClass("active").addClass("inactive")
            } else {
                if (this.pp.getState() === "PLAYING") {
                    this.drawPauseButton()
                }
                if (this.pp.getState() === "PAUSED") {
                    this.drawPlayButton()
                }
                if (this.pp.getState() === "IDLE") {
                    this.drawPlayButton()
                }
            }
            if (this.pp.getInFullscreen() === true) {
                this.drawExitFullscreenButton()
            } else {
                this.drawEnterFullscreenButton()
            }
            if (this.pp.getItemConfig("disableFullscreen")) {
                this.controlElements.fsexit.removeClass("active").addClass("inactive");
                this.controlElements.fsenter.removeClass("active").addClass("inactive")
            }
            if (this.pp.config.loop != true) {
                this.controlElements.loopoff.removeClass("active").addClass("inactive");
                this.controlElements.loopon.removeClass("inactive").addClass("active")
            } else {
                this.controlElements.loopoff.removeClass("inactive").addClass("active");
                this.controlElements.loopon.removeClass("active").addClass("inactive")
            }
            this.drawTitle(this.pp.getItemConfig("title"));
            this.drawUpdateTimeDisplay();
            this.drawUpdateVolumeDisplay(this.pp.getVolume())
        },
        stateHandler: function (b) {
            this.drawUpdateControls();
            if (b === "STOPPED" || b === "STARTING" || b == "AWAKENING" || b == "IDLE") {
                this.drawUpdateTimeDisplay(0, 0, 0);
                this.hidecb(true)
            } else {
                this.drawUpdateProgressDisplay()
            }
        },
        scheduleModifiedHandler: function () {
            if (this.pp.getState() === "IDLE") {
                return
            }
            this.drawUpdateControls();
            this.drawUpdateTimeDisplay();
            this.drawUpdateProgressDisplay()
        },
        volumeHandler: function (b) {
            this.drawUpdateVolumeDisplay(b)
        },
        progressHandler: function (b) {
            this.drawUpdateProgressDisplay()
        },
        timeHandler: function (b) {
            this.drawUpdateTimeDisplay();
            this.drawUpdateProgressDisplay()
        },
        fullscreenHandler: function (d) {
            var b = this,
				c = this.getPlayerConfig("cssClassPrefix");
            this._noCHide = false;
            this._cFading = false;
            this._vSliderAct = false;
            clearTimeout(this._cTimer);
            if (this.pp.getInFullscreen() === true) {
                this.playerDom.children("." + c + "controls:not(.fullscreen)").stop(true, true).removeClass("active").addClass("inactive").css("display", "");
                this.playerDom.children("." + c + "controls.fullscreen").stop(true, true).removeClass("inactive").addClass("active").css("display", "")
            } else {
                this.playerDom.children("." + c + "controls:not(.fullscreen)").stop(true, true).removeClass("inactive").addClass("active").css("display", "");
                this.playerDom.children("." + c + "controls.fullscreen").stop(true, true).removeClass("active").addClass("inactive").css("display", "")
            }
            this.drawUpdateControls();
            if (this.pp.getState() == "IDLE") {
                this.hidecb(true)
            } else {
                this._cTimer = setTimeout(function () {
                    b.hidecb()
                }, 2500)
            }
        },
        addGuiListeners: function () {
            var b = this;
            a.each(this.controlElementsConfig, function (c, d) {
                if (!d) {
                    return
                }
                if (d.on != null) {
                    b.controlElements[c][d.on](function (e) {
                        b.clickCatcher(e, d.call, b.controlElements[c])
                    })
                }
            });
            this.cbFS.mouseenter(function (c) {
                b.controlsMouseEnterListener(c)
            });
            this.cbFS.mouseleave(function (c) {
                b.controlsMouseLeaveListener(c)
            });
            this.cb.mouseenter(function (c) {
                b.controlsMouseEnterListener(c)
            });
            this.cb.mouseleave(function (c) {
                b.controlsMouseLeaveListener(c)
            })
        },
        clickCatcher: function (b, d, c) {
            if (a.browser.msie) {
                b.cancelBubble = true
            } else {
                b.stopPropagation()
            }
            if (c.hasClass("inactive")) {
                return
            }
            this[d](b, c)
        },
        drawTitle: function (b) {
            this.controlElements.title.html(b)
        },
        hidecb: function (b) {
            var c = this.getPlayerConfig("cssClassPrefix");
            clearTimeout(this._cTimer);
            if (this.pp.getInFullscreen() === true) {
                dest = this.playerDom.children("." + c + "controls.fullscreen")
            } else {
                dest = this.playerDom.children("." + c + "controls:not(.fullscreen)")
            }
            if (dest == null) {
                return
            }
            dest.stop(true, true);
            if (!dest.is(":visible")) {
                return
            }
            if (b === true) {
                this._noCHide = false;
                this._cFading = false;
                dest.removeClass("active").addClass("inactive").css("display", "");
                return
            } else {
                if (!dest.hasClass("fade")) {
                    return
                }
                if (this.getPlayerConfig("designMode") == true) {
                    return
                }
                if (this._noCHide == true && this.getPlayerConfig("controls") == true) {
                    return
                }
            }
            if (this.getPlayerConfig("controls") == false) {
                dest.removeClass("active").addClass("inactive")
            } else {
                dest.fadeOut("slow", function () {
                    a(this).removeClass("active").addClass("inactive").css("display", "")
                })
            }
        },
        showcb: function () {
            var c = this,
				b = null,
				d = this.getPlayerConfig("cssClassPrefix");
            clearTimeout(this._cTimer);
            if (this.pp.getInFullscreen() === true) {
                b = this.playerDom.children("." + d + "controls.fullscreen")
            } else {
                b = this.playerDom.children("." + d + "controls:not(.fullscreen)")
            }
            if (b == null) {
                return
            }
            if ("IDLE|AWAKENING|ERROR".indexOf(this.pp.getState()) > -1) {
                return
            }
            if (this.pp.getItemConfig("controls") == false) {
                return
            }
            if (this.pp.getIsAutoslide() == true) {
                return
            }
            b.stop(true, true);
            if (!b.hasClass("fade") && instant == true) {
                b.removeClass("inactive").addClass("active").css("display", "");
                return
            }
            if (b.is(":visible") || this._cFading == true) {
                c._cTimer = setTimeout(function () {
                    c.hidecb()
                }, 2500);
                return
            }
            this._cFading = true;
            b.fadeIn("fast", function () {
                c._cFading = false;
                a(this).removeClass("inactive").addClass("active").css("display", "")
            })
        },
        drawUpdateTimeDisplay: function (f, d, k) {
            try {
                var c = (f != undefined) ? f : this.pp.getLoadPlaybackProgress(),
					j = (d != undefined) ? d : this.pp.getDuration(),
					b = (k != undefined) ? k : this.pp.getPosition()
            } catch (g) {
                var c = f || 0,
					j = d || 0,
					b = k || 0
            }
            this.controlElements.playhead.css("width", c + "%");
            var h = a.extend({}, this._clockDigits(j, "dur"), this._clockDigits(b, "elp"), this._clockDigits(j - b, "rem"));
            a.each(this.controlElements, function (e, l) {
                if (h[e]) {
                    l.html(h[e])
                }
            })
        },
        drawUpdateProgressDisplay: function () {
            this.controlElements.loaded.css("width", this.pp.getLoadProgress() + "%")
        },
        drawUpdateVolumeDisplay: function (b) {
            if (this._vSliderAct == true) {
                return
            }
            if (b == undefined) {
                return
            }
            clearTimeout(this._cTimer);
            var d = this.cb.is(":visible"),
				c = this;
            this.cb.stop(true, true).show();
            switch (b) {
                case 0:
                    this.controlElements.vknob.css("left", 0);
                    break;
                case 1:
                    this.controlElements.vknob.css("left", (this.controlElements.vslider.width() - (this.controlElements.vknob.width() / 2)) + "px");
                    break;
                default:
                    this.controlElements.vknob.css("left", b * (this.controlElements.vslider.width() - (this.controlElements.vknob.width() / 2)) + "px");
                    break
            }
            this.controlElements.vmarker.css("width", b * 100 + "%");
            this.drawMuteIcon();
            this._cTimer = setTimeout(function () {
                c.hidecb()
            }, 3500);
            if (!d) {
                this.cb.hide()
            }
        },
        drawPauseButton: function (b) {
            this.controlElements.pause.removeClass("inactive").addClass("active");
            this.controlElements.play.removeClass("active").addClass("inactive")
        },
        drawPlayButton: function (b) {
            this.controlElements.pause.removeClass("active").addClass("inactive");
            this.controlElements.play.removeClass("inactive").addClass("active")
        },
        drawEnterFullscreenButton: function (b) {
            this.controlElements.fsexit.removeClass("active").addClass("inactive");
            this.controlElements.fsenter.removeClass("inactive").addClass("active")
        },
        drawExitFullscreenButton: function (b) {
            this.controlElements.fsexit.removeClass("inactive").addClass("active");
            this.controlElements.fsenter.removeClass("active").addClass("inactive")
        },
        drawMuteIcon: function (b) {
            if (this.getItemConfig("toggleMute") === false) {
                return
            }
            if (this.pp.getVolume() > 0) {
                this.controlElements.mute.removeClass("inactive").addClass("active");
                this.controlElements.unmute.removeClass("active").addClass("inactive");
                this.controlElements.vmax.removeClass("active").addClass("inactive")
            } else {
                this.controlElements.mute.removeClass("active").addClass("inactive");
                this.controlElements.unmute.removeClass("inactive").addClass("active");
                this.controlElements.vmax.removeClass("inactive").addClass("active")
            }
        },
        playClk: function (b) {
            this.pp.setPlay()
        },
        pauseClk: function (b) {
            this.pp.setPause()
        },
        controlsMouseEnterListener: function (b) {
            this._noCHide = true
        },
        controlsMouseLeaveListener: function (b) {
            this._noCHide = false
        },
        controlsClk: function (b) { },
        mousemoveHandler: function (b) {
            this.showcb()
        },
        mouseleaveHandler: function (b) {
            var c = this;
            this._cTimer = setTimeout(function () {
                c.hidecb()
            }, 2500)
        },
        prevClk: function (b) {
            this.pp.setActiveItem("previous")
        },
        nextClk: function (b) {
            this.pp.setActiveItem("next")
        },
        forwardClk: function (b) {
            this.pp.setPlayhead("+10")
        },
        rewindClk: function (b) {
            this.pp.setPlayhead("-10")
        },
        muteClk: function (b) {
            this._storeVol = (this.pp.getVolume() == 0) ? this.getPlayerConfig("volume") : this.pp.getVolume();
            this.pp.setVolume(0)
        },
        unmuteClk: function (b) {
            this.pp.setVolume(this._storeVol)
        },
        vmaxClk: function (b) {
            this.pp.setVolume(1)
        },
        enterFullscreenClk: function (b) {
            this.pp.setFullscreen(true)
        },
        exitFullscreenClk: function (b) {
            this.pp.setFullscreen(false)
        },
        openCloseClk: function (b) {
            var c = this;
            a(a(b.currentTarget).attr("class").split(/\s+/)).each(function (d, e) {
                if (e.indexOf("toggle") == -1) {
                    return
                }
                c.playerDom.find("." + e.substring(6)).slideToggle("slow", function () {
                    c.pp.setResize()
                });
                c.controlElements.open.toggle();
                c.controlElements.close.toggle()
            })
        },
        loopClk: function (b) {
            if (a.inArray(this.getPlayerConfig("cssClassPrefix") + "loopon", a(b.currentTarget).attr("class").split(/\s+/)) > -1) {
                this.pp.config.loop = true
            } else {
                this.pp.config.loop = false
            }
            this.drawUpdateControls()
        },
        startClk: function (b) {
            this.pp.setPlay()
        },
        scrubberClk: function (b) {
            var e = 0;
            if (this.pp.getItemConfig("disallowSkip") == true) {
                return
            }
            var g = (this.pp.getInFullscreen() === true) ? 1 : 0,
				d = a(this.controlElements.scrubber[g]).width(),
				c = a(this.controlElements.loaded[g]).width(),
				f = b.pageX - a(this.controlElements.scrubber[g]).offset().left;
            if (f < 0 || f == "NaN" || f == undefined) {
                e = 0
            } else {
                if (c != undefined) {
                    if (f > c) {
                        f = c - 1
                    }
                    e = ((f * 100 / d) * this.pp.getDuration() / 100) * 1
                }
            }
            this.pp.setPlayhead(e)
        },
        vmarkerClk: function (b) {
            vsliderClk(b)
        },
        vsliderClk: function (c) {
            if (this._vSliderAct == true) {
                return
            }
            var f = (this.pp.getInFullscreen() === true) ? 1 : 0,
				b = a(this.controlElements.vslider[f]),
				d = b.width(),
				e = c.pageX - b.offset().left;
            if (e < 0 || e == "NaN" || e == undefined) {
                result = 0
            } else {
                result = (e / d)
            }
            this.pp.setVolume(result);
            this._storeVol = result
        },
        vknobStartDragListener: function (b, j) {
            this._vSliderAct = true;
            var d = this,
				f = (this.pp.getInFullscreen() === true) ? 1 : 0,
				c = a(j[f]),
				h = a(this.controlElements.vslider[f]),
				l = Math.abs(parseInt(c.position().left) - b.clientX),
				e = 0,
				g = function (m) {
				    if (a.browser.msie) {
				        m.cancelBubble = true
				    } else {
				        m.stopPropagation()
				    }
				    d.playerDom.unbind("mouseup", g);
				    h.unbind("mousemove", k);
				    h.unbind("mouseup", g);
				    c.unbind("mousemove", k);
				    c.unbind("mouseup", g);
				    d._vSliderAct = false;
				    return false
				},
				k = function (m) {
				    clearTimeout(d._cTimer);
				    if (a.browser.msie) {
				        m.cancelBubble = true
				    } else {
				        m.stopPropagation()
				    }
				    var n = (m.clientX - l);
				    n = (n > h.width() - c.width() / 2) ? h.width() - (c.width() / 2) : n;
				    n = (n < 0) ? 0 : n;
				    c.css("left", n + "px");
				    e = Math.abs(n / (h.width() - (c.width() / 2)));
				    d.pp.setVolume(e);
				    d._storeVol = e;
				    a(d.controlElements.vmarker[f]).css("width", e * 100 + "%");
				    return false
				};
            this.playerDom.mouseup(g);
            h.mousemove(k);
            h.mouseup(g);
            c.mousemove(k);
            c.mouseup(g)
        },
        handleStartDragListener: function (d, g) {
            var h = this;
            var f = Math.abs(parseInt(this.cb.position().left) - d.clientX);
            var c = Math.abs(parseInt(this.cb.position().top) - d.clientY);
            var b = function (j) {
                if (a.browser.msie) {
                    j.cancelBubble = true
                } else {
                    j.stopPropagation()
                }
                h.playerDom.unbind("mouseup", b);
                h.playerDom.unbind("mouseout", b);
                h.playerDom.unbind("mousemove", e);
                return false
            };
            var e = function (k) {
                if (a.browser.msie) {
                    k.cancelBubble = true
                } else {
                    k.stopPropagation()
                }
                clearTimeout(h._cTimer);
                var l = (k.clientX - f);
                l = (l > h.playerDom.width() - h.cb.width()) ? h.playerDom.width() - h.cb.width() : l;
                l = (l < 0) ? 0 : l;
                h.cb.css("left", l + "px");
                var j = (k.clientY - c);
                j = (j > h.playerDom.height() - h.cb.height()) ? h.playerDom.height() - h.cb.height() : j;
                j = (j < 0) ? 0 : j;
                h.cb.css("top", j + "px");
                return false
            };
            this.playerDom.mousemove(e);
            this.playerDom.mouseup(b)
        },
        errorHandler: function (b) {
            this.hidecb(true)
        },
        _clockDigits: function (d, j) {
            if (d < 0 || isNaN(d) || d == undefined) {
                d = 0
            }
            var f = Math.floor(d / (60 * 60));
            var g = d % (60 * 60);
            var c = Math.floor(g / 60);
            var b = g % 60;
            var e = Math.floor(b);
            var h = {};
            h["min_" + j] = (c < 10) ? "0" + c : c;
            h["sec_" + j] = (e < 10) ? "0" + e : e;
            h["hr_" + j] = (f < 10) ? "0" + f : f;
            return h
        }
    }
});