import store from './store';

export default {
  open() {
    window.gapi.load('picker', function () {
      console.log('picker load finished.')
      showPicker().then(function(file) {
        console.log('picked file', file);
        getFileContents(file.id).then(function(contents) {
          console.log('contents', contents);
          store.state.commandLog = store.state.commandLog.load(JSON.parse(contents));
          store.state.currentFile = file;
        })
        .catch(function(err) {
          console.log('file read error', err);
          store.state.currentFile.id = undefined;
        })
      }).catch(err=>{console.log('cancel')})
    });
  },
  save() {
    if (store.state.currentFile.id) {
      saveFile(store.state.currentFile.id, JSON.stringify(store.state.commandLog.saveFormat(), null, '  '))
      .then(function(file) {
        console.log(file);
      });
    } else {
      createFile(store.state.currentFile.name, JSON.stringify(store.state.commandLog.saveFormat(), null, '  '))
      .then(function(file) {
        console.log(file);
      });
    }
  }
}

function saveFile(id, data) {
  console.log('saveFile');
  return writeFile({id, method: 'PATCH'}, data)
}

function createFile(name, data) {
  console.log('createFile');
  return writeFile({name, method: 'POST'}, data)
  .then(function(file) {
    store.state.currentFile.id = file.id;
    return file
  })
}

function writeFile(options, data) {
  return new Promise(
    (resolve, reject) => {
      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";

      const contentType = 'application/json';

      var metadata = {
        'name': options.name,
        'mimeType': contentType
      };

      var multipartRequestBody =
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          'Content-Type: ' + contentType + '\r\n\r\n' +
          data +
          close_delim;

      var request = gapi.client.request({
          'path': options.id ? '/upload/drive/v3/files/' + encodeURIComponent(options.id) : '/upload/drive/v3/files',
          'method': options.method,
          'params': {'uploadType': 'multipart'},
          'headers': {
            'Content-Type': 'multipart/related; boundary="' + boundary + '"'
          },
          'body': multipartRequestBody});

      request.execute(resolve);
    })
};

function showPicker() {
  return new Promise((resolve, reject) => {
      var view = new google.picker.DocsView(google.picker.ViewId.DOCS)
      view.setMimeTypes('application/json')
      view.setSelectFolderEnabled(false)
      view.setIncludeFolders(true)
      var picker = new google.picker.PickerBuilder()
        .setAppId(process.env.APPLICATION_ID)
        .setOAuthToken(gapi.auth.getToken().access_token)
        .addView(view)
        .setCallback(function (data) {
          if (data.action === 'picked') {
            resolve(data.docs[0])
          } else if (data.action === 'cancel') {
            reject('cancel')
          }
        })
        .build()
      picker.setVisible(true)
    })
  };

  function getFileContents(fileId) {
    return new Promise(
      (resolve, reject) => {
        gapi.client.request({
          'path': '/drive/v2/files/' + fileId,
          'method': 'GET',
          callback: function ( theResponseJS, theResponseTXT ) {
            var myToken = gapi.auth.getToken();
          	var myXHR   = new XMLHttpRequest();
            myXHR.open('GET', theResponseJS.downloadUrl, true );
            myXHR.setRequestHeader('Authorization', 'Bearer ' + myToken.access_token );
            myXHR.onreadystatechange = function( theProgressEvent ) {
              if (myXHR.readyState == 4) {
                if ( myXHR.status == 200 ) {
                	resolve(myXHR.response)
                } else {
                  reject(myXHR.status)
                }
              }
            }
            myXHR.send();
          }
        });
      }
    )
  }
