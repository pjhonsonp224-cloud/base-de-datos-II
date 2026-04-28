document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. CONFIGURACIÓN DE ACCESO
    // ==========================================
    const ACCESO = { usuario: "upla2026", admin: "root2026" };

    // ==========================================
    // 2. DATOS INICIALES (PERMANENTES EN GITHUB)
    // ==========================================
    // Agrega aquí todas tus tareas. Estos datos se verán siempre en la web.
    const datosIniciales = [
        { 
            id: "semana1", 
            label: "Semana 1", 
            descripcion: "Guía paso a paso para la instalación y configuración de VMware Workstation.", 
            archivos: [
                { nombre: "Guia_VMware.pdf", enlace: "archivos/Guia_VMware.pdf" }
            ] 
        },
        { 
            id: "semana2", 
            label: "Semana 2", 
            descripcion: "Estudio de la arquitectura de base de datos: niveles físico, lógico y de vista.", 
            archivos: [
                { nombre: "Arquitectura_BD.pdf", enlace: "archivos/Arquitectura_BD.pdf" }
            ] 
        },
        { 
            id: "semana3", 
            label: "Semana 3", 
            descripcion: "Investigación sobre automatización y eficiencia tecnológica.", 
            archivos: [
                { nombre: "Tesis_Automatizacion.pdf", enlace: "archivos/Tesis_Automatizacion.pdf" }
            ] 
        },
        { 
            id: "semana4", 
            label: "Semana 4", 
            descripcion: "Informe comparativo de repositorios: GitHub, GitLab y Bitbucket.", 
            archivos: [
                { nombre: "Informe_Repositorios.pdf", enlace: "archivos/Informe_Repositorios.pdf" }
            ] 
        }
    ];

    // Carga desde LocalStorage si existe, si no, usa los datos iniciales de arriba
    let semanas = JSON.parse(localStorage.getItem('mi_repositorio_upla')) || datosIniciales;

    const contenedor = document.getElementById("contenedor-semanas");
    const modalLogin = document.getElementById("login-modal");
    const modalAdmin = document.getElementById("panel-admin-modal");
    const modalVisor = document.getElementById("modal-tarea");

    // ==========================================
    // 3. FUNCIONES DE PERSISTENCIA Y RENDER
    // ==========================================
    function guardar() {
        localStorage.setItem("mi_repositorio_upla", JSON.stringify(semanas));
        render();
    }

    function render() {
        contenedor.innerHTML = "";
        const semanasPorUnidad = 4;
        const totalUnidades = Math.ceil(semanas.length / semanasPorUnidad);

        for (let u = 0; u < totalUnidades; u++) {
            const unidad = document.createElement("section");
            unidad.className = "unidad";
            unidad.innerHTML = `<h2 class="titulo-unidad">📚 UNIDAD ${u + 1}</h2>`;

            const grid = document.createElement("div");
            grid.className = "grid-unidad";

            const inicio = u * semanasPorUnidad;
            const fin = inicio + semanasPorUnidad;

            semanas.slice(inicio, fin).forEach((s, i) => {
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

    // ==========================================
    // 4. LÓGICA DE LOGIN
    // ==========================================
    document.getElementById("admin-btn").onclick = () => {
        modalLogin.classList.add("mostrar");
    };

    document.getElementById("ejecutar-login").onclick = () => {
        const perfil = document.getElementById("login-perfil").value;
        const pass = document.getElementById("login-pass").value;

        if (pass === ACCESO[perfil]) {
            cerrarCualquierModal("login-modal");
            if (perfil === "admin") {
                abrirAdmin();
            } else {
                alert("Acceso como estudiante concedido.");
            }
        } else {
            alert("Contraseña incorrecta");
        }
        document.getElementById("login-pass").value = "";
    };

    // ==========================================
    // 5. PANEL ADMINISTRATIVO
    // ==========================================
    function abrirAdmin() {
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
                <button class="btn btn-primary admin-add-btn" onclick="nuevaSemana()">➕ Nueva Semana</button>
                <div id="lista-admin">
                    ${semanas.map((s, idx) => `
                        <div class="admin-card">
                            <div class="admin-card-top">
                                <input class="admin-input" value="${s.label}" onchange="actualizarNombre(${idx}, this.value)">
                                <span class="admin-badge">${s.archivos.length}</span>
                            </div>
                            <textarea class="admin-textarea" onchange="actualizarDescripcion(${idx}, this.value)">${s.descripcion}</textarea>
                            <div class="admin-actions">
                                <label class="admin-btn btn-upload">📂 Registrar archivo <input type="file" hidden onchange="subir(${idx}, this)"></label>
                                <button class="admin-btn btn-delete" onclick="borrarSemana(${idx})">🗑 Eliminar</button>
                            </div>
                            <div class="admin-files">
                                ${s.archivos.map((a, i) => `
                                    <div class="admin-file">
                                        <span>${a.nombre}</span>
                                        <div class="admin-file-actions">
                                            <button class="file-btn btn-remove" onclick="eliminarArchivo(${idx},${i})">❌</button>
                                        </div>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        </div>`;
        modalAdmin.classList.add("mostrar");
    }

    // ==========================================
    // 6. FUNCIONES GLOBALES (WINDOW)
    // ==========================================
    window.nuevaSemana = () => {
        const n = semanas.length + 1;
        semanas.push({ id: "semana" + n, label: "Semana " + n, descripcion: "", archivos: [] });
        guardar();
        abrirAdmin();
    };

    window.actualizarNombre = (i, v) => { semanas[i].label = v; guardar(); };
    window.actualizarDescripcion = (i, v) => { semanas[i].descripcion = v; guardar(); };
    window.borrarSemana = (i) => { if (confirm("¿Eliminar esta semana?")) { semanas.splice(i, 1); guardar(); abrirAdmin(); } };

    window.subir = (i, input) => {
        const file = input.files[0];
        if (!file) return;
        const ruta = "archivos/" + file.name;
        semanas[i].archivos.push({ nombre: file.name, enlace: ruta });
        alert("Archivo registrado. Recuerda subir el PDF real a la carpeta /archivos en tu repositorio.");
        guardar();
        abrirAdmin();
    };

    window.eliminarArchivo = (i, j) => { semanas[i].archivos.splice(j, 1); guardar(); abrirAdmin(); };

    // ==========================================
    // 7. VISOR DE TAREAS
    // ==========================================
    window.abrirVisor = (i) => {
        const s = semanas[i];
        modalVisor.innerHTML = `
        <div class="modal-overlay" onclick="cerrarCualquierModal('modal-tarea')"></div>
        <div class="modal-content">
            <div class="modal-top">
                <button class="btn-back" onclick="cerrarCualquierModal('modal-tarea')">← Regresar</button>
                <h3>${s.label}</h3>
            </div>
            <div class="viewer-container">
                <div class="viewer-sidebar">
                    <p style="font-size:0.8rem; color:#666; margin-bottom:10px;">Archivos adjuntos:</p>
                    ${s.archivos.map(a => `<div class="viewer-file" onclick="verArchivo('${a.enlace}','${a.nombre}')">📄 ${a.nombre}</div>`).join("")}
                </div>
                <div class="viewer-preview">
                    <div class="viewer-actions">
                        <a id="btn-descargar" class="viewer-btn btn-download" target="_blank">⬇ Descargar</a>
                        <button class="viewer-btn btn-github" onclick="window.open('https://github.com/')">🌐 GitHub</button>
                    </div>
                    <iframe id="viewer-frame" class="viewer-frame" src=""></iframe>
                </div>
            </div>
        </div>`;
        modalVisor.classList.add("mostrar");
        if (s.archivos.length > 0) {
            verArchivo(s.archivos[0].enlace, s.archivos[0].nombre);
        }
    };

    window.verArchivo = (url, nombre) => {
        const frame = document.getElementById("viewer-frame");
        const btn = document.getElementById("btn-descargar");
        frame.src = url;
        btn.href = url;
        btn.setAttribute("download", nombre);
    };

    window.cerrarCualquierModal = (id) => {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove("mostrar");
    };

    // Renderizado inicial
    render();
});
