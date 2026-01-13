
// Función cerrar sesión.

function cerrarSesion() {
    localStorage.removeItem("usuarioActivo");

    // Redirección forzada (evita quedarse en dashboard).
    window.location.replace("index.html");
}

// Protección del dashboard.

document.addEventListener("DOMContentLoaded", function () {

    if (window.location.pathname.includes("dashboard.html")) {

        let usuarioActivo = localStorage.getItem("usuarioActivo");

        if (!usuarioActivo) {
            window.location.replace("index.html");
            return;
        }

        cargarDatos();
    }
});

// Registo.

function registrar() {
    let usuario = $("#usuario").val().trim();
    let password = $("#password").val().trim();

    if (usuario === "" || password === "") {
        $("#mensaje").text("Complete todos los campos");
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

    if (usuarios[usuario]) {
        $("#mensaje").text("El usuario ya existe");
        return;
    }

    usuarios[usuario] = {
        password: password,
        saldo: 0,
        historial: []
    };

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    $("#mensaje")
        .text("Usuario registrado correctamente")
        .removeClass("text-danger")
        .addClass("text-success");
}


// Login.

function login() {
    let usuario = $("#usuario").val().trim();
    let password = $("#password").val().trim();

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

    if (!usuarios[usuario] || usuarios[usuario].password !== password) {
        $("#mensaje").text("Credenciales incorrectas");
        return;
    }

    localStorage.setItem("usuarioActivo", usuario);

    // Redirección limpia.
    window.location.replace("dashboard.html");
}

// Carga de datos.

function cargarDatos() {
    let usuario = localStorage.getItem("usuarioActivo");
    let usuarios = JSON.parse(localStorage.getItem("usuarios"));

    $("#saldo").text(usuarios[usuario].saldo);
    mostrarHistorial(usuarios[usuario].historial);
}

// Depósito y retiro.

function depositar() {
    operarSaldo("deposito");
}

function retirar() {
    operarSaldo("retiro");
}

function operarSaldo(tipo) {
    let monto = Number($("#monto").val());

    if (isNaN(monto) || monto <= 0) {
        alert("Ingrese un monto válido");
        return;
    }

    let usuario = localStorage.getItem("usuarioActivo");
    let usuarios = JSON.parse(localStorage.getItem("usuarios"));

    if (tipo === "retiro" && usuarios[usuario].saldo < monto) {
        alert("Saldo insuficiente");
        return;
    }

    if (tipo === "deposito") {
        usuarios[usuario].saldo += monto;
        usuarios[usuario].historial.push(`DEPÓSITO: $${monto}`);
    } else {
        usuarios[usuario].saldo -= monto;
        usuarios[usuario].historial.push(`RETIRO: $${monto}`);
    }

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    $("#monto").val("");
    cargarDatos();
}

//Envío de dinero con nombre asignado.

function enviarDinero() {
    let destino = $("#destino").val().trim();
    let monto = Number($("#montoEnvio").val());

    let usuario = localStorage.getItem("usuarioActivo");
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};

    if (destino === "" || isNaN(monto) || monto <= 0) {
        alert("Datos inválidos");
        return;
    }

    if (usuarios[usuario].saldo < monto) {
        alert("Saldo insuficiente");
        return;
    }

    if (!usuarios[destino]) {
        usuarios[destino] = {
            password: "1234",
            saldo: 0,
            historial: []
        };
    }

    usuarios[usuario].saldo -= monto;
    usuarios[destino].saldo += monto;

    usuarios[usuario].historial.push(`ENVÍO a ${destino}: $${monto}`);
    usuarios[destino].historial.push(`RECIBIDO de ${usuario}: $${monto}`);

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    $("#destino").val("");
    $("#montoEnvio").val("");

    cargarDatos();
}

// Historial.

function mostrarHistorial(historial) {
    $("#historial").html("");
    historial.forEach(item => {
        $("#historial").append(`<li class="list-group-item">${item}</li>`);
    });
}