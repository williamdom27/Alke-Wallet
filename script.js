/* =====================================================
   TOASTS (ALERTAS ARRIBA – AZUL / GRIS)
===================================================== */

function mostrarToast(texto, tipo = "primary") {

    if ($(".toast-container-custom").length === 0) {
        $("body").append('<div class="toast-container-custom"></div>');
    }

    const toastHTML = `
        <div class="toast align-items-center text-bg-${tipo} border-0 mb-2">
            <div class="d-flex">
                <div class="toast-body fw-semibold">${texto}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto"
                        data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    const toastElement = $(toastHTML);
    $(".toast-container-custom").append(toastElement);

    const toast = new bootstrap.Toast(toastElement[0], {
        delay: 3000,
        autohide: true
    });

    toast.show();

    toastElement.on("hidden.bs.toast", () => toastElement.remove());
}

/* =====================================================
   UTILIDAD MÓVIL
===================================================== */

function cerrarTeclado() {
    document.activeElement.blur();
}

/* =====================================================
   SESIÓN
===================================================== */

function cerrarSesion() {
    localStorage.removeItem("usuarioActivo");
    window.location.replace("Loggin.html");
}

document.addEventListener("DOMContentLoaded", () => {
    if (location.pathname.includes("MenúBancario.html")) {
        if (!localStorage.getItem("usuarioActivo")) {
            window.location.replace("Loggin.html");
            return;
        }
        cargarDatos();
    }
});

/* =====================================================
   LOGIN / REGISTRO
===================================================== */

function registrar() {
    const usuario = $("#usuario").val().trim();
    const password = $("#password").val().trim();

    if (!usuario || !password) {
        mostrarToast("Complete todos los campos", "secondary");
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

    if (usuarios[usuario]) {
        mostrarToast("El usuario ya existe", "secondary");
        return;
    }

    usuarios[usuario] = {
        password,
        saldo: 0,
        historial: []
    };

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    mostrarToast("Usuario registrado correctamente", "primary");
    cerrarTeclado();
}

function login() {
    const usuario = $("#usuario").val().trim();
    const password = $("#password").val().trim();
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

    if (!usuarios[usuario] || usuarios[usuario].password !== password) {
        mostrarToast("Credenciales incorrectas", "secondary");
        return;
    }

    localStorage.setItem("usuarioActivo", usuario);
    window.location.replace("MenúBancario.html");
}

/* =====================================================
   CARGA DE DATOS
===================================================== */

function cargarDatos() {
    const usuario = localStorage.getItem("usuarioActivo");
    const usuarios = JSON.parse(localStorage.getItem("usuarios"));

    $("#saldo").text(usuarios[usuario].saldo);
    mostrarHistorial(usuarios[usuario].historial);
}

/* =====================================================
   OPERACIONES
===================================================== */

function depositar() {
    operarSaldo("deposito");
}

function retirar() {
    operarSaldo("retiro");
}

function operarSaldo(tipo) {
    const monto = Number($("#monto").val());
    const usuario = localStorage.getItem("usuarioActivo");
    const usuarios = JSON.parse(localStorage.getItem("usuarios"));

    if (!monto || monto <= 0) {
        mostrarToast("Ingrese un monto válido", "secondary");
        return;
    }

    if (tipo === "retiro" && usuarios[usuario].saldo < monto) {
        mostrarToast("Saldo insuficiente", "secondary");
        return;
    }

    if (tipo === "deposito") {
        usuarios[usuario].saldo += monto;
        usuarios[usuario].historial.push(`➕ Depósito: $${monto}`);
        mostrarToast("Depósito realizado", "primary");
    } else {
        usuarios[usuario].saldo -= monto;
        usuarios[usuario].historial.push(`➖ Retiro: $${monto}`);
        mostrarToast("Retiro realizado", "secondary");
    }

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    $("#monto").val("");
    cerrarTeclado();
    cargarDatos();
}

/* =====================================================
   TRANSFERENCIAS
===================================================== */

function enviarDinero() {
    const destino = $("#destino").val().trim();
    const monto = Number($("#montoEnvio").val());
    const usuario = localStorage.getItem("usuarioActivo");
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

    if (!destino || !monto || monto <= 0) {
        mostrarToast("Datos inválidos", "secondary");
        return;
    }

    if (!usuarios[destino]) {
        mostrarToast("Usuario destino no existe", "secondary");
        return;
    }

    if (usuarios[usuario].saldo < monto) {
        mostrarToast("Saldo insuficiente", "secondary");
        return;
    }

    usuarios[usuario].saldo -= monto;
    usuarios[destino].saldo += monto;

    usuarios[usuario].historial.push(`📤 Envío a ${destino}: $${monto}`);
    usuarios[destino].historial.push(`📥 Recibido de ${usuario}: $${monto}`);

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    $("#destino").val("");
    $("#montoEnvio").val("");
    cerrarTeclado();

    mostrarToast("Transferencia exitosa", "primary");
    cargarDatos();
}

/* =====================================================
   HISTORIAL (MÁS RECIENTE ARRIBA)
===================================================== */

function mostrarHistorial(historial) {
    $("#historial").html("");

    // Mostrar desde la transacción más reciente
    [...historial].reverse().forEach(item => {
        let clase = "list-group-item";

        if (item.includes("Depósito") || item.includes("Envío")) {
            clase += " text-primary";
        } else {
            clase += " text-secondary";
        }

        $("#historial").append(`<li class="${clase}">${item}</li>`);
    });
}