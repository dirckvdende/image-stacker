
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

/** @type {HTMLSelectElement} */
const formatSelect = document.getElementById("format-select")
/** @type {HTMLSelectElement} */
const directionSelect = document.getElementById("direction-select")
/** @type {HTMLSelectElement} */
const scaleSelect = document.getElementById("scale-select")

/** Loaded files of images. Not used for actual generation @type {File[]} */
let files = []

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
 * Get the set output format. If this is set to auto return the automatically
 * selected format (format of the first image)
 * @returns The output format to use
 */
function getOutputFormat() {
    if (formatSelect.value == "auto") {
        if (files.length == 0)
            return "image/png"
        return files[0].type
    }
    return formatSelect.value
}

/**
 * Get the target size of each image if they are scaled to the width/height of
 * the first image (or not scaled at all)
 * @param {HTMLImageElement[]} images The images to get the target sizes of
 * @param {"none" | "width" | "height"} scaleTo What to scale to (of the first
 * image)
 * @returns {{width: number, height: number}[]} The target size for each image
 */
function targetSizes(images, scaleTo) {
    let sizes = []
    for (let image of images) {
        if (sizes.length == 0 || scaleTo == "none") {
            sizes.push({
                width: image.naturalWidth,
                height: image.naturalHeight
            })
        } else if (scaleTo == "width") {
            sizes.push({
                width: sizes[0].width,
                height: Math.floor(image.naturalHeight * sizes[0].width /
                image.naturalWidth)
            })
        } else {
            sizes.push({
                width: Math.floor(image.naturalWidth * sizes[0].height /
                image.naturalHeight),
                height: sizes[0].height
            })
        }
    }
    return sizes
}

/**
 * Concatenate images vertically by drawing to the given canvas
 * @param {HTMLImageElement[]} images The image to draw
 * @param {HTMLCanvasElement} canvas The canvas to draw the images on
 * @param {boolean} scaleToFirst Wether to rescale images to the width of the
 * first image
 */
function drawVertical(images, canvas, scaleToFirst) {
    let sizes = targetSizes(images, scaleToFirst ? "width" : "none")
    let totalHeight = 0
    let maxWidth = 0
    for (const size of sizes) {
        totalHeight += size.height
        maxWidth = Math.max(maxWidth, size.width)
    }
    canvas.width = maxWidth
    canvas.height = totalHeight
    let y = 0
    for (let i = 0; i < sizes.length; i++) {
        let img = images[i]
        let size = sizes[i]
        let x = Math.floor((maxWidth - size.width) / 2)
        canvas.getContext("2d").drawImage(img, 0, 0, img.naturalWidth,
        img.naturalHeight, x, y, size.width, size.height)
        y += size.height
    }
}

/**
 * Concatenate images horizontally by drawing to the given canvas
 * @param {HTMLImageElement[]} images The image to draw
 * @param {HTMLCanvasElement} canvas The canvas to draw the images on
 * @param {boolean} scaleToFirst Wether to rescale images to the height of the
 * first image
 */
function drawHorizontal(images, canvas, scaleToFirst) {
    let sizes = targetSizes(images, scaleToFirst ? "height" : "none")
    let totalWidth = 0
    let maxHeight = 0
    for (const size of sizes) {
        totalWidth += size.width
        maxHeight = Math.max(maxHeight, size.height)
    }
    canvas.width = totalWidth
    canvas.height = maxHeight
    let x = 0
    for (let i = 0; i < sizes.length; i++) {
        let img = images[i]
        let size = sizes[i]
        let y = Math.floor((maxHeight - size.height) / 2)
        canvas.getContext("2d").drawImage(img, 0, 0, img.naturalWidth,
        img.naturalHeight, x, y, size.width, size.height)
        x += size.width
    }
}

/**
 * Concatenate images vertically
 * @param {HTMLImageElement[]} images The images to concatenate
 * @param {(image: HTMLImageElement) => any} handler The handler to call with
 * the resulting image once completed
*/
function concatImages(images, handler) {
    let canvas = document.createElement("canvas")
    let scaleToFirst = scaleSelect.value == "first"
    if (directionSelect.value == "vertical")
        drawVertical(images, canvas, scaleToFirst)
    else
        drawHorizontal(images, canvas, scaleToFirst)
    let out = document.createElement("img")
    out.src = canvas.toDataURL(getOutputFormat())
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