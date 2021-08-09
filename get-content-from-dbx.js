require('dotenv').config();

const Dropbox = require('dropbox').Dropbox;
const dbx = new Dropbox({ accessToken: process.env.DBX_ACCESS_TOKEN });
const path = require('path');
const fs = require('fs-extra');
const content_dir = path.resolve(__dirname, process.env.CONTENT_DIR);
const files = [];

// clears current content dir, every build it fetches fresh
fs.removeSync(content_dir);
fs.ensureDirSync(content_dir);

// Get a list of all files, save to an array
dbx.filesListFolder({ path: '' })
    .then(response => {
        response.result.entries.forEach(content => {
            if (content.is_downloadable && content['.tag'] == 'file') {
                dbx.filesDownload({ path: content.path_lower })
                    .then(data => {
                        const filename = path.resolve(content_dir, data.result.name)
                        const filecontents = data.result.fileBinary

                        fs.outputFile(filename, filecontents)
                            .catch(error => {
                                if (error) {
                                    return console.log('outputFile 💔', data.result.name, error)
                                }
                            })
                    }).catch(error => {
                        console.log('filesDownload 💔', error);
                    })
            }
        })
    })
    .catch(error => {
        console.log('filesListFolder 💔', error);
    });
