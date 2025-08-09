let currentSong = new Audio();
let songs;
let currFolder;
let currAlbum;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;

    let a = await fetch(`songs/${folder}`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1]); // Extract the song name from the URL
        }

    }


    // Show all songs in the song list
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""; // Clear the song list before adding new songs
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>  <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div></div>
                            </div>
                            <img class="invert" src="img/play.svg" alt=""> </li>`;
    }


    // Attach event listeners to each songs 
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        })

    });

    return songs;

}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {

        currentSong.play()
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}


async function displayAlbums() {
    let a = await fetch(`songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchor = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    //cardContainer.innerHTML = ""; // Clear the card container before adding new cards


    let array = Array.from(anchor)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[1]
            //console.log(folder)

            //get the meta data of this file
            let j = await fetch(`songs/${folder}/info.json`);
            let metaData = await j.json();
            //console.log(metaData)                     

            cardContainer.innerHTML += `<div data-folder="${folder}" data-border="false" class="card" id="card">
                        <div class="play">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"
                                xmlns="http://www.w3.org/2000/svg">
                                <polygon points="5,3 19,12 5,21" />
                            </svg>
                        </div>
                        <div class="songQuantity"></div>
                        <img src="songs/${folder}/cover.jpg" alt="">
                        <h3>${metaData.title}</h3>
                        <p>${metaData.description}</p>
                    </div>`


        }
    }


    // Load the playlist whenever a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            //console.log(item.currentTarget.dataset.folder);
            //console.log(item);


            // Remove the selected attribute from all cards
            Array.from(document.getElementsByClassName("card")).forEach(card => {
                card.setAttribute("data-selected", "false");
            });
            // Set the selected attribute to true for the clicked card
            item.currentTarget.setAttribute("data-selected", "true");

            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);

            //console.log("folder songs", songs);
            playMusic(songs[0], true) // Selectes the first song of selected album doesnt play it to play it by default remove true

            // Show the total songs
            let totalSongs = songs.length;
            //console.log("Total songs", totalSongs);

            currLibrary = e.getElementsByTagName("h3")[0].innerHTML;
            let heading = document.querySelector(".heading");
            heading.innerHTML = "";
            heading.innerHTML += `<img class="invert" src="img/playlist.svg" alt="Library">
            <h3>${currLibrary} Library (${totalSongs})</h3>`;



        })
        

    })



}

async function main() {


    // Display the albums on the page
    displayAlbums();


    // Default folder to load songs from
    await getSongs(`songs/${currFolder}`);
    // console.log("Default songs", songs);
    playMusic(songs[0], true); // Play the first song by default



    // Attach an event listener to the play button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    })

    document.addEventListener("keyup", (e) => {
        // console.log(e);

        if (e.key === "Enter" || e.key === " ") {
            if (currentSong.paused) {
                currentSong.play();
                play.src = "img/pause.svg";
            } else {
                currentSong.pause();
                play.src = "img/play.svg";
            }
        }
    })


    // Set play icon to play.svg when song ends
    currentSong.addEventListener("ended", () => {
        play.src = "img/play.svg";
    });



    // Listen for tikmeupdate

    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100; // Set the current time of the song

    })

    // Add an event listener to the hamburger icon

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })

    // Add an event listener to the close icon
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })

    // Add an event listener to previous button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }



    })

    // Add an event listener to next button
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]);
        }

    })

    // Add an event to volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        //console.log(e.target.value);
        currentSong.volume = Number(e.target.value) / 100; // Set the volume of the song
        //console.log(currentSong.volume);
        if (currentSong.volume == 0) {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/mute.svg";
        } else {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/volume.svg";
        }

    })


    // Add an event listener to volume button to mute
    document.querySelector(".volume>img").addEventListener("click", (e) => {
       // console.log(e.target);
        if (currentSong.volume > 0) {
            e.target.src = "img/mute.svg"
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else if (currentSong.volume == 0) {
            e.target.src = "img/volume.svg"
            currentSong.volume = 0.05;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 5;
        }

    })

    // Add an event listener to fast forward and backward
    forward.addEventListener("click", () => {
        currentSong.currentTime = Math.min(currentSong.currentTime + 5, currentSong.duration);
    })

    backward.addEventListener("click", () => {
        currentSong.currentTime = Math.max(currentSong.currentTime - 5, 0);
    })



    // make the arrow keys to control volume and fast forward and backward up and down controlls volume level and left and right controls fast forward and backward and ctrl + left plays previous song and ctrl + right plays next song
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") {

            currentSong.volume = Math.min(currentSong.volume + 0.05, 1);
            document.querySelector(".range").getElementsByTagName("input")[0].value = currentSong.volume * 100;
            if (currentSong.volume == 0) {
                document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/mute.svg";
            } else {
                document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/volume.svg";
            }
        } else if (e.key === "ArrowDown") {
            currentSong.volume = Math.max(currentSong.volume - 0.05, 0);
            document.querySelector(".range").getElementsByTagName("input")[0].value = currentSong.volume * 100;
            if (currentSong.volume == 0) {
                document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/mute.svg";
            } else {
                document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/volume.svg";
            }
        } else if (e.key === "ArrowLeft") {
            currentSong.currentTime = Math.max(currentSong.currentTime - 5, 0);
        } else if (e.key === "ArrowRight") {
            currentSong.currentTime = Math.min(currentSong.currentTime + 5, currentSong.duration);
        }
        //console.log(currentSong.volume);

    });











} main();


