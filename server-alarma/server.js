const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

// funcion para ajustar minutos menores a 10
const ajustaDigitos = (i) => {
  if (i < 10) i = "0" + i;
  return i;
};

// se inicializa el servidor
const server = express();
server.use(bodyParser.json());

// configuramos el acceso desde origenes distintos
server.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// POST /alarma/setear
server.post("/alarma/setear", (req, res, next) => {
  const hora = req.body.hora;
  const minutos = req.body.minutos;
  fs.writeFileSync("horaProg.txt", `${hora}`);
  fs.writeFileSync("minProg.txt", `${minutos}`);
  console.log("alarma programada desde cliente");

  res.status(201).json({
    mensaje: "Alarma programada exitosamente!",
    programada: `Alarma programada para ${hora}:${ajustaDigitos(minutos)}`,
  });
});

// GET /alarma/estado
server.get("/alarma/estado", (req, res, next) => {
  const today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  m = ajustaDigitos(m);
  const horaProg = fs
    .readFileSync(path.resolve(__dirname, "horaProg.txt"))
    .toString();
  const minProg = fs
    .readFileSync(path.resolve(__dirname, "minProg.txt"))
    .toString();
  console.log("comparando hora actual con: " + horaProg + ":" + minProg);

  // si la hora actual y programada coinciden, se actualiza el estado
  if (h > horaProg) {
    console.log("encendiendo alarma...");
    fs.writeFileSync(path.resolve(__dirname, "estado.txt"), "1");
  }
  if (h == horaProg) {
    if (m >= minProg) {
      console.log("encendiendo alarma...");
      fs.writeFileSync(path.resolve(__dirname, "estado.txt"), "1");
    }
  }
  // leemos el estado actual
  const estadoActual = fs
    .readFileSync(path.resolve(__dirname, "estado.txt"))
    .toString();
  console.log("enviando estado actual...");
  res.set("Content-Type", "text/plain");
  res.status(201).send(estadoActual);
});

// GET /alarma/apagar
server.get("/alarma/apagar", (req, res, next) => {
  const today = new Date();
  // guardamos valores inalcanzables para que no se prenda la alarma por error
  fs.writeFileSync("horaProg.txt", "24");
  fs.writeFileSync("minProg.txt", "60");
  // actualizamos el estado
  fs.writeFileSync("estado.txt", "0");
  io.emit("notifica", {
    mensaje: "Alarma apagada por arduino a las: " + today.toLocaleTimeString(),
  });
  console.log(
    "Alarma apagada por arduino a las: " + today.toLocaleTimeString()
  );
  res.set("Content-Type", "text/plain");
  res.status(201).send("Alarma apagada exitosamente");
});

// GET /alarma/cancelar
server.get("/alarma/cancelar", (req, res, next) => {
  // guardamos valores inalcanzables para que no se prenda la alarma por error
  fs.writeFileSync("horaProg.txt", "24");
  fs.writeFileSync("minProg.txt", "60");

  //actualizamos el estado
  fs.writeFileSync("estado.txt", "0");
  console.log("alarma cancelada desde aplicacion");
  res.status(201).json({
    mensaje: "Alarma cancelada!",
  });
});

// escoge el puerto del servidor y configura el uso de sockets
const servicio = server.listen(8080);
const io = require("socket.io")(servicio);
