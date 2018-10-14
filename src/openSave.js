import axios from 'axios'
import {CommandLog, Stack} from './model'

const currentFormat = 1;  // format saved by this code - increment when releasing incompatible changes

export default {
  openAction(context) {
    window.gapi.load('picker', function () {
      showPicker().then(function(file) {
        getFileContents(file.id).then(function(documentText) {
          context.commit('loadJson', {document: JSON.parse(documentText), file});
        })
        .catch(function(err) {
          console.log('file read error', err);
          store.state.currentFile.id = undefined;
        })
      }).catch(err=>{
        console.log('cancel')
      })
    });
  },
  openHttpAction(context, url) {
    let match = url.match(/[^/]+$/);
    let fileName = match ? match[0] : "Untitled";
    axios.get(url)
      .then(function (response) {
        context.commit('loadJson', {commandList: response.data, file: {name: fileName}});
      })
      .catch(function (error) {
        console.log('failed to load:', url, 'error:', error);
      })
  },
  loadJsonMutation(state, {document, file}) {
    let convertedDocument = convertFormat(currentFormat, document);
    state.commandLog = (new CommandLog()).load(convertedDocument.contents);
    state.currentFile = file;
    state.currentFile.origName = file.name;
  },
  saveMutation(state) {
    console.log('state.currentFile.origName',state.currentFile.origName);
    console.log('state.currentFile.name',state.currentFile.name);
    if (state.currentFile.id && state.currentFile.name === state.currentFile.origName) {
      console.log('saveFile');
      saveFile(state.currentFile.id, JSON.stringify({format: currentFormat, contents: state.commandLog.saveFormat()}, null, '  '))
      .then(function(file) {
        console.log('saved successfully', file);
      })
      .catch(function (error) {
        console.log('save error:', url, 'error:', error);
      });
    } else {
      console.log('createFile');
      state.currentFile.origName = state.currentFile.name;
      createFile(state.currentFile.name, JSON.stringify({format: currentFormat, contents: state.commandLog.saveFormat()}, null, '  '))
      .then(function(file) {

        state.currentFile.id = file.id;
        console.log('created successfully', file);
      });
    }
  }
}

function saveFile(id, data) {
  return writeFile({id, method: 'PATCH'}, data)
}

function createFile(name, data) {
  return writeFile({name, method: 'POST'}, data)
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

// each function converts fromitoj returns a document in format j
const formatConverters = {
  from0to1(fromFormat, toFormat, document) {
    console.log('from0to1(', fromFormat, ', ', toFormat, ', ', document, ')');
    let newCommands = [];
    document.contents.forEach(function(command) {
      if (command.id === 'align' && command.params.x != undefined) {
        // change align params to new style
        // params was x, y, z
        // x was none: 0, left of: 1, left: 2, center: 3, right: 4, right of: 5
        // is x0, y0, z0, x1, y1, z1
        // x0 is none: 0, left: 1, center: 2, right: 3
        let newParams = {};
        ['x', 'y', 'z'].forEach(function(axis) {
          let fromV = command.params[axis];
          newParams[axis + '0'] = [0, 3, 1, 2, 3, 1][fromV];
          newParams[axis + '1'] = [0, 1, 1, 2, 3, 3][fromV];
        });
        command.params = newParams;
        newCommands.push(command);
      } else if (command.id === 'center') {
        // replace center command with align
        newCommands.push({id: 'align', params: {x0: 2, y0: 2, z0: 2}});
      } else {
        newCommands.push(command);
      }
    });
    return {format: toFormat, contents: newCommands};
  }
}

// returns document converted to toFormat
function convertFormat(targetFormat, document) {

  if (document.constructor === Array) {
    // document is before format was introduced, and was just a list of commands.
    // make it conform to current structure
    document = {format: 0, contents: document};
  }
  if (targetFormat < document.format) {
    throw `document is not yet supported by this application (document format is ${document.format}, app supports up to ${targetFormat})`
  }

  let fromFormat = document.format;
  let toFormat = fromFormat + 1;
  while (fromFormat < targetFormat) {
    let converter = formatConverters['from' + fromFormat + 'to' + (fromFormat + 1)];
    if (converter) {
      document = converter(fromFormat, toFormat, document);
      console.log('converter():', document);
    } else {
      throw `cannot convert from ${fromFormat} to ${toFormat})`
    }
    fromFormat++;
    toFormat++;
  }
  return document;
}
