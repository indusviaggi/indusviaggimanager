import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { Spinner } from "components";
import { Layout } from "components/users";
import { alertService, ticketsService } from "services";

export default Index;

function Index() {
  const [files, setFiles] = useState(null);
  const [content, setContent] = useState([]);

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

    const data = [...content];
    Object.keys(input.files).map((f, i) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        data.push(text);
        setContent(data);
      };
      reader.readAsText(e.target.files[i]);
    });
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
    return ticketsService
      .upload(content)
      .then(() => {
        alertService.success("File(s) uploaded successfully", true);
        setFiles([]);
        setContent([]);
      })
      .catch(alertService.error);
  }

  return (
    <Layout>
      <form id="uploadFile" method="POST" encType="multipart/form-data">
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
      </form>
      <div id="filenames"></div>
      <Button
            variant="contained"
            disabled={!files || files.length <= 0}
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
