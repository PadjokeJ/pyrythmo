const inp = document.getElementById("video_input");
const ryf = document.getElementById("rythmo_input");
const vid = document.getElementById("video_element");
const but = document.getElementById("dialog_button");
const char_count = document.getElementById("character_count");
const confirm_count = document.getElementById("count_confirm");
const content = document.getElementById("content");

const anchor = document.getElementById("dialog_anchor");

const canvas = document.getElementById("dialog_canvas");

let index = 0;
let cc = 0;

var charas = [];

char_count.addEventListener("change", () => {
  cc = Number(char_count.value);
  canvas.height = cc * 50;
});
confirm_count.addEventListener("click", () => {
  char_count.disabled = true;
  confirm_count.disabled = true;

  for (let i = 0; i < cc; i++) {
    let chara = document.createElement("input");
    chara.type = "text";
    chara.id = "character-" + i;
    document.getElementById("video_div").appendChild(chara);
  }
  let confirm_names = document.createElement("button");
  confirm_names.innerText = "Confirmer";
  confirm_names.addEventListener("click", () => {
    for (let i = 0; i < cc; i++) {
      let a = document.getElementById("character-" + i);
      a.disabled = true;
      charas.push(a.value);
    }
    confirm_names.disabled = true;
    but.disabled = false;
  });

  document.getElementById("video_div").appendChild(confirm_names);

});

inp.addEventListener("change", () => {
  let file = inp.files[0];

  vid.src = URL.createObjectURL(file);
  vid.load();
});

function addDialog() {
  let time = Math.round(vid.currentTime * 100);
  
  let div = document.createElement("div");
  div.id = "dialog-" + index;
  div.style.display = "flex";

  let inp_time = document.createElement("input");
  inp_time.type = "number";
  inp_time.value = time;
  inp_time.style.width = "50px";
  inp_time.id = "dialog-time-" + index;

  let inp_char = document.createElement("select");
  inp_char.style.width = "100px";
  inp_char.id = "dialog-char-" + index;

  for (let i = 0; i < charas.length; i++) {
    let option = document.createElement("option");
    option.innerText = charas[i];

    inp_char.appendChild(option);
  }

  let inp_dialog = document.createElement("input");
  inp_dialog.type = "text";
  inp_dialog.id = "dialog-text-" + index;

  let del_div = document.createElement("button");
  del_div.id = "del_dialog-" + index;
  del_div.style.width = "30px";
  del_div.innerText = "-";
  del_div.addEventListener("click", () => {
    anchor.removeChild(div);
  });

  div.appendChild(inp_time);
  div.appendChild(inp_char);
  div.appendChild(inp_dialog);
  div.appendChild(del_div);
  
  anchor.appendChild(div);

}
but.addEventListener("click", () => { 
  addDialog();
  index += 1;
});

const ctx = canvas.getContext("2d");

ctx.font = "25px Arial";

setInterval(() => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(20, canvas.height);
  ctx.stroke();

  for (let i = 0; i < cc; i++) {
    let y = i * 50 + 60;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  for (let i = 0; i < index; i++) {
    if (!document.getElementById("dialog-text-" + i)) continue;

    let d = document.getElementById("dialog-text-" + i);
    let t = document.getElementById("dialog-time-" + i);
    let c = document.getElementById("dialog-char-" + i);
    let y = charas.indexOf(c.value) * 50 + 50;
    ctx.fillText(d.value, 20 + Number(t.value) * .80 - vid.currentTime * 80, y - 10);

  }
}, 50);

document.getElementById("export").addEventListener("click", () => {
  if (!!document.getElementById("video_result"))
    content.removeChild(document.getElementById("video_result"));
  let arr = [];
  arr.push(1920);
  arr.push(cc * 50);
  if (!vid.duration) {
    alert("durée de vidéo invalide !");
    return;
  }
  arr.push(Math.round(vid.duration));
  arr.push(cc);

  for (let i = 0; i < cc; i++) {
    arr.push(charas[i]);
  }
  arr.push("");

  console.log("exporting");
  for (let i = 0; i < index; i++) {
    if (!document.getElementById("dialog-text-" + i)) continue;

    let d = document.getElementById("dialog-text-" + i);
    let t = document.getElementById("dialog-time-" + i);
    let c = document.getElementById("dialog-char-" + i);
    arr.push(String(Number(t.value)) + ":" + c.value + ":" + d.value);
  }
  arr.push("");

  const content = arr.join("\n");
  const blob = new Blob([content], { type: "text/plain" });

 // const url = URL.createObjectURL(blob);

  let form = new FormData();
  form.append("file", blob);
  getRythmo(form); 
});

async function getRythmo(form) {
  alert("Création de vidéo en cours...");
  const res = await fetch("/upload", {method: "POST", body: form});
  if (!res.ok) {
    if (res.status == 429) {
      alert("trop de requêtes en une minute, veuillez ressayer plus tard");
      return;
    }
    alert("Erreur ! : " + res.status);
    return;
  }

  const vid = await res.blob();
  const url = URL.createObjectURL(vid);

  let a = document.createElement("a");
  a.href = url;
  a.innerText = "Télécharger";
  a.download= "rythmo.mp4";

  a.id = "video_result";

  content.appendChild(a);
}

function loadRythmo(text) {
  let arr = text.split("\n");

  let ncara = Number(arr[3]);
  for (let i = 4; i < 4 + ncara; i++) {
    charas.push(arr[i]);
  }
  for (let i = 4 + ncara + 1; i < arr.length; i++) {
    addDialog();
    if (arr[i].length == 0) continue;
    let curr = arr[i].split(":");
    console.log(arr[i]);
    let time = curr[0];
    let ntim = Number(time);
    let cara = curr[1];
    let inde = time.length + cara.length + 2;
    let dial = arr[i].substring(inde);

    document.getElementById("dialog-time-" + index).value = ntim;
    document.getElementById("dialog-char-" + index).value = cara;
    document.getElementById("dialog-text-" + index).value = dial;

    index += 1;
  }

}

ryf.addEventListener("change", () => {
  let file = ryf.files[0];
  
  const reader = new FileReader();
  reader.onload = () => {
    loadRythmo(reader.result);
    document.getElementById("count_confirm").disabled = true;
    ryf.disabled = true;
  };
  reader.onerror = () => {
    alert("erreur lisant fichier");
  }

  reader.readAsText(file);
  
});
