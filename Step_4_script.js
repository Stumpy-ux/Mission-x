/* ====== Coded By Emily ====== */

/* =========================================================
Elements
========================================================= */

const fileInputContainer=document.getElementById("fileInputContainer");
const emptyState=document.getElementById("emptyState");
const fileStatusContainer=document.getElementById("fileStatusContainer");
const fileStatus=document.querySelector(".file-status");

const fileStateTemplate=document.getElementById("fileState");
const failedStateTemplate=document.getElementById("failedState");
const uploadedStateTemplate=document.getElementById("uploadedState");

const cameraInput=document.getElementById("cameraInput");
const photoInput=document.getElementById("photoInput");
const fileInput=document.getElementById("fileInput");

const takePhotoButton=document.getElementById("takePhotoButton");
const attachPhotoButton=document.getElementById("attachPhotoButton");
const attachFileButton=document.getElementById("attachFileButton");

const attachedButton=document.querySelector(".attached-button");
const failedButton=document.querySelector(".failed-button");

const attachedCount=document.getElementById("attachedCount");
const failedCount=document.getElementById("failedCount");

const nextButton = document.getElementById("nextButton");


/* =========================================================
State
========================================================= */

const selectedFiles=[];
const maxSize=10*1024*1024;
let activeFilter="all";


/* =========================================================
LocalStorage
========================================================= */

const STORAGE_KEY="fixitUploadedFiles";

function getStoredFiles(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY))||[];
  }catch(error){
    console.error("Unable to read uploaded files:",error);
    return [];
  }
}

function saveStoredFiles(files){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(files));
}

/* function saveUploadedFile(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();

    reader.onload=()=>{
      const storedFiles=getStoredFiles();

      const uploadedFile={
        id:`${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name:file.name,
        type:file.type,
        size:file.size,
        data:reader.result,
        uploadedAt:new Date().toISOString()
      };

      storedFiles.push(uploadedFile);
      saveStoredFiles(storedFiles);
      resolve(uploadedFile);
    };

    reader.onerror=()=>reject(reader.error);
    reader.readAsDataURL(file);
  });
} */ /* bug found - photos will be too big for phone as staored as text in local storage -- si shrinking them 1st - Iain */
function shrinkImage(dataUrl,type){
  if(!type.startsWith("image/"))return Promise.resolve(dataUrl);
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      const scale=Math.min(1,1000/Math.max(img.width,img.height));
      const canvas=document.createElement("canvas");
      canvas.width=Math.round(img.width*scale);
      canvas.height=Math.round(img.height*scale);
      canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
      resolve(canvas.toDataURL("image/jpeg",0.7));
    };
    img.onerror=()=>resolve(dataUrl);
    img.src=dataUrl;
  });
}

function saveUploadedFile(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();

    reader.onload=async()=>{
      try{
        const storedFiles=getStoredFiles();

        const uploadedFile={
          id:`${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name:file.name,
          type:file.type,
          size:file.size,
          data:await shrinkImage(reader.result,file.type),
          uploadedAt:new Date().toISOString()
        };

        storedFiles.push(uploadedFile);
        saveStoredFiles(storedFiles);
        resolve(uploadedFile);
      }catch(error){
        reject(error);
      }
    };

    reader.onerror=()=>reject(reader.error);
    reader.readAsDataURL(file);
  });
}
function removeStoredFile(fileId){
  const storedFiles=getStoredFiles();
  saveStoredFiles(storedFiles.filter(file=>file.id!==fileId));
}


/* =========================================================
Open File Pickers
========================================================= */

takePhotoButton.addEventListener("click",()=>cameraInput.click());
attachPhotoButton.addEventListener("click",()=>photoInput.click());
attachFileButton.addEventListener("click",()=>fileInput.click());


/* =========================================================
File Input Change
========================================================= */

cameraInput.addEventListener("change",event=>{
  handleFiles(event.target.files);
  clearFileInputs();
});

photoInput.addEventListener("change",event=>{
  handleFiles(event.target.files);
  clearFileInputs();
});

fileInput.addEventListener("change",event=>{
  handleFiles(event.target.files);
  clearFileInputs();
});


/* =========================================================
Handle Files
========================================================= */

function handleFiles(files){
  if(!files||files.length===0)return;

  Array.from(files).forEach(file=>addFile(file));
  updateUI();
  applyFilter();
}


/* =========================================================
Add File
========================================================= */

function addFile(file){
  selectedFiles.push(file);

  const isFailed=file.size>maxSize;
  const card=isFailed?createFailedCard(file):createReadyCard(file);

  fileStatus.appendChild(card);

  if(!isFailed)simulateUpload(card);
}


/* =========================================================
Create Ready Card
========================================================= */

function createReadyCard(file){
  const card=fileStateTemplate.cloneNode(true);

  card.removeAttribute("id");
  card.classList.add("generated-file-card");
  card.dataset.fileType="attached";
  card._file=file;

  const preview=card.querySelector(".file-preview");
  const fileName=card.querySelector(".file-name");
  const uploadStatus=card.querySelector("#uploadStatus");
  const progressPercent=card.querySelector(".progress-percent");
  const removeButton=card.querySelector(".remove-button");

  if(uploadStatus)uploadStatus.removeAttribute("id");

  fileName.textContent=file.name;
  progressPercent.textContent="0%";
  setFilePreview(file,preview);

  removeButton.addEventListener("click",()=>removeFile(file,card));

  card.hidden=false;
  return card;
}


/* =========================================================
Simulate Upload
========================================================= */

function simulateUpload(card){
  const progressPercent=card.querySelector(".progress-percent");
  const uploadStatus=card.querySelector(".upload-status");

  let progress=0;

  const interval=setInterval(async()=>{
    if(!card.isConnected){
      clearInterval(interval);
      return;
    }

    progress+=10;
    if(progress>100)progress=100;

    progressPercent.textContent=`${progress}%`;

    if(progress>=100){
      clearInterval(interval);

      try{
        const storedFile=await saveUploadedFile(card._file);

        const uploadedCard=createUploadedCard(
          card._file,
          storedFile.id
        );

        card.replaceWith(uploadedCard);

        updateUI();
        applyFilter();

      }catch(error){
        console.error("Upload failed:",error);
        uploadStatus.textContent="Upload failed";
      }
    }
  },200);

  card._uploadInterval=interval;
}


/* =========================================================
Create Uploaded Card
========================================================= */

function createUploadedCard(file,storedFileId){
  const card=uploadedStateTemplate.cloneNode(true);

  card.removeAttribute("id");
  card.classList.add("generated-file-card");
  card.dataset.fileType="attached";
  card._file=file;
  card._storedFileId=storedFileId;

  const preview=card.querySelector(".file-preview");
  const fileName=card.querySelector(".file-name");
  const status=card.querySelector("#uploadedStatus");
  const previewButton=card.querySelector(".action-button");
  const removeButton=card.querySelector("#uploadedRemoveButton");

  if(status)status.removeAttribute("id");
  if(previewButton)previewButton.removeAttribute("id");
  if(removeButton)removeButton.removeAttribute("id");

  fileName.textContent=file.name;
  setFilePreview(file,preview);

  if(previewButton){
    previewButton.addEventListener("click",()=>{
      const storedFile=getStoredFiles().find(
        item=>item.id===storedFileId
      );

      if(!storedFile){
        console.error("Uploaded file not found.");
        return;
      }

      if(!storedFile.type.startsWith("image/")){
        console.log("Preview is only available for images.");
        return;
      }

      const newWindow=window.open("","_blank");

      if(!newWindow){
        console.error("Popup was blocked.");
        return;
      }

      const image=newWindow.document.createElement("img");

      image.src=storedFile.data;
      image.alt=storedFile.name;
      image.style.maxWidth="100%";
      image.style.maxHeight="90vh";
      image.style.objectFit="contain";

      newWindow.document.body.style.margin="0";
      newWindow.document.body.style.padding="20px";
      newWindow.document.body.style.display="flex";
      newWindow.document.body.style.justifyContent="center";
      newWindow.document.body.style.alignItems="center";
      newWindow.document.body.style.minHeight="100vh";
      newWindow.document.body.style.boxSizing="border-box";

      newWindow.document.body.appendChild(image);
    });
  }

  removeButton.addEventListener("click",()=>{
    removeStoredFile(storedFileId);
    removeFile(file,card);
  });

  card.hidden=false;
  return card;
}


/* =========================================================
Create Failed Card
========================================================= */

function createFailedCard(file){
  const card=failedStateTemplate.cloneNode(true);

  card.removeAttribute("id");
  card.classList.add("generated-file-card");
  card.dataset.fileType="failed";
  card._file=file;

  const preview=card.querySelector(".file-preview");
  const fileName=card.querySelector(".file-name");
  const status=card.querySelector("#failedStatus");
  const removeButton=card.querySelector(".remove-button");

  if(status)status.removeAttribute("id");

  fileName.textContent=file.name;
  setFilePreview(file,preview);

  removeButton.addEventListener("click",()=>removeFile(file,card));

  card.hidden=false;
  return card;
}


/* =========================================================
File Preview
========================================================= */

function setFilePreview(file,previewElement){
  if(!file.type.startsWith("image/")){
    previewElement.src="assets/photo-placeholder.svg";
    return;
  }

  const imageURL=URL.createObjectURL(file);
  previewElement.src=imageURL;

  previewElement.onload=()=>URL.revokeObjectURL(imageURL);
}


/* =========================================================
Remove File
========================================================= */

function removeFile(file,card){
  if(card._uploadInterval){
    clearInterval(card._uploadInterval);
  }

  const index=selectedFiles.indexOf(file);

  if(index!==-1)selectedFiles.splice(index,1);

  card.remove();

  updateUI();
  applyFilter();

  if(selectedFiles.length===0)resetFileState();
}


/* =========================================================
Update UI
========================================================= */

function updateUI(){
  const attached=selectedFiles.filter(
    file=>file.size<=maxSize
  ).length;

  const failed=selectedFiles.filter(
    file=>file.size>maxSize
  ).length;

  attachedCount.textContent=attached;
  failedCount.textContent=failed;

  fileStatusContainer.hidden=selectedFiles.length===0;
  emptyState.hidden=selectedFiles.length>0;

  fileInputContainer.classList.toggle(
    "has-file",
    selectedFiles.length>0
  );

  attachedButton.disabled=attached===0;
  failedButton.disabled=failed===0;

  if(activeFilter==="attached"&&attached===0)activeFilter="all";
  if(activeFilter==="failed"&&failed===0)activeFilter="all";
}


/* =========================================================
Filters
========================================================= */

attachedButton.addEventListener("click",()=>{
  if(attachedButton.disabled)return;

  activeFilter=activeFilter==="attached"?"all":"attached";
  applyFilter();
});

failedButton.addEventListener("click",()=>{
  if(failedButton.disabled)return;

  activeFilter=activeFilter==="failed"?"all":"failed";
  applyFilter();
});

function applyFilter(){
  const cards=fileStatusContainer.querySelectorAll(
    ".generated-file-card"
  );

  cards.forEach(card=>{
    const file=card._file;
    if(!file)return;

    if(activeFilter==="all"){
      card.hidden=false;
    }else if(activeFilter==="attached"){
      card.hidden=file.size>maxSize;
    }else if(activeFilter==="failed"){
      card.hidden=file.size<=maxSize;
    }
  });

  updateFilterButtons();
}

function updateFilterButtons(){
  attachedButton.classList.toggle(
    "active",
    activeFilter==="attached"
  );

  failedButton.classList.toggle(
    "active",
    activeFilter==="failed"
  );
}


/* =========================================================
Reset
========================================================= */

function resetFileState(){
  activeFilter="all";

  fileStatusContainer
    .querySelectorAll(".generated-file-card")
    .forEach(card=>{
      if(card._uploadInterval){
        clearInterval(card._uploadInterval);
      }
      card.remove();
    });

  fileStatusContainer.hidden=true;
  emptyState.hidden=false;
  fileInputContainer.classList.remove("has-file");

  attachedCount.textContent="0";
  failedCount.textContent="0";

  updateFilterButtons();

  attachedButton.disabled=true;
  failedButton.disabled=true;

  clearFileInputs();
}


/* =========================================================
Clear File Inputs
========================================================= */

function clearFileInputs(){
  cameraInput.value="";
  photoInput.value="";
  fileInput.value="";
}


/* =========================================================
Initial State
========================================================= */

updateUI();
updateFilterButtons();


// Next button validation
nextButton.addEventListener("click", () => {
  if (Number(failedCount.textContent) > 0) {
    /*failedButton.click();
    return;*/
    activeFilter = "failed";
    applyFilter();
    return;
  }

  window.location.href = "Step_5_index.html";
});
