import Link from "next/link";
import { useState, useEffect } from "react";
import { Button, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, TextField, Box } from "@mui/material";
import { Spinner } from "components";
import { Layout } from "components/users";
import { alertService, ticketsService } from "services";

export default Index;

function Index() {
  const [files, setFiles] = useState(null);
  const [content, setContent] = useState([]);
  const [uploadType, setUploadType] = useState('amadeus');
  const [textContent, setTextContent] = useState('');

  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  function readInput(e) {
    let input = e.target;
    const dt = new DataTransfer();
    if (input.files && input.files[0]) {
      for (let i = 0; i < input.files.length; i++) {
        let file = input.files[i];
        let fileName = file.name;
        let fi = fileName.split(".");
        let fls = fi.length;
        let fe = fi[fls - 1];
        if ((fls > 1 && fe.includes("M")) || months.includes(fe)) {
          dt.items.add(file);
        }
      }
      input.files = dt.files;
      setFiles(input.files);
    }

    const filePromises = Array.from(input.files).map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });
    })

    Promise.all(filePromises)
      .then(allFileContents => setContent(prev => [...prev, ...allFileContents]))
      .catch(err => alertService.error('Error reading files: ' + err));
  }

  function deleteItem(index) {
    const dt = new DataTransfer();
    const input = document.getElementById("filesInput");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (parseInt(index) !== i) {
        dt.items.add(file);
      }
    }

    input.files = dt.files;
    setFiles(input.files);
    //console.log(input.files);
  }

  function getFileName(f) {
    let nameL = f.name.length;
    let nameS = f.name;
    let nameF = "";
    if (nameL > 25) {
      nameS = f.name.substring(0, 20);
      nameF = "..." + f.name.substring(f.name.length - 4, f.name.length);
    }
    return nameS + nameF;
  }

  function onSubmit() {
    let uploadPromise;    
    const contentToUpload = uploadType === 'amadeus' ? content : (textContent ? [textContent] : content);
    if (contentToUpload.length === 0) {
        alertService.error("Please upload a file or enter text content.");
        return;
    }
    switch (uploadType) {
      case 'airarabia':
        uploadPromise = ticketsService.uploadAirArabia(contentToUpload);
        break;
      case 'wizzair':
        uploadPromise = ticketsService.uploadWizzAir(contentToUpload);
        break;
      case 'flixbus':
        uploadPromise = ticketsService.uploadFlixbus(contentToUpload);
        break;
      case 'amadeus':
      default:
        uploadPromise = ticketsService.upload(contentToUpload);
    }
    return uploadPromise.then((result) => {
        if (result && result.length > 0) {
          alertService.success("File(s) uploaded successfully", true);
          setFiles([]);
          setTextContent('');
          setContent([]);
        } else {
          alertService.error("No tickets were created. The file might be empty, in the wrong format, or this uploader isn't implemented yet.");
        }
      })
      .catch(error => alertService.error(error.message || error));
  }

  return (
    <Layout>
      <form id="uploadFile" method="POST" encType="multipart/form-data">
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">File Type</FormLabel>
          <RadioGroup
            row
            aria-label="upload-type"
            name="upload-type-group"
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value)}
          >
            <FormControlLabel value="amadeus" control={<Radio />} label="Amadeus" />
            <FormControlLabel value="airarabia" control={<Radio />} label="Air Arabia" />
            <FormControlLabel value="wizzair" control={<Radio />} label="Wizz Air" />
            <FormControlLabel value="flixbus" control={<Radio />} label="Flixbus" />
          </RadioGroup>
        </FormControl>
        {uploadType === 'amadeus' && (
          <div id="FileUpload">
            <div className="wrapper">
              <div className="image-upload-wrap">
                <input
                  id="filesInput"
                  className="file-upload-input"
                  type="file"
                  name="files[]"
                  accept=".M*"
                  multiple
                  onChange={(event) => {
                    readInput(event);
                  }}
                />
                <div className="drag-text">
                  <h3>Drag and drop files or click to upload</h3>
                </div>
              </div>
            </div>
            {files &&
              files.length > 0 &&
              Object.keys(files).map((f, i) => (
                <div key={i} className="uploaded">
                  <div className="file">
                    <div className="file__name">
                      <i className="fa fa-file delete"></i>
                      <p>{getFileName(files[i])}</p>
                      <i
                        className="fas fa-times delete"
                        onClick={() => deleteItem(i)}
                      ></i>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
        {uploadType !== 'amadeus' && (
            <Box sx={{ mt: 2 }}>
                <TextField
                    label="Paste Content Here"
                    multiline
                    rows={15}
                    fullWidth
                    variant="outlined"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                />
            </Box>
        )}
        <br></br>
      </form>
      <div id="filenames"></div>
      <Button
            variant="contained"            
            disabled={!(files && files.length > 0) && !textContent}
            color="primary"
            fullWidth
            onClick={onSubmit}
            sx={{ height: 50 }}
          >
            Upload
        </Button>
    </Layout>
  );
}
