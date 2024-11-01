"use strict";
/**
 * @file   player.js
 * @author ZCO Engineer
 * @date   May, 2017
 * @brief  Custom Javascript Audio Player.
 *
 */
jQuery.noConflict();
jQuery(document).ready(function ($) {
    jQuery(window).on('resize orientationchange webkitfullscreenchange mozfullscreenchange fullscreenchange',  function(){
        location.reload();
    }); 
    var input = document.createElement("input");
    input.setAttribute("type", "hidden");
    input.setAttribute("name", "shordy_audio_length_site");
    input.setAttribute("id", "shordy_audio_length_site");
    input.setAttribute("value", "0");
    $('body').append(input);
    var input1 = document.createElement("input");
    input1.setAttribute("type", "hidden");
    input1.setAttribute("name", "shordy_play_timer_site");
    input1.setAttribute("id", "shordy_play_timer_site");
    input1.setAttribute("value", "0");
    $('body').append(input1);
    $.widget("custom.audioplayer", {
        _create: function () {
            this._player_playbackrates = [.5, 1.0, 1.25, 1.5, 2.0];
            this.PlaybackRate = 1.0;
            this.volume = 1;
            this.dragged = false;
            this.element.addClass("customplayer");
            this.element.addClass("hidden");
//         this._player = $("<div class=\"player\"></div>");
            this._player = $("<div class=\"player\" id=\"div_player\"></div>");
            this._control_wrapper = $("<div class=\"control-wrapper player-wrap-sm\" id=\"div_control_wrapper\"></div>");
            this._controls = $('<div class="controls" id="div_player_control"></div>');
            this._controls.append('<div class="play-wrap">'
                    + '<div class="rew" title="Rewind"></div>'
                    +'<div class="play" title="Play"></div>'
                    + '<div style="display:none" class="pause hidden" title="Pause"></div>'
                    + '<div class="fwd" title="Forward"></div></div>');
            this._control_wrapper.append(this._controls);
            $(this._player).html(this._control_wrapper);
            $(this.element).prepend(this._player);
            $('#div_player_control').append('<div class="progress-wrap" id="embedded-gp1"><div class="speed" title="Change Playing Speed"><span class="play-speed">1x</span></div>'
                    + '<div class="progress"><div class="tracker"><svg class="trackers" width="100%" height="100%"></svg></div></div><div class="time"><div class="duration text-right"><span class="curtime">00:00:00</span> / <span class="duetime cls-custom-duetime" >'+this._toHHMMSS(this.options.audio_duration)+'</span></div></div></div>'+
                    '<div class="player-mob-class"><div class="player-share follow-wrap" id="player_share_options_mob"><a  id="div1"  style="box-shadow:none" title="Add To Playlist" class="popupSignupSignin addplaylist add add-to-play-list login-addto-playlist" href="javascript:void(0);"></a>'+ 
                    '<a  id="div2"  style="box-shadow:none"  title="Add To Favorites" class="popupSignupSignin embedded-fav login-addto-favorites" href="javascript:void(0);"></a></div></div>');
            this.handle = null;
            this.slider = null;
            this.domain = [];
            this.range = [];
            this.x = null;
            this.progress = null;
            this.playing = false;
            this.play_callback_executed = false;


                var ShDivWidth = $("#embed-player-wrap").width();
                if (ShDivWidth <= 350) {
                    $('#div_control_wrapper').addClass('player-100');
                    $('.embedded-gp2').addClass('player-100');
                    // $('#player_share_options_mob').addClass('player-100');
                }

            var ShDivWidth = $(".audio-player-wrap").width();
            if (ShDivWidth < 700) {
                $(".audio-player-wrap").addClass('audio-player-wrap-medium');
                $('#div_control_wrapper').addClass('control-wrapper-100');
                $('.embedded-gp2').addClass('embedded-gp2-100');
                $('#player_share_options').addClass('player-share-100');
                $('#div_player').addClass('player-100');
            }
        },
        _init: function () {
            var $this = this;
            this.playing = false;
            this.element.find('.play').off('click');
            this.element.find('.play').on('click', function () {
                updatePlaylist();
                if (this.playing) {
                    $this._play('resume');
                } else {
                    $this._play('start');
                }
            });
            this.element.find('.pause').off('click');
            this.element.find('.pause').on('click', function () {
                $this.stop();myStopFunction_playcount();
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
                    if(this.options.audio_duration > 3600){
                        $("#shordy_audio_length_site").val($this._toHHMMSS(this.options.audio_duration));
                        $this.element.find('.duetime').html($this._toHHMMSS(this.options.audio_duration));
                        $this.element.find('.curtime').html("00:00:00");
                    }
                    else
                    {
                        $("#shordy_audio_length_site").val($this._toMMSS(this.options.audio_duration));
                        $this.element.find('.duetime').html($this._toMMSS(this.options.audio_duration));
                        $this.element.find('.curtime').html("00:00");
                    }
                } else {
                    $this.element.find('.duration').attr('data-audio-duration', 0);
                }

                this._song.onended = function () {
                    myStopFunction_playcount();
                    $("#shordy_play_timer_site").val(1);
                    setTimeout(function () {
                        $this.element.find('.play').removeClass('hidden').addClass('visible');
                        $this.element.find('.pause').removeClass('visible').addClass('hidden');
                        $this._song.currentTime = 0;
                    }, 2000);
                };
                this._song.addEventListener('timeupdate', function () {
                    var curtime = $this._song.currentTime;
                    var duration = $this.element.find('.duration').attr('data-audio-duration');
                    if(duration > 3600){
                        $this.element.find('span.curtime').text($this._toHHMMSS(curtime));
                        $this.element.find('span.duetime').text($this._toHHMMSS(duration - curtime));
                    }
                    else
                    {
                        $this.element.find('span.curtime').text($this._toMMSS(curtime));
                        $this.element.find('span.duetime').text($this._toMMSS(duration - curtime));
                    }
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
                return  hours + ':' + minutes + ':' + seconds;
            } else {
                return '00:00:00';
            }
        },
        _toMMSS: function (time_in_sec) {
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
           return minutes + ':' + seconds;
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
            var f_width = parseFloat($(".player_wrapper").width());
            // alert(f_width);
            var use_width = 65;
            if(f_width>=314 && f_width<=400) { use_width = (f_width/4.3);  }
            else if(f_width>400 && f_width<=508) { use_width = (f_width/3);  }
            else if(f_width>508 && f_width<=530) { use_width = (f_width/8);  }
            else if(f_width>530 && f_width<=580) { use_width = (f_width/6.5); }
            else if(f_width>580 && f_width<=600) { use_width = (f_width/5.8); }
            else if(f_width>600 && f_width<=650) { use_width = (f_width/5.3); }
            else if(f_width>650 && f_width<=725) { use_width = (f_width/4.1); }
            else if(f_width>725 && f_width<=800) { use_width = (f_width/3.2);   }
            else if(f_width>800 && f_width<=900) { use_width = (f_width/2.8); }
            else if(f_width>900 && f_width<=1000) { use_width = (f_width/2.3); }
            else if(f_width>1000 && f_width<=1100){ use_width = (f_width/2.1);   }
            else if(f_width>1100 && f_width<=1200){ use_width = (f_width/1.9);   }
            else if(f_width>1200 && f_width<=1300){ use_width = (f_width/1.8);   }
            else if(f_width>1300 && f_width<=1470){ use_width = (f_width/1.7);   }
            else if(f_width>1470)   {  use_width = (f_width/1.6);  }
            else { use_width = 65; }

            var svg = d3.select(".tracker svg"),
                    margin = {right: 10, left: 10},
                    width = use_width - margin.left - margin.right,
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

/* Load player */

function loadPlayer(ShodyUID)
{	
	
    /* <![CDATA[ */
    var params = {        
        'base_url': 'https://plugin.shordio.com/',
        'plugin_url': 'https://plugin.shordio.com/',
        'audioplayer': null,
        'ShodyUID': ShodyUID
    };
    
    var EmbedPlayer = function () {
        return {
            shordio_unique_id: null,
            user_unique_id: null,
            init: function (shordio_unique_id, user_unique_id) {
                this.shordio_unique_id = shordio_unique_id;
                this.user_unique_id = user_unique_id;
            },
            addToPlayList: function () {

                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var data = JSON.parse(xhttp.responseText);
                        if (data.status) {
                             jQuery('a.add-to-play-list').attr('title', 'Remove from Playlist');
                            //document.getElementById("div1").classList.remove("classToBeRemoved");                           
                            jQuery('a.add-to-play-list').removeClass('addplaylist');
                            jQuery('a.add-to-play-list').addClass("plus-active");
                            jQuery('a.add-to-play-list').trigger('blur');
                            //$("#player_share_options").remove();
							//document.getElementById("div1").title='Added To Playlist');
                        } else {
                            login();
                        }
                    }
                };
                xhttp.open("POST", params.base_url + 'shordy-embed/add-to-play-list', true);
                // xhttp.withCredentials = true;                              
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send("shordy_id=" + this.shordio_unique_id + "&user_id=" + this.user_unique_id + "&token=" + sessionStorage.token);
            },
            removeFromPlayList: function () {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var data = JSON.parse(xhttp.responseText);
                        if (data.status) {
                            jQuery('a.add-to-play-list').attr('title', 'Add To Playlist');                            
                            jQuery('a.add-to-play-list').removeClass("plus-active").addClass('addplaylist');
                            //document.getElementById("div3").focus();
                            jQuery('a.add-to-play-list').trigger('blur');
                            
                        } else {
                            login();
                        }
                    }
                };
                xhttp.open("POST", params.base_url + 'shordy-embed/remove-from-play-list', true);
                //xhttp.withCredentials = true;
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send("shordy_id=" + this.shordio_unique_id + "&user_id=" + this.user_unique_id + "&token=" + sessionStorage.token);
            },
            updatePlayListCount: function () {
                if (sessionStorage.token) {
                    var sesToken = sessionStorage.token;
                } else {
                    var sesToken = '';
                }
                var xhttp = new XMLHttpRequest();
                xhttp.open("POST", params.base_url + 'shordy-embed/update-rescently-played', true);
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send("shordy_id=" + this.shordio_unique_id + "&token=" + sesToken);
            },
            addToSubscribedList: function () {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var data = JSON.parse(xhttp.responseText);
                        if (data.status) {
                            jQuery('a.embedded-subscribe').addClass('subscribe-active').removeClass('login-addto-subscribe-list').attr('title', data.message).html('<img src="'+data.profile_dp_path+'">'+data.message);
                            if (data.sid != null) {
                                if (jQuery('#em_sus_id').length > 0)
                                    jQuery('#em_sus_id').val(data.sid);
                                else
                                    jQuery('a.embedded-subscribe').after('<input type="hidden" id="em_sus_id" value="' + data.sid + '" >');
                            } else {
                                login();
                            }
                        }
                    }
                };
                xhttp.open("POST", params.base_url + 'shordy-embed/embedded-subscribe-now', true);
                //  xhttp.withCredentials = true;
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send("shordy_id=" + this.shordio_unique_id + "&user_id=" + this.user_unique_id + "&token=" + sessionStorage.token);
            },
            removeFromSubscribedList: function () {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var data = JSON.parse(xhttp.responseText);
                        if (data.status) {
                            jQuery('a.embedded-subscribe').removeClass('subscribe-active');
                            jQuery('a.embedded-subscribe').attr('title', data.message).html('<img src="'+data.profile_dp_path+'">'+data.message);
                            if (jQuery('#em_sus_id').length > 0)
                                jQuery('#em_sus_id').val(data.sid);
                            else
                                jQuery('a.embedded-subscribe').after('<input type="hidden" id="em_sus_id" value="' + data.sid + '" >');
                        } else {
                            if(sessionStorage.shordy_userid==sessionStorage.userids)
                            {return false;}
                            login();
                        }
                    }
                };
                xhttp.open("POST", params.base_url + 'shordy-embed/embedded-unsubscribe-now', true);
                //  xhttp.withCredentials = true;
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send("shordy_id=" + this.shordio_unique_id + "&user_id=" + this.user_unique_id + "&em_sus_id=" + document.getElementById("em_sus_id").value + "&token=" + sessionStorage.token);
            },
            addToFavoritesList: function () {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var data = JSON.parse(xhttp.responseText);
                        if (data.status) {
                            jQuery('a.embedded-fav').addClass('favorites-active').removeClass('login-addto-favorites');
                            jQuery('a.embedded-fav').attr('title', 'Remove from Favorites');
                            //  document.getElementById("div3").focus();                                        
                            jQuery('a.embedded-fav').trigger('blur');
							

                        } else {
                            login();
                        }
                    }
                };
                xhttp.open("POST", params.base_url + 'shordy-embed/add-to-fav-list', true);
                //  xhttp.withCredentials = true;
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send("shordy_id=" + this.shordio_unique_id + "&user_id=" + this.user_unique_id + "&token=" + sessionStorage.token);
            },
            removeFromFavoritesList: function () {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var data = JSON.parse(xhttp.responseText);
                        if (data.status) {
                            jQuery('a.embedded-fav').removeClass('favorites-active').addClass('login-addto-favorites');
                            jQuery('a.embedded-fav').attr('title', 'Add To Favorites');
                            //document.getElementById("div3").focus();
                            jQuery('a.embedded-fav').trigger('blur');
                        } else {
                            login();
                        }
                    }
                };
                xhttp.open("POST", params.base_url + 'shordy-embed/remove-from-favorites', true);
                //  xhttp.withCredentials = true;
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send("shordy_id=" + this.shordio_unique_id + "&user_id=" + this.user_unique_id + "&token=" + sessionStorage.token);
            },
        };
    };


    var embedPlayerObj;
    // $(document).ready(function () {
    jQuery(document).ready(function ($) {
		//getShodyStatus();
		
        if (sessionStorage.token) {
            var sesToken = sessionStorage.token;
        } else {
           // var sesToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjM2MiIsInVzZXJuYW1lIjoidDFAZ21haWwuY29tIiwiaWF0IjoxNjUyODY3ODg0LCJleHAiOjE2NTI4ODU4ODR9.-JW9C5tgtmWlEMYWWsCr_MA1vYYmjS4mC24tSC76WFc';
            var sesToken = '';
        }
        var player_code = params.ShodyUID;
			
        var url = params.base_url + 'info/' + player_code;
        if(sesToken)
        {
            url += '/' + sesToken;
        }
        
        $.ajax({
            url: url,
            //  xhrFields: {
            //  withCredentials: true
            // },
            success: function (response) {
                var data = $.parseJSON(response);
                var subscribed_user_type = data.data["t22"]["subscribed_user_type"];
                var subscriber_type = (subscribed_user_type == 'NormalUser') ? 'Writer' : 'Publisher';
                var is_loggedin = data.data["t15"];
                var in_playlist = data.data["t17"];
                var is_favorite = data.data["t18"];
                var su_id = data.data["t8"];
                var unique_id = data.data["t7"];
                var logged_user_id = data.data["t19"];
                var shordio_media_url = data.data["t0"];
                var shordy_title = data.data["t1"];
                var SubscriptionDetails = data.data["t22"]["SubscriptionDetails"];
                //var subscribed_id = data.data["t22"]["subscribed_id"];
                var subscribed_id = (data.data["t22"].SubscriptionDetails) ? data.data["t22"].SubscriptionDetails.suscribe_id : 0;
                var SubscribeButton = data.data["t21"];
                var shordio_media_duration = data.data["t3"];
                var disable = (SubscribeButton == 'Hide') ? 'disabled' : '';
                localStorage.setItem("surl", 'subscribe-now/' + su_id);
				var ad_player_banner = "";
				var ad_player_html = "";
				var google_add_html = "";
                var g_ad_player_html = "";
                var logged_user_type = data.data["t25"];
                var profile_image_sm = data.data["t26"];
                document.title = data.data["tnew"];
                sessionStorage.shordy_userid = data.data["shordy_userid"];
               
				//if(is_loggedin && data.data["t25"] && data.data["t25"]=='PublisherUser' && data.data["t23"] && data.data["t23"].ad_custom_text){
                if(data.data["t23"] && data.data["t23"].ad_custom_text){
					var ad_custom_text = data.data["t23"].ad_custom_text;
					var leaderboard_url = data.data["t23"].leaderboard_url;
                    var leaderboard_display_url	 = data.data["t23"].leaderboard_display_url;
					var leaderboard_Image = data.data["t23"].leaderboard_Image;
					var leaderboard_Image_mobile = data.data["t23"].leaderboard_Image_mobile;
					var leaderboard_Image_mobile = data.data["t23"].leaderboard_Image_mobile;
					var audio_url = data.data["t23"].audio_url;
                    var urllink = "#";
                    var urllinkdisp = "#";                  

                    if (leaderboard_url.indexOf('http') !== -1) {
                        urllink = leaderboard_url;
                    } else if(leaderboard_url.indexOf('https') !== -1) {
                        urllink = leaderboard_url;
                    } else {
                        urllink = '//'+leaderboard_url;
                    }

                    if (leaderboard_display_url.indexOf('http') !== -1) {
                        urllinkdisp = leaderboard_display_url;
                    } else if(leaderboard_display_url.indexOf('https') !== -1) {
                        urllinkdisp = leaderboard_display_url;
                    } else {
                        urllinkdisp = '//'+leaderboard_display_url;
                    }
                   
					var ad_player_banner = '<div class="ad-container">' +
							( ad_custom_text ? '<div class="sponsor-name">'+ad_custom_text+'</div>' :"") +
							( leaderboard_Image ? '<div class="banner-img desktop-bnr-img">' +
								'<a href="'+urllink+'" target="_blank"><img src="'+leaderboard_Image+'" /></a>'+
							'</div>' :"") +
							( leaderboard_Image_mobile ? '<div class="banner-img mobile-bnr-img">' +
								'<a href="'+urllink+'" target="_blank"><img src="'+leaderboard_Image_mobile+'" /></a>'+
							'</div>' :"") +
							 ( leaderboard_display_url ? '<div class="leaderboard-url">'+
								'<a href="'+urllinkdisp+'" target="_blank">'+leaderboard_display_url+'</a>'+
							'</div>' :"") +
						'</div>';			
				}
									
				//if(is_loggedin && data.data["t25"] && data.data["t25"]=='PublisherUser'  && data.data["t24"] && data.data["t24"].g_ad_body){
                if(data.data["t24"] && data.data["t24"].g_ad_body){                    
					
					var g_ad_body = data.data["t24"].g_ad_body;
					var g_ad_head = data.data["t24"].g_ad_head;
					var g_ad_head_mobile = data.data["t24"].g_ad_head_mobile;
					var g_ad_body_mobile = data.data["t24"].g_ad_body_mobile;
                    var g_ad_audio_url  =   data.data["t24"].g_ad_audio_url;
                 
                    if(g_ad_body)
                    {
                        window.googletag = window.googletag || {cmd: []};
                        googletag.cmd.push(function() { 
                            googletag.defineSlot(g_ad_head, [728, 90], g_ad_body).addService(googletag.pubads());      
                            googletag.pubads().enableSingleRequest();
                            googletag.enableServices();
                            googletag.display(g_ad_body);
                        });

                        google_add_html += '<div class="ad-container">'+
												'<div  id="'+g_ad_body+'"  style="min-width: 728px; min-height: 90px;">'+
												'</div>'+
											'</div>';
                    }
                    if(g_ad_body_mobile)
                    {
                         window.googletag = window.googletag || {cmd: []};
                        googletag.cmd.push(function() {     
                            googletag.defineSlot(g_ad_head_mobile, [320, 50], g_ad_body_mobile).addService(googletag.pubads());       
                            googletag.pubads().enableSingleRequest();
                            googletag.enableServices();
                        });

                        google_add_html += '<div class="mobile-bnr-img">'+
												'<div  id="'+g_ad_body_mobile+'"  style="min-width: 320px; min-height: 50px;"><div class="banner-img mobile-bnr-img">'+
												'</div>'+
											'</div></div>';
                    } else {
                        google_add_html += '<div class="mobile-bnr-img no-img">'+
												'<div  style="min-width: 320px; min-height: 50px;"><div class="banner-img mobile-bnr-img">'+
                                                    '<img src="'+params.plugin_image_url+'mobile_image_not_found.png" border="0" width="320" height="50" alt="" class="img_ad">'+
												'</div></div>'+
											'</div>';
                    }
					
				}

				if(data.data["t23"] && data.data["t23"].audio_url){

				    ad_player_html += ' <div class="ad-player-block" >' +
                            '<div class="player_wrapper">'+
                                '<div class="heading">'+
                                    '<div class="header1">Listen to this article:</div>'+
                                    '<div class="header2">Powered by <a href="https://www.shordio.com/" target="_blank">Shordio</a></div>'+
                                '</div>'+
                                '<div class="controls">'+
                                    '<div class="play-wrap">'+
                                        '<div class="ad_rew" title="Rewind"></div>'+
                                        '<div id="ctrl-btn" class="ad_play" title="Play"></div>'+
                                        '<div class="ad_pause hidden" title="Pause"></div>'+
                                        '<div class="ad_fwd" title="Forward"></div>'+
                                    '</div>'+
                                    '<div class="progress-wrap" id="ad-progress-wrap-share">'+
                                        '<div class="speed">1x</div>'+
                                        '<div class="progress">'+						
                                            '<input type="range" min="1" max="100" value="0" class="seek_slider">'+
                                        '</div>'+
                                        '<div class="time">'+
                                        '<div class="total-duration">'+ toHHMMSS(shordio_media_duration) +'</div>'+
                                        '</div>'+
                                    '</div>' +
                                '</div>' +
                            '</div>' +
							 '<audio id="ad_player" style="display:none;" controls src="'+audio_url+'">'+
									'Your browser does not support the<code>audio</code> element.'+
							'</audio>';
											
                }  
                
                if(data.data["t24"] && data.data["t24"].g_ad_audio_url){
				    g_ad_player_html += ' <div class="ad-player-block" >' +
                                '<div class="player_wrapper">'+
                                    '<div class="heading">'+
                                        '<div class="header1">Listen to this article:</div>'+
                                        '<div class="header2">Powered by <a href="https://www.shordio.com/" target="_blank">Shordio</a></div>'+
                                    '</div>'+
                                    '<div class="controls">'+
                                        '<div class="play-wrap">'+
                                            '<div class="ad_rew" title="Rewind"></div>'+
                                            '<div id="ctrl-btn" class="ad_play" title="Play"></div>'+
                                            '<div class="ad_pause hidden" title="Pause"></div>'+
                                            '<div class="ad_fwd" title="Forward"></div>'+
                                        '</div>'+
                                        '<div class="progress-wrap" id="ad-progress-wrap-share">'+
                                            '<div class="speed">1x</div>'+
                                            '<div class="progress">'+						
                                                '<input type="range" min="1" max="100" value="0" class="seek_slider">'+
                                            '</div>'+
                                            '<div class="time">'+
                                            '<div class="total-duration">'+ toHHMMSS(shordio_media_duration) +'</div>'+
                                            '</div>'+
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
							 '<audio id="g_ad_player" style="display:none;" controls src="'+g_ad_audio_url+'">'+
									'Your browser does not support the<code>audio</code> element.'+
							'</audio>';
											
                } 
              
                var html_content = '<div class="player-share follow-wrap" id="player_share_options">' +
                        ( (is_loggedin > 0) ? 
                                    (SubscriptionDetails == null ? '<a id="div3"  style="box-shadow:none"  title="Follow This '+subscriber_type+'" class="follow_btn  embedded-subscribe login-addto-subscribe-list" href="javascript:void(0);" ' + disable + '><img src="'+profile_image_sm+'">Follow This ' + subscriber_type + '</a>' :
                                        '<a id="div3" title="Following This '+subscriber_type+'"  style="box-shadow:none" class="follow_btn embedded-subscribe subscribe-active" href="javascript:void(0);" ' + disable + '><img src="'+profile_image_sm+'">Following This ' + subscriber_type + '</a>')+
                                        '<div class="icons">'+
                                (in_playlist > 0 ? '<a id="div1"  style="box-shadow:none" title="Remove from Playlist" class="add-to-play-list plus_icn plus-active" href="javascript:void(0);"></a>' : '<a id="div1" title="Add To Playlist" class="addplaylist plus_icn add-to-play-list " href="javascript:void(0);"></a>') +
                                (is_favorite > 0 ? '<a id="div2"  style="box-shadow:none" title="Remove from Favorites" class=" embedded-fav fav_icn favorites-active" href="javascript:void(0);"></a>' : '<a  id="div2" title="Add To Favorites" class=" embedded-fav fav_icn login-addto-favorites" href="javascript:void(0);"></a>')+
                                '</div>'
                                + '<input type="hidden" id="em_sus_id" value="' + subscribed_id + '" >'
                       :       
                                '<a id="div3"  style="box-shadow:none" title="Follow This '+subscriber_type+'" class="follow_btn popupSignupSignin embedded-subscribe login-addto-subscribe-list" href="javascript:void(0);"><img src="'+profile_image_sm+'">Follow This ' + subscriber_type + ' </a>'+
                                '<div class="icons">'+
                                '<a  id="div1"  style="box-shadow:none" title="Add To Playlist" class="popupSignupSigninss plus_icn addplaylist add add-to-play-list login-addto-playlist" href="javascript:void(0);"></a>' +
                                '<a  id="div233"  style="box-shadow:none"  title="Add To Favorites" class="popupSignupSignin fav_icn embedded-fav login-addto-favorites" href="javascript:void(0);"></a>'+
                                '</div>'
                        )  +
                        '</div>' +
                        '</div>';
                  //alert(html_content);
                     
                        var html_content_mob = '';  
                embedPlayerObj = new EmbedPlayer();
                embedPlayerObj.init(unique_id, logged_user_id);
                params.audioplayer = $.custom.audioplayer(
                        {
                            audio_url: shordio_media_url,
                            audio_title: shordy_title,
                            audio_duration: shordio_media_duration,
                            //play_callback: updatePlaylist
                        }, $("#customplayer-embed")
                        );
                $("#player_share_options").remove();       
                $("#embedded-gp1").after(html_content);
                // $("#player_share_options_mob").remove(); 
				// $('#embedded-gp2').after(html_content_mob); 			
				if(google_add_html && data.data['t24'].g_ad_status==1){
					$(".main_wrapper").after(google_add_html);
                    $(".player_wrapper").before(g_ad_player_html);
                    if(g_ad_player_html)
                    {	
                    //   $(".player_wrapper").css({"display":"none"});
                    } else {
                        $(".player_wrapper").css({"display":"block"});
                    }
                    $("#ad-progress-wrap-share").after(html_content);
					googletag.cmd.push(function() { googletag.display(g_ad_body); });
					googletag.cmd.push(function() { googletag.display(g_ad_body_mobile); });
				} else {                   
                    if(ad_player_banner){
                        $(".main_wrapper").after(ad_player_banner);
                        // $(".player_wrapper").css({"display":"none"});
                        
                        if(ad_player_html){
                            $(".player_wrapper").before(ad_player_html);
                            $("#ad-progress-wrap-share").after(html_content);
                        } else {
                            $(".player_wrapper").css({"display":"block"});
                        }
                   }	
               }	
				
                $('a.add-to-play-list').click(function (e) {
                    e.preventDefault();
					//alert("Not implemented");
					
                   if ($(this).hasClass('plus-active')) {
                        embedPlayerObj.removeFromPlayList();
                    } else if ($(this).hasClass('login-addto-playlist')) {
                        if (sessionStorage.token) {
                            $(this).removeClass('login-addto-playlist');
                            embedPlayerObj.addToPlayList();
                        } else {
                            localStorage.setItem("goTo", 'addplaylist');
                            localStorage.setItem("sh", 'pl-' + unique_id);
                            login();
                        }
                    } else {
                        embedPlayerObj.addToPlayList();
                    }
					
                });
                $('a.embedded-fav').click(function (e) {
                    e.preventDefault();
					//alert("Not implemented");
					
                    if ($(this).hasClass('favorites-active')) {
                        embedPlayerObj.removeFromFavoritesList();
                    } else if ($(this).hasClass('login-addto-favorites')) {
                        if (sessionStorage.token) {
                            $(this).removeClass('login-addto-playlist');
                            embedPlayerObj.addToFavoritesList();
                        } else {
                            localStorage.setItem("goTo", 'fav');
                            localStorage.setItem("sh", 'pl-' + unique_id);
                            login();
                        }
                    } else {
                        embedPlayerObj.addToFavoritesList();
                    }
					
                });
                $('a.embedded-subscribe').click(function (e) {
                    e.preventDefault();
					//alert("Not implemented");
					
                    if ($(this).hasClass('subscribe-active')) {//embed-active
                        embedPlayerObj.removeFromSubscribedList();
                    } else if ($(this).hasClass('login-addto-subscribe-list')) {

                        if (sessionStorage.token) {
                            $(this).removeClass('login-addto-subscribe-list');
                            embedPlayerObj.addToSubscribedList();
                        } else {
                            localStorage.setItem("goTo", 'subscribe-now');
                            localStorage.setItem("sh", '#home');
                            login();
                        }
                    } else {
                        embedPlayerObj.addToSubscribedList();
                    }
					
                });
				
				var ad_player = document.getElementById("ad_player");
				var getTime;
				if(ad_player){

					ad_player.ontimeupdate = function(){
					  var percentage = ( ad_player.currentTime / ad_player.duration ) * 100;
					  $(".seek_slider").val(percentage);
					};

					function calculateTime() {
					   $(".current-time").html(toHHMMSS(Math.round(ad_player.currentTime)));
					   //$(".total-duration").html(toHHMMSS(Math.round(ad_player.duration - ad_player.currentTime)));
                       $(".total-duration").html(toHHMMSS(shordio_media_duration));
					}

					ad_player.addEventListener('playing',function() { getTime = setInterval(calculateTime, 1000) }, false);
					ad_player.addEventListener('ended', (event) => {
						  $(".ad-player-block").hide();
						  $(".player_wrapper").css({"display":"block"});
                          if ($(".add-to-play-list").hasClass('plus-active')) {
                                $(".add-to-play-list").removeClass('addplaylist');
                                $(".add-to-play-list").addClass("plus-active");
                          } else {
                            $(".add-to-play-list").removeClass('plus-active');
                            $(".add-to-play-list").addClass("addplaylist");
                          }      
						  $(".play").trigger("click");
						  clearInterval(getTime);
					}, false);

					$("#ctrl-btn").on('click', function() {
					   var className = $(this).attr('class');
					   if(className == 'ad_play') {
						  $(this).removeClass('ad_play').addClass('ad_pause');
						  ad_player.play();
					   }
					   if(className == 'ad_pause') {
						  $(this).removeClass('ad_pause').addClass('ad_play');
						  ad_player.pause();
					   }
					});
				}
                
                /**-------------google ad player------------ */

                var g_ad_player = document.getElementById("g_ad_player");
				var getTime;
				if(g_ad_player){

					g_ad_player.ontimeupdate = function(){
					  var percentage = ( g_ad_player.currentTime / g_ad_player.duration ) * 100;
					  $(".seek_slider").val(percentage);
					};

					function calculateTime() {
					   $(".current-time").html(toHHMMSS(Math.round(g_ad_player.currentTime)));
					   //$(".total-duration").html(toHHMMSS(Math.round(ad_player.duration - ad_player.currentTime)));
                       $(".total-duration").html(toHHMMSS(shordio_media_duration));
					}

					g_ad_player.addEventListener('playing',function() { getTime = setInterval(calculateTime, 1000) }, false);
					g_ad_player.addEventListener('ended', (event) => {
						  $(".ad-player-block").hide();
						  $(".player_wrapper").css({"display":"block"});
						  $(".play").trigger("click");
						  clearInterval(getTime);
					}, false);

					$("#ctrl-btn").on('click', function() {
					   var className = $(this).attr('class');
					   if(className == 'ad_play') {
						  $(this).removeClass('ad_play').addClass('ad_pause');
						  g_ad_player.play();
					   }
					   if(className == 'ad_pause') {
						  $(this).removeClass('ad_pause').addClass('ad_play');
						  g_ad_player.pause();
					   }
					});
				}	

                /*----------end of google add player------*/

				function toHHMMSS(time_in_sec) {
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
					  return  hours + ':' + minutes + ':' + seconds;
				   } else {
					  return '00:00:00';
				   }
				}
			
				
				
				
            }


        }); 
		
				
        $("#dialog").dialog({
            autoOpen: false,
            open: function (event, ui) {
                //$(".ui-dialog-titlebar-close", ui.dialog || ui).hide();
            },
            width: 350,
            close: function () {
                $('a.add-to-play-list').trigger('blur');
                $('a.embedded-fav').trigger('blur');
            },
            create: function (event, ui) {

            },

        });
        $(".submit").click(function () {
            var eml = $("#email").val();
            var psd = $("#password").val();
            var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if(eml.match(mailformat))
            {
                if(psd == "")
                {
                    $("#email").css({"border":"1px solid #707070"});
                    $("#password").css({"border":"1px solid #f00"});
                }
                else
                {   
                    $("#email").css({"border":"1px solid #707070"});
                    $("#password").css({"border":"1px solid #707070"});
                }
            }
            else
            {
                if(psd == "")
                {
                    $("#email").css({"border":"1px solid #f00"});
                    $("#password").css({"border":"1px solid #f00"});
                }
                else
                {
                    $("#email").css({"border":"1px solid #f00"});
                }
            }
        });
	
        $('#loginform').validate({// initialize the plugin
            rules: {
                email: {
                    required: {
                        depends: function () {
                            $(this).val($.trim($(this).val()));
                            return true;
                        }
                    },
                    email: true
                },
                password: {
                    required: true
                }
            },
            errorPlacement: function () {
                return false;
            },
            submitHandler: function (form) {
                $.ajax({
                    type: "POST",
                    url: params.base_url + "shordy/auth/login",
                    data: $(form).serialize(),
                    success: function (data) {
                        sessionStorage.token = data.token;
                        sessionStorage.userids = data.userids;
                        var goTo = localStorage.getItem("goTo");
                        if (goTo == "addplaylist") {
                            embedPlayerObj.addToPlayList();
                            getShodyStatus();
                        } else if (goTo == "fav") {
                            embedPlayerObj.addToFavoritesList();
                            getShodyStatus();
                        } else {
                            embedPlayerObj.addToSubscribedList();
                            getShodyStatus();
                        }
						getShodyStatus();
						
                        // $("#dialog").dialog("close");
                        loginmodalhide();
                    },
                    error: function (textStatus, errorThrown) {
                        var obj = JSON.parse(textStatus.responseText);
                        $('#error').html("<div id='message'></div>");
                        $('#message').html(obj.status)
                                // .append("<p>someone</p>")
                                .hide()
                                .fadeIn(1500, function () {
                                    // $('#message').append("<img id='checkmark' src='images/ok.png' />");
                                });
                    }
                });
                return false; // required to block normal submit since you used ajax
            }
        });
		
		function getShodyStatus (){
		
			if (sessionStorage.token) {
				var sesToken = sessionStorage.token;
			} else {
				var sesToken = '';
			}
			var player_code = params.ShodyUID;
			var url = params.base_url + 'info/' + player_code + '/' + sesToken;
			$.ajax({
				url: url,
				//  xhrFields: {
				//  withCredentials: true
				// },
				success: function (response) {
					var data = $.parseJSON(response);
					var subscribed_user_type = data.data["t22"]["subscribed_user_type"];
					var subscriber_type = (subscribed_user_type == 'NormalUser') ? 'Writer' : 'Publisher';
					var is_loggedin = data.data["t15"];
					var in_playlist = data.data["t17"];
					var is_favorite = data.data["t18"];
					var su_id = data.data["t8"];
					var unique_id = data.data["t7"];
					var logged_user_id = data.data["t19"];
					var shordio_media_url = data.data["t0"];
					
					var shordy_title = data.data["t1"];
					var SubscriptionDetails = data.data["t22"]["SubscriptionDetails"];
					//var subscribed_id = data.data["t22"]["subscribed_id"];
					var subscribed_id = (data.data["t22"].SubscriptionDetails) ? data.data["t22"].SubscriptionDetails.suscribe_id : 0;
					var SubscribeButton = data.data["t21"];
                    var profile_image_sm = data.data["t26"];
					var shordio_media_duration = data.data["t3"];
					var disable = (SubscribeButton == 'Hide') ? 'disabled' : '';
					localStorage.setItem("surl", 'subscribe-now/' + su_id);

                    var html_content = '<div class="player-share follow-wrap" id="player_share_options">' +
                    ( (is_loggedin > 0) ? 
                    (SubscriptionDetails == null ? '<a id="div3"  style="box-shadow:none"  title="Follow This '+subscriber_type+'" class="follow_btn  embedded-subscribe login-addto-subscribe-list" href="javascript:void(0);" ' + disable + '><img src="'+profile_image_sm+'">Follow This ' + subscriber_type + '</a>' :
                    '<a id="div3" title="Following This '+subscriber_type+'"  style="box-shadow:none" class="follow_btn  embedded-subscribe subscribe-active" href="javascript:void(0);" ' + disable + '><img src="'+profile_image_sm+'">Following This ' + subscriber_type + '</a>')+
                            '<div class="icons">'+
                            (in_playlist > 0 ? '<a id="div1"  style="box-shadow:none" title="Remove from Playlist" class="add-to-play-list plus_icn plus-active" href="javascript:void(0);"></a>' : '<a id="div1" title="Add To Playlist" class="addplaylist plus_icn add-to-play-list " href="javascript:void(0);"></a>') +
                            (is_favorite > 0 ? '<a id="div2"  style="box-shadow:none" title="Remove from Favorites" class=" embedded-fav fav_icn favorites-active" href="javascript:void(0);"></a>' : '<a  id="div2" title="Add To Favorites" class=" embedded-fav fav_icn login-addto-favorites" href="javascript:void(0);"></a>')+
                            '</div>'
                            + '<input type="hidden" id="em_sus_id" value="' + subscribed_id + '" >'
                   :
                            '<a id="div3"  style="box-shadow:none" title="Follow This '+subscriber_type+'" class="popupSignupSignin embedded-subscribe login-addto-subscribe-list" href="javascript:void(0);"><img src="'+profile_image_sm+'">Follow This ' + subscriber_type + ' </a>'+       
                            '<div class="icons">'+
                            '<a  id="div1"  style="box-shadow:none" title="Add To Playlist" class="popupSignupSigninss plus_icn addplaylist add add-to-play-list login-addto-playlist" href="javascript:void(0);"></a>' +
                            '<a  id="div233"  style="box-shadow:none"  title="Add To Favorites" class="popupSignupSignin fav_icn embedded-fav login-addto-favorites" href="javascript:void(0);"></a>'+
                            '</div>'
                    )  +
                    '</div>' +
                    '</div>';

                    var html_content_mob = '';  
					/*embedPlayerObj = new EmbedPlayer();
					embedPlayerObj.init(unique_id, logged_user_id);
					params.audioplayer = $.custom.audioplayer(
							{
								audio_url: shordio_media_url,
								audio_title: shordy_title,
								audio_duration: shordio_media_duration,
								play_callback: updatePlaylist
							}, $("#customplayer-embed")
							); */
					$("#player_share_options").remove();
                    $("#ad-progress-wrap-share").after(html_content);
                    $("#embedded-gp1").next("#player_share_options").remove();
					$("#embedded-gp1").after(html_content);
                    // $("#player_share_options_mob").remove();
                    // $("#embedded-gp2").after(html_content_mob);
					//alert(html_content);
					$('a.add-to-play-list').click(function (e) {
						e.preventDefault();
						//alert("Not implemented");
						
						
						if ($(this).hasClass('plus-active')) {
							embedPlayerObj.removeFromPlayList();
						} else if ($(this).hasClass('login-addto-playlist')) {
							if (sessionStorage.token) {
								$(this).removeClass('login-addto-playlist');
								embedPlayerObj.addToPlayList();
							} else {
								localStorage.setItem("goTo", 'addplaylist');
								localStorage.setItem("sh", 'pl-' + unique_id);
								login();
							}
						} else {
							embedPlayerObj.addToPlayList();
						}
						
						
					});
					$('a.embedded-fav').click(function (e) {
						e.preventDefault();
						//alert("Not implemented");
						
						if ($(this).hasClass('favorites-active')) {
							embedPlayerObj.removeFromFavoritesList();
						} else if ($(this).hasClass('login-addto-favorites')) {
							if (sessionStorage.token) {
								$(this).removeClass('login-addto-playlist');
								embedPlayerObj.addToFavoritesList();
							} else {
								localStorage.setItem("goTo", 'fav');
								localStorage.setItem("sh", 'pl-' + unique_id);
								login();
							}
						} else {
							embedPlayerObj.addToFavoritesList();
						}
						
					});
					$('a.embedded-subscribe').click(function (e) {
						e.preventDefault();
						//alert("Not implemented");
						
						if ($(this).hasClass('subscribe-active')) {//embed-active
							embedPlayerObj.removeFromSubscribedList();
						} else if ($(this).hasClass('login-addto-subscribe-list')) {

							if (sessionStorage.token) {
								$(this).removeClass('login-addto-subscribe-list');
								embedPlayerObj.addToSubscribedList();
							} else {
								localStorage.setItem("goTo", 'subscribe-now');
								localStorage.setItem("sh", '#home');
								login();
							}
						} else {
							embedPlayerObj.addToSubscribedList();
						}
						
					});
				}


			});
		
	}
	
	
    });
	


    // function updatePlaylist() {
    //     embedPlayerObj.updatePlayListCount();
    // }
    function login() {
        jQuery("#error").html('');
        jQuery("#email").val('');
        jQuery("#password").val('');
        jQuery(".login").show();
        // alert("hii");
    }
    function loginmodalshow()
    {
        jQuery(".login").show();
    }
    function loginmodalhide()
    {
        jQuery(".login").hide();
        jQuery(".emailcls").val("");
        jQuery(".passwordcls").val("");
        jQuery('#error').css("background","");
        jQuery("#message").hide();
    }
}