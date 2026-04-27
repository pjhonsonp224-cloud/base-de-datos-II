document.addEventListener("DOMContentLoaded", function () {

const ACCESO = { usuario: "upla2026", admin: "root2026" };

let semanas = JSON.parse(localStorage.getItem('mi_repositorio_upla')) || [
  { id:"semana1", label:"Semana 1", descripcion:"Trabajo inicial", archivos:[] }
];

const contenedor = document.getElementById("contenedor-semanas");
const modalLogin = document.getElementById("login-modal");
const modalAdmin = document.getElementById("panel-admin-modal");
const modalVisor = document.getElementById("modal-tarea");

/* =========================
   GUARDAR Y RENDER
========================= */
function guardar(){
  localStorage.setItem("mi_repositorio_upla", JSON.stringify(semanas));
  render();
}

/* =========================
   RENDER CON UNIDADES
========================= */
function render(){
  contenedor.innerHTML = "";

  const semanasPorUnidad = 4;
  const totalUnidades = Math.ceil(semanas.length / semanasPorUnidad);

  for(let u = 0; u < totalUnidades; u++){

    const unidad = document.createElement("section");
    unidad.className = "unidad";

    unidad.innerHTML = `
      <h2 class="titulo-unidad">📚 UNIDAD ${u + 1}</h2>
    `;

    const grid = document.createElement("div");
    grid.className = "grid-unidad";

    const inicio = u * semanasPorUnidad;
    const fin = inicio + semanasPorUnidad;

    semanas.slice(inicio, fin).forEach((s,i)=>{
      const indexReal = inicio + i;

      const div = document.createElement("div");
      div.className = "tarjeta-semana";
      div.innerHTML = `<div class="tarjeta-semana-title">${s.label}</div>`;
      div.onclick = () => abrirVisor(indexReal);

      grid.appendChild(div);
    });

    unidad.appendChild(grid);
    contenedor.appendChild(unidad);
  }

  document.getElementById("footer-year").textContent = new Date().getFullYear();
}

/* =========================
   LOGIN
========================= */
document.getElementById("admin-btn").onclick = ()=>{
  modalLogin.classList.add("mostrar");
};

document.getElementById("ejecutar-login").onclick = ()=>{
  const perfil = document.getElementById("login-perfil").value;
  const pass = document.getElementById("login-pass").value;

  if(pass === ACCESO[perfil]){
    cerrarCualquierModal("login-modal");

    if(perfil === "admin"){
      abrirAdmin();
    } else {
      alert("Acceso como estudiante");
    }
  } else {
    alert("Contraseña incorrecta");
  }

  document.getElementById("login-pass").value="";
};

/* =========================
   PANEL ADMIN
========================= */
function abrirAdmin(){

modalAdmin.innerHTML = `
<div class="modal-overlay" onclick="cerrarCualquierModal('panel-admin-modal')"></div>

<div class="modal-content">

<div class="modal-top">
<h3>⚙️ Panel Administrativo</h3>
<button class="btn-close" onclick="cerrarCualquierModal('panel-admin-modal')">✕</button>
</div>

<div class="modal-body">

<div class="admin-summary">
  <div>📊 Total semanas</div>
  <span>${semanas.length}</span>
</div>

<button class="btn btn-primary admin-add-btn" onclick="nuevaSemana()">
  ➕ Nueva Semana
</button>

<div id="lista-admin">

${semanas.map((s,idx)=>`

<div class="admin-card">

  <div class="admin-card-top">
    <input class="admin-input"
      value="${s.label}"
      onchange="actualizarNombre(${idx}, this.value)">
    
    <span class="admin-badge">${s.archivos.length}</span>
  </div>

  <textarea class="admin-textarea"
    onchange="actualizarDescripcion(${idx}, this.value)">${s.descripcion}</textarea>

  <div class="admin-actions">
    <label class="admin-btn btn-upload">
      📂 Registrar archivo
      <input type="file" hidden onchange="subir(${idx}, this)">
    </label>

    <button class="admin-btn btn-delete"
      onclick="borrarSemana(${idx})">
      🗑 Eliminar
    </button>
  </div>

  <div class="admin-files">
    ${s.archivos.map((a,i)=>`
      <div class="admin-file">
        <span>${a.nombre}</span>

        <div class="admin-file-actions">
          <button class="file-btn btn-view" onclick="verArchivoAdmin('${a.enlace}')">👁</button>
          <button class="file-btn btn-remove" onclick="eliminarArchivo(${idx},${i})">❌</button>
        </div>
      </div>
    `).join("")}
  </div>

</div>

`).join("")}

</div>
</div>
</div>
`;

modalAdmin.classList.add("mostrar");
}

/* =========================
   FUNCIONES ADMIN
========================= */

window.nuevaSemana = ()=>{
  if(confirm("¿Deseas agregar una nueva semana?")){
    const n = semanas.length + 1;
    semanas.push({
      id:"semana"+n,
      label:"Semana "+n,
      descripcion:"Nueva tarea",
      archivos:[]
    });
    guardar();
    abrirAdmin();
  }
};

window.actualizarNombre = (i,valor)=>{
  if(valor.trim() === ""){
    alert("❌ El título no puede estar vacío");
    return;
  }
  semanas[i].label = valor;
  guardar();
};

window.actualizarDescripcion = (i,valor)=>{
  semanas[i].descripcion = valor;
  guardar();
};

window.borrarSemana = (i)=>{
  if(confirm("¿Eliminar esta semana?")){
    semanas.splice(i,1);
    guardar();
    abrirAdmin();
  }
};

/* =========================
   REGISTRAR ARCHIVO (RUTA)
========================= */
window.subir = (i,input)=>{
  const file = input.files[0];
  if(!file) return;

  const ruta = "archivos/" + file.name;

  semanas[i].archivos.push({
    nombre: file.name,
    enlace: ruta
  });

  alert("⚠️ Archivo registrado.\nColócalo manualmente en la carpeta /archivos");

  guardar();
  abrirAdmin();
};

window.eliminarArchivo = (i,j)=>{
  semanas[i].archivos.splice(j,1);
  guardar();
  abrirAdmin();
};

window.verArchivoAdmin = (url)=>{
  window.open(url);
};

/* =========================
   VISOR
========================= */
function abrirVisor(i){

const s = semanas[i];

modalVisor.innerHTML = `
<div class="modal-overlay" onclick="cerrarCualquierModal('modal-tarea')"></div>

<div class="modal-content">

<div class="modal-top">

  <button class="btn-back" onclick="cerrarCualquierModal('modal-tarea')">
    ← Regresar
  </button>

  <h3 id="titulo-semana">${s.label}</h3>

</div>

<div class="viewer-container">

  <div class="viewer-sidebar">
    ${s.archivos.map(a=>`
      <div class="viewer-file"
        onclick="verArchivo('${a.enlace}','${a.nombre}')">
        📄 ${a.nombre}
      </div>
    `).join("")}
  </div>

  <div class="viewer-preview">

    <div class="viewer-actions">
      <a id="btn-descargar" class="viewer-btn btn-download">⬇ Descargar</a>
      <button class="viewer-btn btn-github"
        onclick="window.open('https://github.com/pjhonsonp224-cloud/base-de-datos-II.git')">
        🌐 GitHub
      </button>
    </div>

    <iframe id="viewer-frame" class="viewer-frame"></iframe>

  </div>

</div>

</div>
`;

modalVisor.classList.add("mostrar");

if(s.archivos[0]){
  verArchivo(s.archivos[0].enlace, s.archivos[0].nombre);
}
}

/* =========================
   VER ARCHIVO
========================= */
window.verArchivo = (url,nombre)=>{
  const frame = document.getElementById("viewer-frame");
  const btn = document.getElementById("btn-descargar");

  frame.style.display = "block";
  frame.src = "";

  fetch(url, { method: 'HEAD' })
    .then(res => {
      if(!res.ok) throw new Error();

      btn.href = url;
      btn.setAttribute("download", nombre);

      if(nombre.match(/\.(pdf|png|jpg|jpeg)$/i)){
        frame.src = url;
      } else {
        frame.style.display = "none";
        frame.parentElement.innerHTML = `
          <div style="display:flex;justify-content:center;align-items:center;height:100%;">
            <div style="text-align:center;">
              <p>⚠️ No se puede previsualizar</p>
              <a href="${url}" download class="btn btn-primary">⬇ Descargar</a>
            </div>
          </div>
        `;
      }

    })
    .catch(()=>{
      frame.style.display = "none";
      frame.parentElement.innerHTML = `
        <div style="display:flex;justify-content:center;align-items:center;height:100%;">
          <div style="text-align:center;">
            <p style="color:red;">❌ Archivo no encontrado</p>
            <p>Ubícalo en la carpeta <b>/archivos</b></p>
          </div>
        </div>
      `;
    });
};

/* =========================
   UTIL
========================= */
window.cerrarCualquierModal = (id)=>{
  document.getElementById(id).classList.remove("mostrar");
};

render();

});
