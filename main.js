
/** @type {HTMLButtonElement} */
const imageButton = document.getElementById("add-image-button")
/** @type {HTMLInputElement} */
const imageInput = document.getElementById("image-input")
/** @type {HTMLDivElement} */
const imageSelect = document.getElementById("image-select")
/** @type {HTMLFormElement} */
const inputForm = document.getElementById("input-form")
/** @type {HTMLButtonElement} */
const downloadButton = document.getElementById("download-button")
/** @type {HTMLAnchorElement} */
const downloadLink = document.getElementById("download-link")

/**
 * Remove a file from the files list and remove it from the previews. File is
 * given by its index
 * @param {number} index The index of the file in the list
 */
function removeFile(index) {
    document.querySelector(`.image-preview:nth-child(${index})`).remove()
}

/**
 * Remove a file by referencing its preview element
 * @param {HTMLElement} elt The HTML element of the preview
 */
function removeFileFromElement(elt) {
    elt.remove()
}

/**
 * Add a file to the 
 * @param {File} file The file to add
 */
function addFile(file) {
    let blob = URL.createObjectURL(file)
    let preview = document.createElement("div")
    preview.classList.add("image-preview")
    let img = document.createElement("img")
    img.src = blob
    preview.appendChild(img)
    let closeButton = document.createElement("div")
    let closeIcon = document.createElement("span")
    closeIcon.innerText = "close"
    closeIcon.classList.add("material-symbols-outlined")
    closeButton.appendChild(closeIcon)
    closeButton.classList.add("close-button")
    closeButton.addEventListener("click", () => removeFileFromElement(preview))
    preview.appendChild(closeButton)
    imageSelect.appendChild(preview)
}

/**
 * Get all image elements from previews. These are used to draw onto a canvas
 * @returns {HTMLImageElement[]} The list of image elements
 */
function getImages() {
    return Array.from(document.querySelectorAll(".image-preview > img"))
}


/**
 * Concatenate images vertically
 * @param {HTMLImageElement[]} images The images to concatenate
 * @param {(image: HTMLImageElement) => any} handler The handler to call with
 * the resulting image once completed
*/
function concatImages(images, handler) {
    let canvas = document.createElement("canvas")
    let totalHeight = 0
    let maxWidth = 0
    for (const img of images) {
        totalHeight += img.naturalHeight
        maxWidth = Math.max(maxWidth, img.naturalWidth)
    }
    canvas.width = maxWidth
    canvas.height = totalHeight
    let h = 0
    for (const img of images) {
        canvas.getContext("2d").drawImage(img, 0, h)
        h += img.naturalHeight
    }
    let out = document.createElement("img")
    out.src = canvas.toDataURL("image/png")
    out.addEventListener("load", () => handler(out))
}

imageButton.addEventListener("click", () => imageInput.click())
imageInput.addEventListener("change", () => {
    for (let file of imageInput.files)
        addFile(file)
    inputForm.reset()
})

downloadButton.addEventListener("click", () => {
    let images = getImages()
    if (images.length == 0)
        return
    concatImages(images, (image) => {
        downloadLink.href = image.src
        downloadLink.click()
    })
})