/***************************************************************************
	This Script is a implementation of videos in OpenLayers V3.x and above.
	For more informations: https://github.com/lcalisto/ol_videos
****************************************************************************/
function videoInitialPlay() {
    /*if (document.getElementById('playPauseControlImg').src.slice(document.getElementById('playPauseControlImg').src.length - 8, -4) == 'play') {
        document.getElementById('playPauseControlImg').src = 'img/pause.png';
    }*/
    video.currentTime = 0;
    video.play();
}

function videoPause() {
    video.pause();
}

function videoPlay() {
    videoPause();
    video.play();
}
function removeAnimLayer(map) {
    if (typeof(video)!='undefined'){
        video.pause();
        if(typeof(videoControl)!='undefined'){
            map.removeControl(videoControl);
        }
        delete videoControl;
        var baseLayer;
        map.getLayers().forEach(function(l){
            if(l.get('name')=='animacion-mexico' ){
                baseLayer=l;
            }
        });
        // Sometimes you might need to remove the event listener using the postcomposeKey
        //baseLayer.unByKey(postcomposeKey);
        map.removeLayer(baseLayer);
        var index=0;
        delete video;
        clearInterval(animInterval);
        delete animInterval;
        delete showSeconds;
        delete postcomposeKey;
        map.render();
    }
}
function showAnimLayer(inputVideoWebm, inputVideoMp, bbox, map, playbackRate, showSeconds_, videoOpacity, legend) {
    /****************************************************
        This function creates the folowing globals:
            video;	
            videoControl; 
            showSeconds;
            postcomposeKey; 
            animInterval;
        All this globals are removed once we remove 
        the video with function removeAnimLayer()
    *****************************************************/
    /****************************************************
        First lets remove any video layer if exists.
        Nevertheless it's possible to show multiple videos
        with some modifications to this script
    *****************************************************/
    removeAnimLayer(map);
    var extents = ol.proj.transformExtent([parseFloat(bbox[0]), parseFloat(bbox[1]), parseFloat(bbox[2]), parseFloat(bbox[3])], 'EPSG:4326', 'EPSG:3857');
    var corners = [
        [extents[0], extents[3]],
        [extents[2], extents[3]],
        [extents[2], extents[1]],
        [extents[0], extents[1]]
    ];
    var baseLayer = new ol.layer.Image({
        name: 'animacion-mexico',
        source: new ol.source.ImageStatic({
            url: 'img/blanklayer.png',
            projection: map.getView().getProjection(),
            imageExtent: extents,
        })
    });
    /**************************************
        Setting video as a global 
        so we can remove it later
    ***************************************/
    video = document.createElement('video');
    video.setAttribute("id", "videoElement");
    video.muted='muted';
    video.crossOrigin = 'Anonymous';
    var inputVideo = [
        [inputVideoWebm, 'video/webm'],
        [inputVideoMp, 'video/mp4'],
    ];
    for (var i = 0; i < inputVideo.length; i++) {
        var source = document.createElement('source');
        source.src = inputVideo[i][0];
        source.type = inputVideo[i][1];
        video.appendChild(source);
    }
    /************************************************
                    Video Controls
     *************************************************/
    /*var windowcontainer = document.createElement('div');
    windowcontainer.setAttribute("id", "windowAnim");
    var windowcontent = document.createElement('div');
    windowcontent.setAttribute("id", "windowAnim-content");
    windowcontainer.appendChild(windowcontent);
    windowcontainer.className = "ol-animwindow";
    windowcontainer.onclick = function() {};
    /***********************************
        videoControl will be a global
        so we can remove it later
        ***********************************/
    /*videoControl = new ol.control.Control({
        element: windowcontainer
    });
    windowcontent.innerHTML = '<center><i><div id="videoLegend"></div></center><br>';
    windowcontent.innerHTML += '&nbsp;&nbsp;&nbsp;<img src="img/fastback.png" onclick="document.getElementById(\'playPauseControlImg\').src=\'img/play.png\';videoPause();video.currentTime = video.duration-showSeconds;" style="height:20px;"/>&nbsp;&nbsp;&nbsp;';
    windowcontent.innerHTML += '&nbsp;&nbsp;&nbsp;<img src="img/back.png" onclick="document.getElementById(\'playPauseControlImg\').src=\'img/play.png\';videoPause();if(video.currentTime <= video.duration-showSeconds){video.currentTime = video.duration-showSeconds}else{video.currentTime-=1;}" style="height:20px;"/>&nbsp;&nbsp;&nbsp;';
    windowcontent.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;<img id="playPauseControlImg" src="img/pause.png" onclick="if(document.getElementById(\'playPauseControlImg\').src.slice(document.getElementById(\'playPauseControlImg\').src.length-8,-4)==\'play\'){document.getElementById(\'playPauseControlImg\').src=\'img/pause.png\';videoPlay();}else{document.getElementById(\'playPauseControlImg\').src=\'img/play.png\';videoPause();}" style="height:20px;"/>&nbsp;&nbsp;&nbsp;&nbsp;';
    windowcontent.innerHTML += '&nbsp;&nbsp;&nbsp;<img src="img/forward.png" onclick="document.getElementById(\'playPauseControlImg\').src=\'img/play.png\';videoPause();video.currentTime+=1;" style="height:20px;"/>&nbsp;&nbsp;&nbsp;';
    windowcontent.innerHTML += '&nbsp;&nbsp;&nbsp;<img src="img/fastforward.png" onclick="document.getElementById(\'playPauseControlImg\').src=\'img/play.png\';videoPause();video.currentTime=showSeconds-1;" style="height:20px;"/>&nbsp;&nbsp;&nbsp;';
    windowcontainer.style.display = 'block';

    //map.addControl(videoControl);
    
    /*******************************
        Video Events
        *******************************/
    if (typeof(playbackRate) == 'undefined' || playbackRate == null) {
        video.playbackRate = 1;
    } else {
        video.playbackRate = playbackRate;
    }
    video.addEventListener('ended', function() {
        /*if (document.getElementById('playPauseControlImg').src.slice(document.getElementById('playPauseControlImg').src.length - 8, -4) == 'play') {
            document.getElementById('playPauseControlImg').src = 'img/pause.png';
        }*/
        this.currentTime = 0;
        this.play();
    }, false);
    /***************************************
     *	Controling the Legend in the video
     ****************************************/
     if(!(typeof(legend)=='undefined' || legend==null)){
         video.addEventListener('timeupdate', function() {
             if (typeof(video) != 'undefined') {
                 if (video.currentTime > showSeconds) {
                     video.currentTime = 0;
                 }
                 // in case IE 10 or bellow
                 if (navigator.appName != 'Netscape') {
                     var currentTimeUpdate = video.currentTime.toFixed(0);
                     if (currentTimeUpdate < 3) {
                         var currentTimeStamp = new Date(legend[0]);
                     } else {
                         var currentTimeStamp = new Date(legend[currentTimeUpdate - 3]);
                     }
                     //videoLegend.innerHTML = currentTimeStamp.toGMTString().substring(0, currentTimeStamp.toGMTString().length - 7) + " UTC";
                 } else {
                     //the last frame is repeated so the time is the same as the previous
                     var currentTimeUpdate = video.currentTime.toFixed(0);
                     if (typeof(legend[currentTimeUpdate]) == 'undefined') {
                         var currentTimeStamp = new Date(legend[currentTimeUpdate - 1]);
                     } else {
                         var currentTimeStamp = new Date(legend[currentTimeUpdate]);
                     }
                     //videoLegend.innerHTML = currentTimeStamp.toGMTString().substring(0, currentTimeStamp.toGMTString().length - 7) + " UTC";
                 }
             }
         }, false);
     }
    /***************************************
        We can only start playing and change 
        the duration of the video the video 
        after the video is loaded. 
    ****************************************/
    video.addEventListener('loadeddata', function() {
        videoInitialPlay();
        /*************************************************************************
            Set global variable showSeconds, this will alow us to controll
            the video according to the seconds we want to show!
            If showSeconds_ is not provided then the full video will be shown
        ***************************************************************************/
        if (typeof(showSeconds_) == 'undefined' || showSeconds_ == null || showSeconds_ == 'all') {
            showSeconds = video.duration;
        } else {
            showSeconds = showSeconds_;
        }
    }, false);

    var topLeft = corners[0];
    var topRight = corners[1];
    var bottomRight = corners[2];
    var height = topRight[1] - bottomRight[1];
    var width = topRight[0] - topLeft[0];
    /***************************************
        Video rotation can also be accomplished
        not used in this case!
    ****************************************/
    var dx = width;
    var dy = topLeft[1] - topRight[1];
    var rotation = Math.atan2(dy, dx);
    /***************************************
        Finally we will add the video to OL
        using canvas and save the postcomposeKey 
        as a global.
    ****************************************/
    if (typeof(videoOpacity) == 'undefined' || videoOpacity == null) {
        videoOpacity = 0.5;
    }
    postcomposeKey = baseLayer.on('postcompose', function(event) {
        var frameState = event.frameState;
        var resolution = frameState.viewState.resolution;
        var origin = map.getPixelFromCoordinate(topLeft);
        var context = event.context;
        context.save();
        context.scale(frameState.pixelRatio, frameState.pixelRatio);
        context.translate(origin[0], origin[1]);
        context.rotate(rotation);
        context.globalAlpha = videoOpacity;
        context.drawImage(video, 0, 0, width / resolution, height / resolution);
        context.restore();
    });
    map.addLayer(baseLayer);
    /***************************************************************
        Set one more global for setInterval() method. 
        Map will be rendered in this example 10 times per second.
        **************************************************************/
    animInterval = setInterval(function() {
        map.render();
    }, 1000 / 10);
}


var legend = ["2017-07-22T00:00:00Z", "2017-07-22T01:00:00Z", "2017-07-22T02:00:00Z", "2017-07-22T03:00:00Z", "2017-07-22T04:00:00Z", "2017-07-22T05:00:00Z", "2017-07-22T06:00:00Z", "2017-07-22T07:00:00Z", "2017-07-22T08:00:00Z", "2017-07-22T09:00:00Z", "2017-07-22T10:00:00Z", "2017-07-22T11:00:00Z", "2017-07-22T12:00:00Z", "2017-07-22T13:00:00Z", "2017-07-22T14:00:00Z", "2017-07-22T15:00:00Z", "2017-07-22T16:00:00Z", "2017-07-22T17:00:00Z", "2017-07-22T18:00:00Z", "2017-07-22T19:00:00Z", "2017-07-22T20:00:00Z", "2017-07-22T21:00:00Z", "2017-07-22T22:00:00Z", "2017-07-22T23:00:00Z", "2017-07-23T00:00:00Z", "2017-07-23T01:00:00Z", "2017-07-23T02:00:00Z", "2017-07-23T03:00:00Z", "2017-07-23T04:00:00Z", "2017-07-23T05:00:00Z", "2017-07-23T06:00:00Z", "2017-07-23T07:00:00Z", "2017-07-23T08:00:00Z", "2017-07-23T09:00:00Z", "2017-07-23T10:00:00Z", "2017-07-23T11:00:00Z", "2017-07-23T12:00:00Z", "2017-07-23T13:00:00Z", "2017-07-23T14:00:00Z", "2017-07-23T15:00:00Z", "2017-07-23T16:00:00Z", "2017-07-23T17:00:00Z", "2017-07-23T18:00:00Z", "2017-07-23T19:00:00Z", "2017-07-23T20:00:00Z", "2017-07-23T21:00:00Z", "2017-07-23T22:00:00Z", "2017-07-23T23:00:00Z"];
var bbox = [
    "-125.13", //left
    "6.35", //bottom
    "-79.005", //right
    "34.79" //top
];
var framerate=1;
var showSeconds='all';
var opacity=0.7;
showAnimLayer('latest.mp4', '', bbox, map, framerate, showSeconds, opacity,legend);