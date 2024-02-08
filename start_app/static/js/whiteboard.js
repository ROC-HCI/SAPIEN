// $(document).ready(() => {

function changeWhiteboardState(state) {
    let whiteboard = new Whiteboard();
    let $whiteboardWindow = $("#whiteboard");
    let $whiteboardContent = $("#whiteboardContent");

    console.log("changing whiteboard state to " + state);
    $whiteboardWindow.removeClass("small large minimized");
    $whiteboardWindow.addClass(state);
    // whiteboard.refresh($whiteboardContent);
}


function whiteboard_ready() {
    console.log("WHITEBOARD STARTING UP");

    let whiteboard = new Whiteboard();
    
    let $whiteboard = $("#whiteboard");
    $whiteboard.show();
    $whiteboard.addClass("minimized");
    
    let $whiteboardContent = $("#whiteboardContent");
    
    // Event listeners using the new changeWhiteboardState function
    $('#whiteboardControls button.minimize').click(() => changeWhiteboardState("minimized"));
    $('#whiteboardControls button.small').click(() => changeWhiteboardState("small"));
    $('#whiteboardControls button.large').click(() => changeWhiteboardState("large"));


    // $('#testButtons').append($('<button>Ping Flask</button>').click(() => {
        // ping flask

    console.log("pinging flask...");

    fetch('/whiteboard_test/ping', {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            if (!data.has_media) {
                console.log("No media in this ping")
                changeWhiteboardState("minimized");
                return;
            }
            var newMediaItems = []
            data.media.forEach(mediaItem => {
                newMediaItems.push(new WhiteboardContent(mediaItem));
            })
            whiteboard.addMediaGroup(newMediaItems);
            changeWhiteboardState("small");
            whiteboard.refresh($whiteboardContent);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Gets attribute data-raw-text, decodes it from Base64, then copies to clipboard
function copyMarkdown(target) {
    console.log("copying markdown");
    var contentB64 = target.getAttribute('data-raw-text');
    var decoded = atob(contentB64);
    console.log(`copying content: ${decoded}`);
    navigator.clipboard.writeText(decoded);
}

/*
 * Each WhiteboardContent contains one or more media items
 * WhiteboardContent(media) takes a single media item
*/
class WhiteboardContent {
    constructor(media) {
        this.media = media;
        console.log(`media: ${this.media.content}, type: ${this.media.type}`);
        switch (this.media.type) {
            case "html":
                console.log("got html");
                this.mediaHTML = this.media.content;
                break;
            case "plaintext":
                console.log("got plaintext");
                this.mediaHTML = `
                    <p class="font-normal">${this.media.content}</p>
                `;
                break;
            case "code":
                console.log("got code");
                this.mediaHTML = `
                    <code>${this.media.content}</code>
                `;
                break;
            case "markdown":
                console.log("got markdown");
                var contentStringEncoded = btoa(String.raw`${this.media.content}`);
                this.mediaHTML = `
                    <div class="markdownBlock relative">
                        <div>
                            ${marked.parse(this.media.content)}
                        </div>
                        <div class="copy-button absolute" style="top: 0; right: 0; margin: 1em;" data-raw-text="${contentStringEncoded}" onclick="copyMarkdown(this);">
                            <svg class="svg-text-dark" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><rect x="128" y="128" width="336" height="336" rx="57" ry="57" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32"/><path d="M383.5 128l.5-24a56.16 56.16 0 00-56-56H112a64.19 64.19 0 00-64 64v216a56.16 56.16 0 0056 56h24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></svg>
                        </div>
                    </div>
                `;
                break;
            case "latex":
                console.log("got latex");
                var output = document.createElement('div');
                output.textContent = this.media.content;
                MathJax.typesetPromise([output]);
                this.mediaHTML = `<div class="font-normal">${output.innerHTML}</div>`;
                output.remove();
                break;
            case "image":
                console.log("got image");
                this.mediaHTML = `
                    <img src="${this.media.content}" style="width: 100%; object-fit: contain;">
                `;
                break;
            case "video":
                console.log("got video");
                this.mediaHTML = `
                    <video width="100%" controls>
                        <source src="${this.media.content}" type="video/mp4">
                    </video>
                `;
                break;
            case "youtube":
                console.log("got youtube");
                this.mediaHTML = `
                    <iframe style="width: 100%; aspect-ratio: 16/9; max-width: 50vw;" src="https://www.youtube.com/embed/${this.media.content}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
                `;
                break;
            case "audio":
                console.log("got audio");
                this.mediaHTML = `
                    <audio style="width: 100%; max-width: 50vw;" src=${this.media.content} controls></audio>
                `;
                break;
            default:
                console.log(`ERROR: Invalid whiteboard media type ${this.media.type}`);
                return null;
        }
    }

    getJQObject() {
        return $(this.mediaHTML);
    }

    printMediaType() {
        console.log(`Media Type: ${this.media.type}`);
    }

    printMedia() {
        console.log(`Media: ${this.media.type}`);
    }
}

class Whiteboard {
    constructor() {
        this.itemGroups = [] // list of lists
    }

    addMediaGroup(whiteboardMediaGroup) { // list of WhiteboardContent objects
        console.log(`Adding media set: ${whiteboardMediaGroup}`);

        if (whiteboardMediaGroup && whiteboardMediaGroup.length > 0) {
            this.itemGroups.push(whiteboardMediaGroup);
            console.log("whiteboard content loaded")
        } else {
            alert("ERROR: Whiteboard content failed to load");
        }
    }

    refresh($whiteboard) {
        console.log("getting last one");

        $whiteboard.empty();
        console.log("emptied whiteboard");

        if (this.itemGroups.length > 0) {
            this.itemGroups[this.itemGroups.length - 1].forEach(item => {
                console.log(`appending item: ${item.media.type}`)
                $whiteboard.append(item.getJQObject());
            });

            // TODO: needs improvement
            // Highlight code elements
            console.log("highlighting code")
            const codeBlocks = document.querySelectorAll('pre code'); // pre code
            console.log(`codeBlocks: ${codeBlocks.length}`);
            codeBlocks.forEach((codeBlock) => {
                hljs.highlightElement(codeBlock);
            });

        } else {
            console.log("content array empty");
        }

        // console.log(`refreshed. history: ${JSON.stringify(this.itemGroups.map(item => item.media.type))}`);
    }

    printCurrent() {
        // console.log(`Current items: ${this.itemGroups[this.itemGroups.length - 1]}`)
    }

    printItems() {
        // console.log(`Whiteboard history (oldest first): ${this.items}`);
    }
}