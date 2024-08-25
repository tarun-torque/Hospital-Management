import jsdom from jsdom
const {JSDOM} = jsdom

 const extractContent = (htmlContent) =>{
    const dom =  new JSDOM(htmlContent)
    const document = dom.wimndow.document

    const heading = {}
    for(let i=1;i<=6;i++){
              const headingELement = document.querySelectorAll(`h1${i}`)
              heading[`${i}`] = Array.from(headingELement).map(heading=>heading.textContent.trim())
    }

    const paragraph = Array.from(document.querySelectorAll('p')).map(p=>p.textContent.trim())
    const image = Array.from(document.querySelectorAll('img')).map(img=>img.src)

    return {
        heading,paragraph,image
    }
}

export default extractContent