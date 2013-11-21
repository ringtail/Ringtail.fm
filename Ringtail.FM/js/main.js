var	DEFAULT_THEME='small';
var DEFAULT_ORIGIN="bus.fm";
var DEFAULT_CHANNEL = 1;
var DEFAULT_BG ='url(../img/bg_1.jpg)';
var status={
	'theme':DEFAULT_THEME,
	'origin':DEFAULT_ORIGIN,
	'channel':DEFAULT_CHANNEL
};
var Origin={
    'getDouban': function (theme, channel) {
 
		$.ajax({
			url : "http://douban.fm/j/mine/playlist?type=n&channel="+channel,
			dataType : "json",
			cache: false,
			async: false,
			success : function(data) {
				MusicContent.songList=[];
				$.each(data['song'], function(n, value) {
					var song = {};
					song["content"] = {
						"src" : value.url,
						"type" : "audio/mp3",
						"artist":value.artist,
						"album":value.albumtitle
					}; 			
					song["config"] = {
						"title" : value.title + " -- " + value.artist,
						"poster" : value.picture,
						"start" : true
					};
					MusicContent.songList.push(song);		
				});
				//return Box.create(theme);
			},
			error: function (XMLHttpRequest, testStatus, errorThtrown) {
			    console.log('error'+XMLHttpRequest.status);
			    //console.log(XMLHttpRequest.status);
			    console.log(XMLHttpRequest.status);
			    switch (XMLHttpRequest.status) {
					case 200:
						$('#warning').show(1000,function(){
							$('#warning').html('<div class="warning_text">对不起，请检查当前的网络连接</div>')
							 $('div.wheel').removeClass('wheel_left_active');
               				 $('#cassette_appearance').removeClass('cassette_appearance_active');
						});
						break;
					case 403:
						$('#warning').show(1000,function(){
							$('#warning').html('<div class="warning_text">Ringtail.FM是非营利软件，暂时无法承载过多用户同时收听，请您收听五个主打的频道：红、白、蓝、灰、紫，Ringtail.FM一定会在您的鼓励下走的更远。</div>')
							 $('div.wheel').removeClass('wheel_left_active');
               				 $('#cassette_appearance').removeClass('cassette_appearance_active');
						});
						break;
					default:
						$('#warning').show(1000,function(){
							$('#warning').html('<div class="warning_text">遇到了未知错误，我们对此深表歉意，如果您愿意帮助我们改进Ringtail.FM，请发送邮件至：77391379@qq.com</div>')
							 $('div.wheel').removeClass('wheel_left_active');
               				 $('#cassette_appearance').removeClass('cassette_appearance_active');
						})
						;
				}

			}
		});
		
	},
	'getBus':function(theme,channel){
		$.ajax({
			url : "http://v1.bus.fm/ajax/content?id="+channel,
			dataType : "json",
			type:"GET",
			cache: false,
			async:false,
			success:function(data){
				MusicContent.songList=[];
				for(var i=0,j=data.length;i<j;i++)
					{
						var song = {};
						song['content']={
							'src':data[i][2],
							'type':'audio/mp3',
							'artist':data[i][3],
							'album':data[i][4]
							
						};
						song['config']={
							'title':data[i][1]+" - "+data[i][3],
							'poster':data[i][5],
							'start':true
						}
						MusicContent.songList.push(song);
				}
                    
					//return Box.create(theme);
			},
			error: function (XMLHttpRequest, testStatus, errorThrown) {
			        console.log('error'+XMLHttpRequest.status);
				// console.log(XMLHttpRequest.status);
				// return false;
			        switch (XMLHttpRequest.status) {
					case 200:
						$('#warning').show(1000,function(){
							$('#warning').html('<div class="warning_text">对不起，请检查当前的网络连接</div>')
							 $('div.wheel').removeClass('wheel_left_active');
               				 $('#cassette_appearance').removeClass('cassette_appearance_active');
						});
						break;
					case 403:
						$('#warning').show(1000,function(){
							$('#warning').html('<div class="warning_text">Ringtail.FM是非营利软件，暂时无法承载过多用户同时收听，请您收听五个主打的频道：红、白、蓝、灰、紫，Ringtail.FM一定会在您的鼓励下走的更远。</div>')
							 $('div.wheel').removeClass('wheel_left_active');
               				 $('#cassette_appearance').removeClass('cassette_appearance_active');
						});
						break;
					default:
						$('#warning').show(1000,function(){
						    $('#warning').html('<div class="warning_text">遇到了未知错误，我们对此深表歉意，如果您愿意帮助我们改进Ringtail.FM，请发送邮件至：77391379@qq.com</div>');
							 $('div.wheel').removeClass('wheel_left_active');
               				 $('#cassette_appearance').removeClass('cassette_appearance_active');
						})
						;
			    }
			    //console.log(XMLHttpRequest.status);

			}

		});	 
	}
}
var MusicContent={

	'songList':[],
	"getList": function (theme, origin, channel) {
	    status.origin = origin;
	    status.channel = channel;
		switch (origin){
			case "douban.fm":
				Origin.getDouban(theme,channel);
				break;
			case "bus.fm":
			    Origin.getBus(theme,channel);		  
				break;
			default:
				Origin.getDouban(theme,channel);
				break;
	    }
		
		
	},
	'nextList':function(){
		MusicContent.getList(status.theme,status.origin,status.channel);
	}

}

var Box = {
	//创建小的播放器
    "create": function (theme) {
        $('#player').html("<br/>");
				var halfWidth = window.screen.width*0.5-125;
				switch(theme){
					case "small":
						(function(){
							$('#player').speakker({
									file: {"playlist" : MusicContent.songList},
									playlist:true,
									poster: 'img/album-cover.png',
									title: 'Ringtail.FM',
									theme: 'dark',
									autoPlay: false,
									playListFinish:function(){
										
											//
											MusicContent.nextList();

					
									}

								
							});
							$('.mspeakker').css('margin-left',halfWidth+'px');
							//$('.skPlay').trigger('click');
						})();
						break;
					case "big":
						(function(){
							$().speakker({
								file: {"playlist" : MusicContent.songList},
								playlist:true,
								theme:'dark',
								title: 'Ringtail.FM',
								poster:'img/album-cover.png',
								autoPlay: false,
								playListFinish:function(){
										
											MusicContent.nextList();
										
									}
							});
							
						})();
						$('.mspeakker').css('margin-left',halfWidth+'px');
						//$('.skPlay').trigger('click');
						break;
					default:
							(function(){
							$("#player").speakker({
									poster: 'img/album-cover.png',
									title: 'Ringtail.FM',
									theme: 'dark',
									poster:'img/album-cover.png'
							});
						})();
						$('.mspeakker').css('margin-left',halfWidth+'px');
						//$('.skPlay').trigger('click');

						break;
				}
			},

		//采用重力模式
			"gravityMode":function(){
				alert('gravity_mode')
			}
}
var Cassette={
	'playLeft':function(){
			$('.wheel').css('-ms-animation','rotateLeft 2s linear infinite forwards');

	},
	'playRight':function(){
			$('.wheel').css('-ms-animation','rotateRight 2s linear infinite forwards');

	},
	'play':function(){
			$('.wheel').css('-ms-animation','rotateLeft 2s linear infinite forwards');

	},
	'stop':function(){
			$('.wheel').css('-ms-animation','');

	},	
	'fastLeft':function(){
			$('.wheel').css('-ms-animation','rotateLeft 0.5s linear infinite forwards');

	},
	'fastRight':function(){
			$('.wheel').css('-ms-animation','rotateRight 0.5s linear infinite forwards');

	}
}

//var ChannelMenu={
//	'create':function(){
//		//var cf = new ContentFlow('contentFlow', {reflectionColor: "#000000"});
//	}
//}


$(document).ready(function () {
    
    var song = {};
    song['content'] = {
        'src': 'sound/start.mp3',
        'type': 'audio/mp3',
        'artist': 'Ringtail.FM',
        'album': 'Ringtail.FM'

    };
    song['config'] = {
        'title': 'welcome to Ringtail.FM',
        'poster': 'img/album-cover.png',
        'start': true
    }
    MusicContent.songList.push(song);
    MusicContent.getList(status.theme, status.origin, status.channel);


    $('#change_songs').click(function () {
        $('#warning').hide(1000);
        $('#cassette').rotate3Di(180, 300);
        $('#cassette').rotate3Di(360, 1);
        MusicContent.getList(status.theme, status.origin, status.channel);
        Box.create(status.theme);
    });
    $('#change_channel').click(function () {
        $('#cassette').rotate3Di(180, 300);
        $('#cassette').rotate3Di(360, 1);
        $('#player').slideUp(1000, function () {
            $('#warning').hide(1000);
            $('#channel_menu').slideDown(1000);
        });
    });

    //$('#change_bg').click(function () {
       
    //    $('#warning').show(1000, function () {
    //        $('#warning').css('opacity', 0.8);
    //        $('#warning').load('pages/settings.html #settings_content');
    //    });
    //});


   

});

