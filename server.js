const http = require('http');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const express = require('express');
const cors = require('cors');
const {
  createLightship
} = require('lightship')


if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < 3; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {

	const lightship = createLightship()
	const app = express();

	app.use(cors());

	const PORT = 3001;

	console.log('ENV ' + process.env.NODE_ENV);

	app.post('/hello', (req, res) => {
		console.log('World !');
		res.sendStatus(200).end();
	});

	const httpServer = http.createServer(app);
	const pid = process.pid;

	httpServer.listen(PORT, () => {
		lightship.signalReady()
		console.log(`Server running in port ${PORT} - PID ${pid}`);
	});

	lightship.registerShutdownHandler(() => {
	  httpServer.close();
	});
	 

	lightship.signalReady();
}