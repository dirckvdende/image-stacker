
const inputField = document.getElementById("image-input")

function concatImages(images) {
    let canvas = document.createElement("canvas")
    let totalHeight = 0
    let maxWidth = 0
    for (const img of images) {
        totalHeight += img.height
        maxWidth = Math.max(maxWidth, img.width)
    }
    canvas.width = maxWidth
    canvas.height = totalHeight
    let h = 0
    for (const img of images) {
        canvas.getContext("2d").drawImage(img, 0, h)
        h += img.height
    }
    let out = document.createElement("img")
    out.src = canvas.toDataURL("image/png")
    return out
}

function getSelectedImages(handle) {
    let images = []
    for (const file of inputField.files) {
        let obj = URL.createObjectURL(file)
        let img = document.createElement("img")
        img.src = obj
        images.push(img)
    }
    let count = images.length
    for (const file of images) {
        file.addEventListener("load", () => {
            count--
            if (count <= 0)
                handle(images)
        })
    }
}

inputField.addEventListener("change", () => {
    getSelectedImages((images) => {
        let c = concatImages(images)
        document.getElementById("output").src = c.src
    })
})