module.exports = function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy('./src/css');
    eleventyConfig.addPassthroughCopy('./src/img');
    eleventyConfig.addPassthroughCopy("./src/dbx/*.*");

    return {
        passthroughFileCopy: true,
        markdownTemplateEngine: "njk",
        templateFormats: ["html", "njk", "md"],
        dir: {
            input: "src"
        },
    }
}