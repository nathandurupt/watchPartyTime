const socket = io("/");
let videoSrc;
let movieUser;
let movietime;
const videoGrid = document.getElementById("theShow");
const peeps = document.querySelector('.peepsContainer');
const popup = document.querySelector('.popup');
const myPeer = new Peer(undefined, {
	host:'peerjs-server.herokuapp.com',
	secure: "true",
	port: "443"
});

window.onload = () => {
	document.querySelector('.loader').classList.add('loaded');
	document.querySelector('.loader').addEventListener("transitionend", () => {
		document.querySelector('.loaded').style.display = "none";
	})

}
socket.on('movie-check', userId => {
	movieUser = userId;
  console.log(userId);
  console.log('MOVIE CHECK');
  popup.querySelector('.screen').classList.add('movieInactive');
	console.log('MOVIEUSER: ' + movieUser);
})
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

popup.addEventListener('click', (event) => {
  if (event.target.classList.contains('screen')) {
    videoSrc = 0;
    socket.emit('movie');
    navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    }).then(stream => {
      addVideoStreamMovie(myVideo, stream)
			popup.classList.add('popupClicked');
      myPeer.on('call', call => {
        console.log('STARTING STREAM')
        call.answer(stream)
				console.log('caught stream')
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
					console.log('adding peep');
					addVideoStreamPeep(video, userVideoStream);
        })
    })
    socket.on('user-connected', userId => {
			console.log('connecting ' + userId);
      setTimeout(function ()
        {
          connectToNewUser(userId, stream);
        },5000
      )
    })
  })
}
    else if (event.target.classList.contains('mic')) {
      videoSrc = 1;
      navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
      }).then(stream => {
        addVideoStreamPeep(myVideo, stream)
				popup.classList.add('popupClicked');

        myPeer.on('call', call => {
          console.log('STARTING STREAM')
          call.answer(stream)
          console.log('CONNECTION ID: ' + call.peer)
          /*for (c in call) {
            console.log(c);
          }*/
          const video = document.createElement('video')
          call.on('stream', userVideoStream => {
						let compare;
            console.log('STARTING STREAM')
						console.log('CALL.PEER: ' + `'${call.peer}'`);
						console.log('MOVIEUSER: ' + `'${movieUser}'`);
						if (typeof(movieUser) != 'undefined') {
						compare = movieUser.localeCompare(call.peer);
						console.log('CALL = PEER?: ' + compare);
					} else {
						compare = 1;
					}
            if (compare == 0) {
							console.log('STARTING movie')
              addVideoStreamMovie(video, userVideoStream);
            } else {
							console.log('STARTING peep')
              addVideoStreamPeep(video, userVideoStream);
            }
          })
      })
      socket.on('user-connected', userId => {
				console.log('connecting ' + userId);

        setTimeout(function ()
          {
            connectToNewUser(userId, stream);
          },5000
        )
      })
    })
}
}, true)

socket.on('movie-time', () => {
	if (movietime != 0) {
	movieTime();
}
})
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
	console.log('USERID: ' + userId);
	console.log('MOVIEUSER: ' + movieUser)
	if (typeof(movieUser) != 'undefined') {
	let compare = movieUser.localeCompare(call.peer);
	console.log('movieUser exists')
} else {
	let compare = 1;
	console.log('movieUser exists not')
}
  const video = document.createElement('video')
  call.on('stream', (userVideoStream, compare) => {
    console.log('CONNECTONG TP NRW USER');
		if (typeof(movieUser) != 'undefined' && compare == 0) {
			console.log('STARTING movie')
			addVideoStreamMovie(video, userVideoStream);
		} else {
			console.log('STARTING peep')
			addVideoStreamPeep(video, userVideoStream);
		}
})
  call.on('close', () => {
    video.remove()
  })
  peers[userId] = call
}

function addVideoStreamMovie(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  video.classList.add('movie');
  videoGrid.appendChild(video);
}

function addVideoStreamPeep(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  video.classList.add('peep');
	//video.classList.add(color);
  peeps.appendChild(video);
}
function movieTime() {
	peeps.classList.toggle('peepsActive');
	document.querySelector('.mainWrapper').classList.toggle('movieTime');
	document.querySelector('.movieButton').classList.toggle('movieButtonMovie');
}

document.querySelector('.movieButton').addEventListener("click", () => {
	socket.emit('movie-time');
	movieTime();
})

let color;
/*document.querySelector('.colors').addEventListener('click', event => {
	if (event.target.classList.contains('color')) {
		event.target.classList.add('colorPicked');
		color = event.target.id;
		let colors = document.getElementsByClassName('color');
		for(let x = 0; x < colors.length; x++) {
			if (colors[x].id != event.target.id) {
				colors[x].classList.remove('colorPicked');
			}
		}
	}
})*/
