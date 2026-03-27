const inp = document.getElementById("video_input");
const vid = document.getElementById("video_element");
const but = document.getElementById("dialog_button");
const char_count = document.getElementById("character_count");
const confirm_count = document.getElementById("count_confirm");

const anchor = document.getElementById("dialog_anchor");

let index = 0;
let cc = 0;

char_count.addEventListener("change", () => {
  cc = char_count.value;
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
      document.getElementById("character-" + i).disabled = true;
    }
    confirm_names.disabled = true;
  });

  document.getElementById("video_div").appendChild(confirm_names);

});

inp.addEventListener("change", () => {
  let file = inp.files[0];

  vid.src = URL.createObjectURL(file);
  vid.load();
});

but.addEventListener("click", () => {
  console.log(vid.currentTime);
  let time = Math.round(vid.currentTime * 100);
  
  let div = document.createElement("div");
  div.id = "dialog-" + index;
  div.style.display = "flex";

  index += 1;

  let inp_time = document.createElement("input");
  inp_time.type = "number";
  inp_time.value = time;
  inp_time.style.width = "50px";

  let inp_char = document.createElement("select");
  inp_char.style.width = "100px";

  let option = document.createElement("option");
  inp_char.appendChild(option);

  let inp_dialog = document.createElement("input");
  inp_dialog.type = "text";

  div.appendChild(inp_time);
  div.appendChild(inp_char);
  div.appendChild(inp_dialog);

  anchor.appendChild(div);
});

