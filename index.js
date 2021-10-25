#! /usr/bin/env node

const fs = require('fs')
const readline = require('readline')
const { program } = require('commander')
const { google } = require('googleapis')

program
  .requiredOption('-t, --target <url>', 'Target URL')
  .requiredOption('-c, --credential <path>', 'Authorization credentials')
  .parse()

const options = program.opts()
const fileURL = options.target
const fileID = toFileID(fileURL)
const credentialFilePath = options.credential

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json'

if (fileID) {
  // Load client secrets from a local file.
  fs.readFile(credentialFilePath, (err, content) => {
    if (err) return console.log('Error loading client secret file:', err)
    // Authorize a client with credentials, then call the Google Drive API.
    try {
      authorize(JSON.parse(content), outputMimeTypeCheckResult)
    } catch (err) {
      console.error(err.message)
    }
  })
}

/**
 * Extracting file ID from URL.
 * @param {string} fileURL The URL of the Google Drive file to target
 * @return {string} file ID
 */
function toFileID (fileURL) {
  try {
    if (!/drive.google.com/.test(fileURL)) throw new Error(`Error: ${fileURL} is not a Google Drive URL.`)
    const driveURL = new URL(fileURL)
    const driveURLPathnames = driveURL.pathname.split('/')
    return driveURLPathnames[driveURLPathnames.length - 1]
  } catch (err) {
    console.error(err.message)
  }
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize (credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed // eslint-disable-line camelcase
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0])

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback)
    oAuth2Client.setCredentials(JSON.parse(token))
    callback(oAuth2Client, fileID)
  })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken (oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  })
  console.log('Authorize this app by visiting this url:', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close()
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err)
      oAuth2Client.setCredentials(token)
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err)
        console.log('Token stored to', TOKEN_PATH)
      })
      callback(oAuth2Client, fileID)
    })
  })
}

/**
 * Output a message depending on whether the metadata is PDF or not.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} fileID
 */
async function outputMimeTypeCheckResult (auth, fileID) {
  const metadata = await retrieveFileMetadata(auth, fileID)
  if (metadata.mimeType !== 'application/pdf') {
    console.log('The given file is not PDF')
  }
}

/**
 * Return the metadata of the file specified by fileID.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} fileID The fileID to get Drive file metadata.
 */
async function retrieveFileMetadata (auth, fileID) {
  const drive = google.drive({ version: 'v3', auth })
  const res = await drive.files.get({ fileId: fileID })
  return res.data
}
