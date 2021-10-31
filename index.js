#! /usr/bin/env node

const { program } = require('commander')
const { generateOAuthClient } = require('./lib/authorize')
const { toFileID, retrieveFileMetadata } = require('./lib/google_drive_utils')

program
  .requiredOption('-t, --target <url>', 'Target URL')
  .requiredOption('-c, --credential <path>', 'Authorization credentials')
  .parse()

function main () {
  const options = program.opts()
  const fileURL = options.target
  const fileID = toFileID(fileURL)
  const credentialFilePath = options.credential

  generateOAuthClient(credentialFilePath)
    .then(auth => retrieveFileMetadata(auth, fileID))
    .then(metadata => {
      if (metadata.mimeType !== 'application/pdf') {
        console.log('The given file is not PDF')
      }
    })
}

main()
