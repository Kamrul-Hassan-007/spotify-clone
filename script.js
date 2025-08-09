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
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Fetch song list for a folder from its info.json
async function getSongs(folder) {
    currFolder = folder;

    // NEW: load track list from info.json instead of directory listing
    let infoRes = await fetch(`${folder}/info.json`);
    let info = await infoRes.json();
    songs = info.tracks;

    // Show all songs in the song list
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song}</div>
                    <div></div>
                </div>
                <img class="invert" src="img/play.svg" alt="">
            </li>`;
    }

    // Attach event listeners to each song
    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/${encodeURIComponent(track)}`;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    // NEW: load album folders from songs/index.json instead of directory listing
    let albumsRes = await fetch(`songs/index.json`);
    let albums = await albumsRes.json();

    let cardContainer = document.querySelector(".cardContainer");
    for (let folder of albums) {
        let j = await fetch(`songs/${folder}/info.json`);
        let metaData = await j.json();

        cardContainer.innerHTML += `
            <div data-folder="${folder}" data-border="false" class="card" id="card">
                <div class="play">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"
                        xmlns="http://www.w3.org/2000/svg">
                        <polygon points="5,3 19,12 5,21" />
                    </svg>
                </div>
                <div class="songQuantity"></div>
                <img src="songs/${folder}/${metaData.cover}" alt="">
                <h3>${metaData.title}</h3>
                <p>${metaData.description}</p>
            </div>`;
    }

    // Load playlist when a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            Array.from(document.getElementsByClassName("card"))
                 .forEach(card => card.setAttribute("data-selected", "false"));
            item.currentTarget.setAttribute("data-selected", "true");

            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0], true);

            let totalSongs = songs.length;
            currLibrary = e.getElementsByTagName("h3")[0].innerHTML;
            let heading = document.querySelector(".heading");
            heading.innerHTML = `<img class="invert" src="img/playlist.svg" alt="Library">
                                 <h3>${currLibrary} Library (${totalSongs})</h3>`;
        });
    });
}

async function main() {
    displayAlbums();
    // Don’t preload songs until album is selected
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    document.addEventListener("keyup", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            if (currentSong.paused) {
                currentSong.play();
                play.src = "img/pause.svg";
            } else {
                currentSong.pause();
                play.src = "img/play.svg";
            }
        }
    });

    currentSong.addEventListener("ended", () => {
        play.src = "img/play.svg";
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index - 1 >= 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index + 1 < songs.length) playMusic(songs[index + 1]);
        else playMusic(songs[0]);
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = Number(e.target.value) / 100;
        document.querySelector(".volume img").src =
            currentSong.volume === 0 ? "img/mute.svg" : "img/volume.svg";
    });

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (currentSong.volume > 0) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.05;
            document.querySelector(".range input").value = 5;
        }
    });

    forward.addEventListener("click", () => {
        currentSong.currentTime = Math.min(currentSong.currentTime + 5, currentSong.duration);
    });

    backward.addEventListener("click", () => {
        currentSong.currentTime = Math.max(currentSong.currentTime - 5, 0);
    });
}

main();
