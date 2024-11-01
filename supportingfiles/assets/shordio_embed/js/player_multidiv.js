"use strict";
/**
 * @file   player.js
 * @author ZCO Engineer
 * @date   May, 2017
 * @brief  Custom Javascript Audio Player.
 *
 */
$(function () {
    var player_id = params.ShodyUID;
    $.widget("custom.audioplayer", {
        _create: function () {
            this._player_playbackrates = [.5, 1.0, 1.25, 1.5, 2.0];
            this.PlaybackRate = 1.0;
            this.volume = 1;
            this.dragged = false;
            this.element.addClass("customplayer");
            this.element.addClass("hidden");
//         this._player = $("<div class=\"player\"></div>");
            this._player = $("<div class=\"player\" id=\"div_player_"+player_id+"\"></div>");
            this._control_wrapper = $("<div class=\"control-wrapper player-wrap-sm\" id=\"div_control_wrapper_"+player_id+"\"></div>");
            this._controls = $('<div class="controls" id="div_player_control_'+player_id+'"></div>');
            this._controls.append('<div class="player_ctrl" id="div_player_ctrl'+player_id+'"><div class="embedded-gp1" id="embedded-gp1_'+player_id+'"><div class="title-wrap"><span class="txt-sm ">Listen with</span><span class="txt-lg">Shordio</span></div><div class="play" title="Play"></div>'
            + '<div class="pause hidden" title="Pause"></div>'
            + '<div class="rew" title="Rewind"></div>'
            + '<div class="fwd" title="Forward"></div></div>');
//         this._controls.append('<div class="embedded-gp2"><div class="player_track"><div class="playspeed" title="Change Playing Speed"><span class="play-speed">1x</span></div>'
//                 + '<div class="tracker"><svg class="trackers" width="100%" height="100%"></svg></div></div> </div><div class="player_share"><div class="duration text-right"><span class="curtime">00:00</span> / <span class="duetime cls-custom-duetime" >00:00</span></div></div>');
            this._control_wrapper.append(this._controls);
            $(this._player).html(this._control_wrapper)
            $(this.element).prepend(this._player);
            $('#div_player_control_'+player_id).append('<div class="embedded-gp2"><div class="player_track"><div class="playspeed" title="Change Playing Speed"><span class="play-speed">1x</span></div>'
                    + '<div class="tracker"><svg class="trackers" width="100%" height="100%"></svg></div></div> <div class="player_share"><div class="duration text-right"><span class="curtime">00:00</span> / <span class="duetime cls-custom-duetime" >00:00</span></div></div></div>');
            this.handle = null;
            this.slider = null;
            this.domain = [];
            this.range = [];
            this.x = null;
            this.progress = null;
            this.playing = false;
            this.play_callback_executed = false;


        //    var ShDivWidth = $("#embed-player-wrap").width();
        //    if (ShDivWidth <= 350) {
        //        $('#div_control_wrapper').addClass('player-100');
        //        $('.embedded-gp2').addClass('player-100');
        //        $('#player_share_options').addClass('player-100');
        //    }

            var ShDivWidth = $(".audio-player-wrap").width();
            if (ShDivWidth < 650) {
                    $(".audio-player-wrap").addClass('audio-player-wrap-medium');
                    $('#div_control_wrapper_'+player_id).addClass('control-wrapper-100');
                    $('.embedded-gp2').addClass('embedded-gp2-100');
                    $('#player_share_options_'+player_id).addClass('player-share-100');
                    $('#div_player_'+player_id).addClass('player-100');
            }
        },
        _init: function () {
            var $this = this;
            this.playing = false;
            this.element.find('.play').off('click');
            this.element.find('.play').on('click', function () {
                if (this.playing) {
                    $this._play('resume');
                } else {
                    $this._play('start');
                }
            });
            this.element.find('.pause').off('click');
            this.element.find('.pause').on('click', function () {
                $this.stop();
            });
            this.progressbar();
            this.element.find('.play-speed').off('click');
            this.element.find('.play-speed').on('click', function () {
                $this.playbackrate();
            });

            this.element.find('.fwd').off('click');
            this.element.find('.fwd').on('click', function () {
                $this.forward();
            });

            this.element.find('.rew').off('click');
            this.element.find('.rew').on('click', function () {
                $this.rewind();
            });
            if (typeof this.options.audio_url !== 'undefined') {
                this._song = new Audio(this.options.audio_url);
                this._song.defaultPlaybackRate = this.PlaybackRate;
                this._song.volume = this.volume;

                if (typeof this.options.audio_duration !== 'undefined') {
                    $this.element.find('.duration').attr('data-audio-duration', this.options.audio_duration);
                } else {
                    $this.element.find('.duration').attr('data-audio-duration', 0);
                }

                this._song.onended = function () {
                    setTimeout(function () {
                        $this.element.find('.play').removeClass('hidden').addClass('visible');
                        $this.element.find('.pause').removeClass('visible').addClass('hidden');
                        $this._song.currentTime = 0;
                    }, 2000);
                };
                this._song.addEventListener('timeupdate', function () {
                    var curtime = $this._song.currentTime;
                    var duration = $this.element.find('.duration').attr('data-audio-duration');
                    $this.element.find('span.curtime').text($this._toHHMMSS(curtime));
                    $this.element.find('span.duetime').text($this._toHHMMSS(duration - curtime));
                    if (!$this.dragged) {
                        $this.handle.attr("cx", $this.x(curtime));
                        $this.progress.attr("x2", $this.x(curtime));
                    }
                });

                this._song.addEventListener('loadedmetadata', function () {
                    $this.domain = [0, parseFloat($this.element.find('.duration').attr('data-audio-duration'))];
                    $this.x = d3.scaleLinear().domain($this.domain).range($this.range).clamp(true);
                    var speed_display_text = '1x';
                    $this.element.find('.play-speed').text(speed_display_text);
                    $this.element.removeClass("hidden");
                });
            }

        },
        _play: function (type) {
            switch (type) {
                case 'start':
                    if (typeof this._song !== 'undefined') {
                        this.playing = true;
                        this._song.play();
                        if (typeof this.options.play_callback !== 'undefined') {
                            if (typeof this.options.play_callback == 'function') {
                                if (!this.play_callback_executed) {
                                    this.options.play_callback.call();
                                    this.play_callback_executed = true;
                                }
                            }
                        }
                        this.element.find('.play').removeClass('visible').addClass('hidden');
                        this.element.find('.pause').removeClass('hidden').addClass('visible');
                    }
                    break;
                case 'resume':
                    if (typeof this._song !== 'undefined') {
                        this._song.play();
                        this.element.find('.play').removeClass('visible').addClass('hidden');
                        this.element.find('.pause').removeClass('hidden').addClass('visible');
                    }
                    break;
            }
        },
        play: function (url, param) {
            this.options.audio_url = url;
            if (typeof this._song !== 'undefined') {
                if (!this._song.paused)
                    this._song.pause();
            }

            if (typeof param.duration !== 'undefined') {
                this.options.audio_duration = param.duration;
            }
            this._play('start');
        },
        stop: function () {
            this.element.find('.pause').removeClass('visible').addClass('hidden');
            this.element.find('.play').removeClass('hidden').addClass('visible');
            if (typeof this._song !== 'undefined') {
                this._song.pause();
            }
        },
        forward: function () {
            if (typeof this._song !== 'undefined') {
                if ((this._song.duration - this._song.currentTime) >= 15)
                    this._song.currentTime = this._song.currentTime + 15;
                else
                    this._song.currentTime = this._song.duration;
            }
        },
        rewind: function () {
            if (typeof this._song !== 'undefined') {
                if (this._song.currentTime >= 15)
                    this._song.currentTime = this._song.currentTime - 15;
                else
                    this._song.currentTime = 0;
            }
        },
        playbackrate: function () {
            if (typeof this._song !== 'undefined') {
                var cur_index = this._player_playbackrates.indexOf(this._song.playbackRate);
                if (cur_index > -1 && cur_index < (this._player_playbackrates.length - 1)) {
                    cur_index++;
                } else {
                    cur_index = 0;
                }
                this._song.playbackRate = this.PlaybackRate = this._player_playbackrates[cur_index];
                var speed_display_text = this._player_playbackrates[cur_index] + 'x';
                this.element.find('.play-speed').text(speed_display_text);
            } else {
                var cur_index = this._player_playbackrates.indexOf(this.PlaybackRate);
                if (cur_index > -1 && cur_index < (this._player_playbackrates.length - 1)) {
                    cur_index++;
                } else {
                    cur_index = 0;
                }
                this.PlaybackRate = this._player_playbackrates[cur_index];
                var speed_display_text = this._player_playbackrates[cur_index] + 'x';
                this.element.find('.play-speed').text(speed_display_text);
            }
        },
        _toHHMMSS: function (time_in_sec) {
            if (!isNaN(time_in_sec)) {
                var sec_num = parseInt(time_in_sec, 10);
                var hours = Math.floor(sec_num / 3600);
                var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                var seconds = sec_num - (hours * 3600) - (minutes * 60);
                if (hours < 10) {
                    hours = "0" + hours;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
                return  minutes + ':' + seconds;
            } else {
                return '00:00';
            }
        },
        _truncate: function (str, max, sep) {
            max = max || 10;
            var len = str.length;
            if (len > max) {
                sep = sep || "...";
                var seplen = sep.length;
                if (seplen > max) {
                    return str.substr(len - max);
                }
                var n = -0.5 * (max - len - seplen);
                var center = len / 2;
                var front = str.substr(0, center - n);
                var back = str.substr(len - center + n);
                return front + sep + back;
            }
            return str;
        },
        progressbar: function () {

            var $this = this;
            var svg = d3.select(".tracker svg"),
                    margin = {right: 10, left: 10},
                    width = parseFloat(d3.select(".tracker").style('width')) - margin.left - margin.right,
                    height = parseFloat(d3.select(".tracker").style('height'));
            this.domain = [0, 0];
            this.range = [0, width];
            this.x = d3.scaleLinear().domain(this.domain).range(this.range).clamp(true);
            this.slider = svg.append("g").attr("class", "slider").attr("transform", "translate(" + margin.left + "," + height / 2 + ")");
            this.slider.append("line")
                    .attr("class", "track")
                    .attr("x1", 0)
                    .attr("x2", width)
                    .select(function () {
                        return this.parentNode.appendChild(this.cloneNode(true));
                    })
                    .attr("class", "track-inset")
                    .select(function () {
                        return this.parentNode.appendChild(this.cloneNode(true));
                    })
                    .attr("class", "track-overlay").call(d3.drag()
                    .on("start.interrupt", function () {
                        $this.slider.interrupt();
                    })
                    .on("start", function () {
                        $this.dragged = true;
                        var point = (d3.event.x > width) ? width : d3.event.x;
                        $this.handle.attr("cx", $this.x($this.x.invert(point)));
                        $this.progress.attr("x2", $this.x($this.x.invert(point)));
                        $this._song.currentTime = $this.x.invert(point);
                    })
                    .on("drag", function () {
                        var point = (d3.event.x > width) ? width : d3.event.x;
                        $this.handle.attr("cx", $this.x($this.x.invert(point)));
                        $this.progress.attr("x2", $this.x($this.x.invert(point)));
                        $this._song.currentTime = $this.x.invert(point);
                    })
                    .on("end", function () {
                        $this.dragged = false;
                    })
                    );
            this.handle = this.slider.insert("circle", ".track-overlay")
                    .attr("class", "handle")
                    .attr("r", 10)
                    .attr("cx", 0);
            this.progress = this.slider.insert("line", ".handle")
                    .attr("class", "track-progress")
                    .attr("x1", 0)
                    .attr("x2", 0);
        }
    });
});
