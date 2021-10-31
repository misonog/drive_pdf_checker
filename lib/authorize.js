const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly']
const TOKEN_PATH = 'token.json'

async function generateOAuthClient (credentialFilePath) {
  const credentials = JSON.parse(fs.readFileSync(credentialFilePath))
  const { client_secret, client_id, redirect_uris } = credentials.installed // eslint-disable-line camelcase
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

  if (!fs.existsSync(TOKEN_PATH)) {
    return await generateAccessToken(oAuth2Client)
  } else {
    const token = fs.readFileSync(TOKEN_PATH)
    oAuth2Client.setCredentials(JSON.parse(token))

    return oAuth2Client
  }
}

function generateAccessToken (oAuth2Client) {
  return new Promise(resolve => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    })

    console.log('Authorize this app by visiting this url:', authUrl)
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question('Enter the code from that page here: ', code => {
      rl.close()
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err)
        oAuth2Client.setCredentials(token)
        resolve(oAuth2Client)
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err)
          console.log('Token stored to', TOKEN_PATH)
        })
      })
    })
  })
}

module.exports.generateOAuthClient = generateOAuthClient
