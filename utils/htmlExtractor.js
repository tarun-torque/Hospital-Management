import jsdom from 'jsdom';
const { JSDOM } = jsdom;

const extractContent = (htmlContent) => {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    const headings = {};
    for (let i = 1; i <= 6; i++) {
        // Correct the selector to 'h' + i instead of 'h1' + i
        const headingElements = document.querySelectorAll(`h${i}`);
        headings[`${i}`] = Array.from(headingElements).map(heading => heading.textContent.trim());
    }

    const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.textContent.trim());
    const images = Array.from(document.querySelectorAll('img')).map(img => img.src);

    // Log intermediate results for debugging
    console.log('Headings:', headings);
    console.log('Paragraphs:', paragraphs);
    console.log('Images:', images);

    return {
        headings,
        paragraphs,
        images
    };
}

export default extractContent;
