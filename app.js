const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const app = express();

// Set up Google API client with OAuth2
const oauth2Client = new google.auth.OAuth2(
  '746239575955-c4d2o1ahg4ts6ahm3a5lh5lp9g8m15h4.apps.googleusercontent.com', // Client ID
  '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', // Client Secret
  'http://localhost:3000/oauth2callback' // Redirect URI
);

// Set the refresh token to authenticate the user
oauth2Client.setCredentials({
  refresh_token: '1//0e7iYUalM5eVBCgYIARAAGA4SNwF-L9IrrTLZurPtMntZtolhBGWg2cmCM2QOyNbeXh5GyEPe4EvpqGau9Bk4wbSHpNxVjDN_f94'
});

// Initialize Google Drive API
const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route to show Google Drive folders
app.get('/', async (req, res) => {
  try {
    // Fetch folders from Google Drive
    const response = await drive.files.list({
      pageSize: 100, // You can increase the pageSize or handle pagination for more results
      fields: 'files(id, name, mimeType)', // Fields to retrieve (id, name, mimeType)
      q: "mimeType='application/vnd.google-apps.folder'", // Filter to show only folders
    });

    const folders = response.data.files;

    // HTML and CSS for the index page
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Google Drive Folders</title>

          <!-- Google Fonts -->
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">

          <!-- FontAwesome for icons -->
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

          <!-- Custom CSS for styling -->
          <style>
              body {
                  font-family: 'Roboto', sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f7fc;
                  color: #333;
              }

              header {
                  background-color: #4CAF50;
                  color: white;
                  padding: 10px 20px;
                  text-align: center;
              }

              h1 {
                  margin: 0;
                  font-size: 2.5rem;
              }

              .container {
                  display: flex;
                  flex-wrap: wrap;
                  justify-content: center;
                  gap: 20px;
                  margin-top: 30px;
                  padding: 0 20px;
              }

              .folder-card {
                  background-color: white;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  width: 250px;
                  padding: 20px;
                  text-align: center;
                  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                  transition: transform 0.2s ease;
              }

              .folder-card:hover {
                  transform: translateY(-10px);
              }

              .folder-icon {
                  font-size: 40px;
                  color: #4CAF50;
                  margin-bottom: 15px;
              }

              .folder-name {
                  font-size: 1.1rem;
                  font-weight: 500;
                  margin-bottom: 15px;
              }

              .folder-actions {
                  display: flex;
                  justify-content: center;
              }

              .folder-actions a {
                  text-decoration: none;
                  color: #4CAF50;
                  font-size: 18px;
                  font-weight: 500;
                  padding: 5px 10px;
                  border: 2px solid #4CAF50;
                  border-radius: 5px;
                  transition: background-color 0.3s ease;
              }

              .folder-actions a:hover {
                  background-color: #4CAF50;
                  color: white;
              }

              .no-folders {
                  font-size: 1.2rem;
                  color: #888;
                  margin-top: 20px;
                  text-align: center;
              }
          </style>
      </head>
      <body>
          <header>
              <h1>Google Drive Folders</h1>
          </header>

          <div class="container">
              ${folders.length > 0 ? folders.map(folder => `
                  <div class="folder-card">
                      <div class="folder-icon">
                          <i class="fas fa-folder"></i>
                      </div>
                      <div class="folder-name">
                          ${folder.name}
                      </div>
                      <div class="folder-actions">
                          <a href="/folder/${folder.id}">
                              <i class="fas fa-folder-open"></i> Open
                          </a>
                      </div>
                  </div>
              `).join('') : `<div class="no-folders">No folders found in your Google Drive.</div>`}
          </div>
      </body>
      </html>
    `;
    
    res.send(html);
  } catch (err) {
    console.error('Error retrieving folders:', err);
    res.status(500).send('Error retrieving folders');
  }
});

// Route to open a folder (list files inside)
app.get('/folder/:id', async (req, res) => {
  try {
    const folderId = req.params.id;
    const response = await drive.files.list({
      q: `'${folderId}' in parents`, // Fetch files in the specific folder
      fields: 'files(id, name)',
    });

    const filesInFolder = response.data.files;

    // HTML and CSS for folder contents
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Folder Contents</title>

          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
          <style>
              body {
                  font-family: 'Roboto', sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f7fc;
                  color: #333;
              }

              header {
                  background-color: #4CAF50;
                  color: white;
                  padding: 10px 20px;
                  text-align: center;
              }

              .container {
                  display: flex;
                  flex-wrap: wrap;
                  justify-content: center;
                  gap: 20px;
                  margin-top: 30px;
                  padding: 0 20px;
              }

              .file-card {
                  background-color: white;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  width: 250px;
                  padding: 20px;
                  text-align: center;
                  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                  transition: transform 0.2s ease;
              }

              .file-card:hover {
                  transform: translateY(-10px);
              }

              .file-icon {
                  font-size: 40px;
                  color: #4CAF50;
                  margin-bottom: 15px;
              }

              .file-name {
                  font-size: 1.1rem;
                  font-weight: 500;
                  margin-bottom: 15px;
              }

              .file-actions {
                  display: flex;
                  justify-content: center;
              }

              .file-actions a {
                  text-decoration: none;
                  color: #4CAF50;
                  font-size: 18px;
                  font-weight: 500;
                  padding: 5px 10px;
                  border: 2px solid #4CAF50;
                  border-radius: 5px;
                  transition: background-color 0.3s ease;
              }

              .file-actions a:hover {
                  background-color: #4CAF50;
                  color: white;
              }

              .no-files {
                  font-size: 1.2rem;
                  color: #888;
                  margin-top: 20px;
                  text-align: center;
              }
          </style>
      </head>
      <body>
          <header>
              <h1>Files in Folder</h1>
          </header>

          <div class="container">
              ${filesInFolder.length > 0 ? filesInFolder.map(file => `
                  <div class="file-card">
                      <div class="file-icon">
                          <i class="fas fa-file"></i>
                      </div>
                      <div class="file-name">
                          ${file.name}
                      </div>
                      <div class="file-actions">
                          <a href="https://drive.google.com/uc?export=download&id=${file.id}">
                              <i class="fas fa-download"></i> Download
                          </a>
                      </div>
                  </div>
              `).join('') : `<div class="no-files">No files found in this folder.</div>`}
          </div>
      </body>
      </html>
    `;
    
    res.send(html);
  } catch (err) {
    console.error('Error retrieving files:', err);
    res.status(500).send('Error retrieving files');
  }
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
