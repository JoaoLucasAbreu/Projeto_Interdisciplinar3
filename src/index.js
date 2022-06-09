const mqtt = require("mqtt");
let cliente = null;
const prefixoLampada = "cmnd/tasmota_CE2803/";
const prefixoTomada = "cmnd/tasmota_CF971C/";

function enviarComandoMQTT(topico, payload) {
	if (cliente)
		cliente.publish(topico, payload, { qos: 2 });
	else
		console.log("Cliente null");
}

function iniciarMQTT() {
	try {
		console.log("Conectando ao broker MQTT...");

		cliente = mqtt.connect("mqtt://broker.hivemq.com", {
			clientId: "br_espm_proj_iii_" + (new Date()).getTime(),
			clean: true,
			reconnectPeriod: 1000,
			connectTimeout: 30 * 1000,
			keepalive: 10
		});

		cliente.on("connect", function () {
			console.log("Conectado ao broker MQTT!");
		});

		cliente.on("disconnect", function () {
			console.log("Desconectado do broker MQTT!");
		});

		cliente.on("reconnect", function () {
			console.log("Reconectando ao broker MQTT...");
		});

		cliente.on("close", function () {
			console.log("Terminado");
		});

		cliente.on("offline", function () {
			console.log("Offline");
		});

		cliente.on("erro", function (error) {
			console.log("Erro: " + (error.message || error.toString()));
		});
	} catch (ex) {
		console.log("Exceção: " + (ex.message || ex.toString()));
	}
}

iniciarMQTT();

const path = require("path");
const express = require("express");

const app = express();

// Configura o middleware de arquivos estáticos para responder às
// rotas iniciadas por "/public", servindo o conteúdo da pasta "../public".
app.use("/public", express.static(path.join(__dirname, "../public"), {
	// Aqui estamos configurando o cache dos arquivos estáticos... Muito
	// útil em ambientes de produção, mas deve-se ter cuidado durante a
	// fase de desenvolvimento.
	cacheControl: true,
	etag: false,
	maxAge: "30d"
}));

app.use(express.json());
// http://expressjs.com/en/api.html#express.urlencoded
app.use(express.urlencoded({ extended: true }));

// Esse middle serve para evitar cache das páginas e api no geral. Ele também fica
// aqui, depois do middleware de arquivos estáticos, pois os arquivos static devem
// usar cache em ambiente de produção.
app.use((req, res, next) => {
	res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
	res.header("Expires", "-1");
	res.header("Pragma", "no-cache");
	next();
});

// Especifica quais módulos serão responsáveis por servir cada rota, a partir dos
// endereços requisitados pelo cliente.
//
// A string no primeiro parâmetro representa o começo do caminho requisitado. Vamos
// ver alguns exemplos de caminhos, e como eles seriam tratados pelo Express, assumindo
// a existência dos seguintes tratadores:
//
// - index, registrado com o prefixo "/", e com as rotas internas "/" e "/outra"
// - usuario, registrado com o prefixo "/usuario", e com as rotas internas "/" e "/novo"
//
// Caminho completo pedido pelo cliente  Caminho repassado para o tratador   Tratador e resultado
// /                                     /                                   index (OK)
// /usuario                              /                                   usuario (OK)
// /usuario/novo                         /novo                               usuario (OK)
// /usuario/alterar                      /alterar                            usuario (Erro, não temos /alterar em usuario)
// /outra                                /outra                              index (OK)
// /usuarioteste                         /usuarioteste                       index (Erro, não temos /usuarioteste em index)
//
// https://expressjs.com/en/guide/routing.html

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "../views/index.html"));
});

app.get("/lampada/Power/:modo", (req, res) => {
	const modo = parseInt(req.params.modo);
	if (modo >= 0 && modo <= 3) {
		enviarComandoMQTT(prefixoLampada + "Power", modo.toString());
		res.json(true);
	} else {
		res.status(400).json("Modo inválido!");
	}
});

app.get("/lampada/BlinkTime/:tempo", (req, res) => {
	const tempo = parseInt(req.params.tempo);
	if (tempo >= 2) {
		enviarComandoMQTT(prefixoLampada + "BlinkTime", tempo.toString());
		res.json(true);
	} else {
		res.status(400).json("Tempo inválido!");
	}
});

app.get("/lampada/BlinkCount/:contagem", (req, res) => {
	const contagem = parseInt(req.params.contagem);
	if (contagem >= 0) {
		enviarComandoMQTT(prefixoLampada + "BlinkCount", contagem.toString());
		res.json(true);
	} else {
		res.status(400).json("Contagem inválida!");
	}
});

app.get("/lampada/Color/:rgb", (req, res) => {
	const rgb = req.params.rgb;
	if (rgb && rgb.length === 6) {
		enviarComandoMQTT(prefixoLampada + "Color","#" + rgb + "0000");
		res.json(true);
	} else {
		res.status(400).json("Cor inválida!");
	}
});

app.get("/tomada/Power/:modo", (req, res) => {
	const modo = parseInt(req.params.modo);
	if (modo >= 0 && modo <= 2) {
		enviarComandoMQTT(prefixoTomada + "Power", modo.toString());
		res.json(true);
	} else {
		res.status(400).json("Modo inválido!");
	}
});

// Depois de registrados todos os caminhos das rotas e seus tratadores, registramos
// os tratadores que serão chamados caso nenhum dos tratadores anteriores tenha
// devolvido alguma resposta.
//
// O Express diferencia um tratador regular (como os anteriores) de um tratador
// de erros, como esse aqui abaixo, pela quantidade de parâmetros!!!
//
// Isso é possível, porque em JavaScript, f.length retorna a quantidade
// de parâmetros declarados na função f!!!
app.use((req, res, next) => {
	// Esse aqui é um tratador comum, que será executado ao final da lista,
	// quando nenhum outro tratador retornou algum conteúdo. Ou seja...
	// O que o cliente pediu não foi encontrado!
	const err = new Error("Não encontrado");
	err.status = 404;

	// Executa o próximo tratador na sequência passando apenas o erro,
	// de modo que esse caso particular seja tratado como um erro qualquer
	// do sistema.
	next(err);
});

app.use((err, req, res, next) => {
	// Se nenhum status foi definido até aqui, definimos o status 500.
	const status = err.status || 500
	res.status(status);

	// Em vez de send, poderíamos ter utilizado render() para devolver
	// uma página de verdade.
	res.send("Erro " + status + " ocorrido: " + (err.message || err.toString()));
});

const server = app.listen(3000, "0.0.0.0", () => {
	console.log("Servidor executando na porta " + server.address().port);
});
