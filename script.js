
let currentsong = new Audio();
let songs;
let currfolder;
let cursongname;
console.log(currentsong.src)
function secondtominsec(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    const minutes = Math.floor(seconds / 60);
    const remaniningseconds = Math.floor(seconds % 60);
    const formattedminutes = String(minutes).padStart(2, "0");
    const formattedseconds = String(remaniningseconds).padStart(2, "0");
    return `${formattedminutes}:${formattedseconds}`
}

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(
                decodeURIComponent(element.href.split("/").pop())
                    .replace("\\songs\\", "")
            );
        }

        let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songUL.innerHTML = "";

        for (const song of songs) {
            songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>Mehak</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
        }

        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", element => {
                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            })
        })
    }
    return songs;

}

const playMusic = (track, pause = false) => {
    cursongname = track;

    // currentsong.src = /${currfolder}/ + track
    currentsong.src = `http://127.0.0.1:3000/songs/` + track
    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        let cleanHref = e.href.replaceAll("%5C", "/")
        if (cleanHref.includes("/songs/") && !cleanHref.endsWith("/songs/")) {

            let folder = cleanHref.split("/").slice(-2)[0]
            console.log("folder:", folder)
            try {
                let res = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)

                if (!res.ok) {
                    console.log("not found:", folder)
                    continue;
                }
                let data = await res.json()
                cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card ">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.png" alt="">
                        <h2>${data.title}</h2>
                        <p>${data.description}</p>
                    </div>`


                console.log("✅ JSON:", data)


            } catch (err) {
                console.log("error:", err)
            }

        }
    }


}



async function main() {


    await getSongs("songs/ncs");
    playMusic(songs[0], true)

    //display all the albums on the page
    displayAlbums()


    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = secondtominsec(currentsong.currentTime) + " / " + secondtominsec(currentsong.duration)
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        // console.log("close clicked");
        document.querySelector(".left").style.left = "-100%"
    })

    previous.addEventListener("click", () => {
        console.log("Previous clicked")
        let currentfile = decodeURIComponent(currentsong.src.split("/").pop().trim())
        let index = songs.indexOf(cursongname)

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }

    })

    next.addEventListener("click", () => {
        console.log("Next clicked")
        // console.log(currentsong.src)
        let currentfile = decodeURIComponent(currentsong.src.split("/").pop())
        let index = songs.indexOf(cursongname)

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }

    })
    // add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e);
        currentsong.volume = parseInt(e.target.value) / 100;
    })

    //load the playlist whenever card is clicked
    document.querySelector(".cardContainer").addEventListener("click", async e => {
        let card = e.target.closest(".card")
        if (!card) return;
        let folder = card.dataset.folder
        songs = await getSongs(`songs/${folder}`)
        playMusic(songs[0])
    })

    //Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        console.log(e.target)
        console.log("changing", e.target.src)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentsong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentsong.volume = 1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }


    })


}

main()