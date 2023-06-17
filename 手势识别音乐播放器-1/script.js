const doc = document;

// 歌曲信息数组
const songsList = [
    {
        id: 'xxx-01',
        title: '天空之城',
        author: '久石让',
        path: './music/天空之城.mp4',
        bgPath: './image/1.jpg',
        time: 0
    },
    {
        id: 'xxx-02',
        title: 'Celebrity',
        author: 'IU',
        path: './music/Celebrity.mp3',
        bgPath: './image/2.jpg',
        time: 0
    },
    {
        id: 'xxx-03',
        title: 'The Rain',
        author: '久石让',
        path: './music/The Rain.mp4',
        bgPath: './image/3.jpg',
        time: 0
    }
];

// DOM元素
const audio = doc.querySelector('#audio'); // 播放器
const bgImg = doc.querySelector('#bg-img'); // 插图
const controls = doc.querySelector('#controls'); // 按钮区域
const title = doc.querySelector('#title'); // 歌曲标题
const author = doc.querySelector('#author'); // 歌曲作者
const playBtn = doc.querySelector('#play'); // 播放按钮
const voiceBtn = doc.querySelector('#voice'); // 声音开关

// 当前播放歌曲
let curSongIndex = 1;
// 是否在播放
let isPlay = false;

let previousGesture = null;
let previousGesture2 = null;

// 添加手势识别功能
let isGestureEnabled = false; // 手势识别是否启用的标志

// 手势识别回调函数 gesture是右手
function handleGesture(gesture,gesture2) {
    if (!isGestureEnabled) return;
     //console.log(gesture)
    if(gesture==previousGesture2&&gesture2==previousGesture2)
        return;
     if (gesture !== previousGesture||gesture2!==previousGesture2) {
        // 执行相应的操作style="display: none;"
        if ((gesture === 'closed'&&gesture2=='closed')) {
            // 上一曲
            var myDiv = document.getElementById("print");
             myDiv.innerHTML = "识别到的手势为："+gesture+" 和 "+gesture2;
            preSong();

            
          }else if (gesture === 'open'&&gesture2=='open') {
            // 下一曲
            var myDiv = document.getElementById("print");
            myDiv.innerHTML = "识别到的手势为："+gesture+" 和 "+gesture2;
            nextSong();
            
          }
         else if ((gesture === 'closed'&&gesture2=='open')||(gesture === 'open'&&gesture2=='closed')) {
          // 开声音
          var myDiv = document.getElementById("print");
          myDiv.innerHTML = "识别到的手势为："+gesture+" 和 "+gesture2;
          voiceOn();
          
        } else if ((gesture === 'point'&&gesture2=='open')||(gesture === 'open'&&gesture2=='point')) {
          // 关声音
          var myDiv = document.getElementById("print");
          myDiv.innerHTML = "识别到的手势为："+gesture+" 和 "+gesture2;
          voiceOff();
          
        }else if (gesture === 'point'&&gesture2=='point') {
            // 播放
            var myDiv = document.getElementById("print");
            myDiv.innerHTML = "识别到的手势为："+gesture+" 和 "+gesture2;
            songPlay();
           
          }else if ((gesture === 'point'&&gesture2=='closed')||(gesture === 'closed'&&gesture2=='point')) {
            // 暂停
            var myDiv = document.getElementById("print");
            myDiv.innerHTML = "识别到的手势为："+gesture+" 和 "+gesture2;
            songPause();
           
          }
        previousGesture = gesture;
        previousGesture2=gesture2;
      }
   
}

const modelParams = {
    flipHorizontal: true, // 是否将输入图像水平翻转
    imageScaleFactor: 0.7, // 输入图像的缩放因子，可以在 0.2 到 1.0 之间进行调整
    maxNumBoxes: 3, // 最大检测到的数量
    iouThreshold: 0.33, // 手势框之间的 IOU 阈值
    scoreThreshold: 0.7, // 手势检测的置信度阈值
    face: false,
  };
  
// 初始化手势识别
function initGestureRecognition() {
    const video = doc.querySelector('#video');

    handTrack.load(modelParams).then(model => {
        console.log('Handtrack.js 模型加载成功！');
        handTrack.startVideo(video).then(status => {
            if (status) {
                console.log('摄像头视频流已启动！');
                detectGesture(model);
            }
        });
    });

    function detectGesture(model) {
        setInterval(() => {
            model.detect(video).then(predictions => {
                if (predictions.length > 0) {
                    //console.log(predictions)
                    //const gesture = predictions[0].label;
                    //let gesture2 = null;
                    //if(predictions[1].label!=null)
                    //    gesture2 = predictions[1].label;
                    if(predictions[0].label =='face'&&predictions[1].label!=null&&predictions[2].label!=null)
                       {console.log('检测到手势:', predictions[1].label,predictions[2].label);
                       handleGesture(predictions[1].label,predictions[2].label);
                    }
                    else if(predictions[1].label=='face'&&predictions[0].label!=null&&predictions[2].label!=null)
                    {console.log('检测到手势:', predictions[0].label,predictions[2].label);
                       handleGesture(predictions[0].label,predictions[2].label);
                    }
                    else (predictions[2].label=='face'&&predictions[1].label!=null&&predictions[0].label!=null)
                    {console.log('检测到手势:', predictions[0].label,predictions[1].label);
                       handleGesture(predictions[0].label,predictions[1].label);
                    }
                }
            });
        }, 100);
    }
}

// 打开摄像头并启用手势识别
function enableGestureRecognition() {
    isGestureEnabled = true;
    initGestureRecognition();
}

// 关闭手势识别
function disableGestureRecognition() {
    isGestureEnabled = false;
}



function init() {
    render(songsList[curSongIndex]);
    enableGestureRecognition(); // 启用手势识别
}


// 按钮事件
controls.addEventListener('click', e => {
    switch (e.target?.id) {
        case 'list': // 歌曲列表
            // TODO
            break;
        case 'voice': // 声音开关
            voiceControl();
            break;
        case 'pre': // 上一首
            preSong();
            break;
        case 'play': // 播放/暂停
            togglePlay();
            break;
        case 'next': // 下一首
            nextSong();
            break;
        case 'mode': // 播放模式
            // TODO
            break;
        default:
            break;
    }
});

// 播放 / 暂停 切换
function togglePlay() {
    if (!isPlay) {
        // 暂停 图标切换
        songPlay();
    } else {
        // 播放 图标切换
        songPause();
    }
}

// 播放
function songPlay() {
    isPlay = true;
    playBtn.classList.remove('icon-24gf-play');
    playBtn.classList.add('icon-iconstop');
    audio.play();
}

// 暂停
function songPause() {
    isPlay = false;
    playBtn.classList.remove('icon-iconstop');
    playBtn.classList.add('icon-24gf-play');
    audio.pause();
}

// 上一首
function preSong() {
    if (curSongIndex > 0) {
        curSongIndex--;
        render(songsList[curSongIndex]);
        songPlay();
    }
}

// 下一首
function nextSong() {
    if (curSongIndex < songsList.length - 1) {
        curSongIndex++;
        render(songsList[curSongIndex]);
        songPlay();
    }
}

// 声音控制
function voiceControl() {
    if (audio.volume > 0) {
        voiceOff();
    } else {
        voiceOn();
    }
}

// 声音开
function voiceOn() {
    audio.volume = 1;
    voiceBtn.classList.remove('icon-volume-mute-fill');
    voiceBtn.classList.add('icon-shengyin_shiti');
}

// 声音关
function voiceOff() {
    audio.volume = 0;
    voiceBtn.classList.remove('icon-shengyin_shiti');
    voiceBtn.classList.add('icon-volume-mute-fill');
}


// 内容渲染到页面
function render(song) {
    title.innerHTML = song.title;
    author.innerHTML = song.author;
    bgImg.src = song.bgPath; // 插图
    audio.volume = 1; // 音量 0 ~ 1
    audio.src = song.path; // 音乐资源路径
}


init();