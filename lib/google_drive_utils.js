const { google } = require('googleapis')

function toFileID (fileURL) {
  if (!/https:\/\/drive\.google\.com/.test(fileURL)) throw new Error(`Error: ${fileURL} is not a Google Drive URL.`)
  const driveURL = new URL(fileURL)

  // 以下からfileIDにマッチする正規表現を活用
  // https://stackoverflow.com/questions/16840038/easiest-way-to-get-file-id-from-url-on-google-apps-script
  const re = /[-\w]{25,}/
  return re.exec(driveURL.pathname)[0]
}

async function retrieveFileMetadata (auth, fileID) {
  const drive = google.drive({ version: 'v3', auth })
  const res = await drive.files.get({ fileId: fileID })
  return res.data
}

module.exports = {
  toFileID: toFileID,
  retrieveFileMetadata: retrieveFileMetadata
}
